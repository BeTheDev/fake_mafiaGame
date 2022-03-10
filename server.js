/* CONFIGURATION */

const OpenVidu = require("openvidu-node-client").OpenVidu
const OpenViduRole = require("openvidu-node-client").OpenViduRole

// Check launch arguments: must receive openvidu-server URL and the secret
if (process.argv.length != 4) {
  console.log("Usage: node " + __filename + " OPENVIDU_URL OPENVIDU_SECRET")
  process.exit(-1)
}
// For demo purposes we ignore self-signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

// Node imports
const express = require("express")
const fs = require("fs")
const session = require("express-session")
const https = require("https")
const bodyParser = require("body-parser") // Pull information from HTML POST (express4)
const app = express() // Create our app with express
const port = 5000
const morgan = require("morgan")
const userRouter = require("./routes/user")
const roomRouter = require("./routes/room")

app.use(morgan("dev"))
// Server configuration
app.use(
  session({
    saveUninitialized: true,
    resave: false,
    secret: "MY_SECRET",
  })
)
app.use(express.static(__dirname + "/public")) // Set the static files location
app.use(
  bodyParser.urlencoded({
    extended: "true",
  })
) // Parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // Parse application/json
app.use(
  bodyParser.json({
    type: "application/vnd.api+json",
  })
) // Parse application/vnd.api+json as json
app.set("view engine", "ejs") // Embedded JavaScript as template engine

// Listen (start app with node server.js)
var options = {
  key: fs.readFileSync("openvidukey.pem"),
  cert: fs.readFileSync("openviducert.pem"),
}
https.createServer(options, app).listen(5000)

// Mock database
var users = [
  {
    user: "publisher1",
    pass: "pass",
    role: OpenViduRole.PUBLISHER,
  },
  {
    user: "publisher2",
    pass: "pass",
    role: OpenViduRole.PUBLISHER,
  },
]

// Environment variable: URL where our OpenVidu server is listening
var OPENVIDU_URL = process.argv[2]
// Environment variable: secret shared with our OpenVidu server
var OPENVIDU_SECRET = process.argv[3]

// Entrypoint to OpenVidu Node Client SDK
var OV = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET)

// Collection to pair session names with OpenVidu Session objects
var mapSessions = {}
// Collection to pair session names with tokens
var mapSessionNamesTokens = {}

/* CONFIGURATION */

// connect DataBase
const db = require("./models")
db.sequelize
  .sync()
  .then(() => {
    console.log("mafia app DB connected")
  })
  .catch(console.error)

app.use("/api", [userRouter, roomRouter])

app.get("/", (req, res) => {
  res.send("hello world")
})

app.post("/session", (req, res) => {
  if (!isLogged(req.session)) {
    req.session.destroy()
    res.redirect("/")
  } else {
    // The nickname sent by the client
    var clientData = req.body.data
    // The video-call to connect
    var sessionName = req.body.sessionname

    // Role associated to this user
    var role = users.find((u) => u.user === req.session.nickName).role

    // Optional data to be passed to other users when this user connects to the video-call
    // In this case, a JSON with the value we stored in the req.session object on login
    var serverData = JSON.stringify({ serverData: req.session.loggedUser })

    console.log("Getting a token | {sessionName}={" + sessionName + "}")

    // Build connectionProperties object with the serverData and the role
    var connectionProperties = {
      data: serverData,
      role: role,
    }

    if (mapSessions[sessionName]) {
      // Session already exists
      console.log("Existing session " + sessionName)

      // Get the existing Session from the collection
      var mySession = mapSessions[sessionName]

      // Generate a new token asynchronously with the recently created connectionProperties
      mySession
        .createConnection(connectionProperties)
        .then((connection) => {
          // Store the new token in the collection of tokens
          mapSessionNamesTokens[sessionName].push(connection.token)

          // Return session template with all the needed attributes
          res.render("session.ejs", {
            sessionId: mySession.getSessionId(),
            token: connection.token,
            nickName: clientData,
            userName: req.session.loggedUser,
            sessionName: sessionName,
          })
        })
        .catch((error) => {
          console.error(error)
        })
    } else {
      // New session
      console.log("New session " + sessionName)

      // Create a new OpenVidu Session asynchronously
      OV.createSession()
        .then((session) => {
          // Store the new Session in the collection of Sessions
          mapSessions[sessionName] = session
          // Store a new empty array in the collection of tokens
          mapSessionNamesTokens[sessionName] = []

          // Generate a new token asynchronously with the recently created connectionProperties
          session
            .createConnection(connectionProperties)
            .then((connection) => {
              // Store the new token in the collection of tokens
              mapSessionNamesTokens[sessionName].push(connection.token)

              // Return session template with all the needed attributes
              res.render("session.ejs", {
                sessionName: sessionName,
                token: connection.token,
                nickName: clientData,
                userName: req.session.loggedUser,
              })
            })
            .catch((error) => {
              console.error(error)
            })
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
})

app.post("/leave-session", (req, res) => {
  if (!isLogged(req.session)) {
    req.session.destroy()
    res.render("index.ejs")
  } else {
    // Retrieve params from POST body
    var sessionName = req.body.sessionname
    var token = req.body.token
    console.log("Removing user | {sessionName, token}={" + sessionName + ", " + token + "}")

    // If the session exists
    if (mapSessions[sessionName] && mapSessionNamesTokens[sessionName]) {
      var tokens = mapSessionNamesTokens[sessionName]
      var index = tokens.indexOf(token)

      // If the token exists
      if (index !== -1) {
        // Token removed
        tokens.splice(index, 1)
        console.log(sessionName + ": " + tokens.toString())
      } else {
        var msg = "Problems in the app server: the TOKEN wasn't valid"
        console.log(msg)
        res.redirect("/dashboard")
      }
      if (tokens.length == 0) {
        // Last user left: session must be removed
        console.log(sessionName + " empty!")
        delete mapSessions[sessionName]
      }
      res.redirect("/dashboard")
    } else {
      var msg = "Problems in the app server: the SESSION does not exist"
      console.log(msg)
      res.status(500).send(msg)
    }
  }
})

/* REST API */

/* AUXILIARY METHODS */

function getBasicAuth() {
  return "Basic " + new Buffer("OPENVIDUAPP:" + OPENVIDU_SECRET).toString("base64")
}

/* AUXILIARY METHODS */

// app.listen(port, () => {
//   console.log(`server listening on ${port}`)
// })
module.exports = app
