/* CONFIGURATION */

var OpenVidu = require("openvidu-node-client").OpenVidu
var OpenViduRole = require("openvidu-node-client").OpenViduRole

// Check launch arguments: must receive openvidu-server URL and the secret
if (process.argv.length != 4) {
  console.log("Usage: node " + __filename + " OPENVIDU_URL OPENVIDU_SECRET")
  process.exit(-1)
}
// For demo purposes we ignore self-signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

// Node imports
var express = require("express")
var fs = require("fs")
var session = require("express-session")
var https = require("https")
var bodyParser = require("body-parser") // Pull information from HTML POST (express4)
var app = express() // Create our app with express
const roomRouter = require("./routes/room")

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

// Listen (start app with node server.js)
var options = {
  key: fs.readFileSync("openvidukey.pem"),
  cert: fs.readFileSync("openviducert.pem"),
}
https.createServer(options, app).listen(5000)

//Routers
app.use("/", roomRouter)

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
  {
    user: "publisher3",
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

console.log("App listening on port 5000")

/* CONFIGURATION */

/* REST API */

// Login
app.post("/api-login/login", function (req, res) {
  // Retrieve params from POST body
  var user = req.body.user
  var pass = req.body.pass
  console.log("Logging in | {user, pass}={" + user + ", " + pass + "}")

  if (login(user, pass)) {
    // Correct user-pass
    // Validate session and return OK
    // Value stored in req.session allows us to identify the user in future requests
    console.log("'" + user + "' has logged in")
    req.session.loggedUser = user
    res.status(200).send()
  } else {
    // Wrong user-pass
    // Invalidate session and return error
    console.log("'" + user + "' invalid credentials")
    req.session.destroy()
    res.status(401).send("User/Pass incorrect")
  }
})

// Logout
app.post("/api-login/logout", function (req, res) {
  console.log("'" + req.session.loggedUser + "' has logged out")
  req.session.destroy()
  res.status(200).send()
})

/* REST API */

/* AUXILIARY METHODS */

function login(user, pass) {
  return users.find((u) => u.user === user && u.pass === pass)
}

function isLogged(session) {
  return session.loggedUser != null
}

function getBasicAuth() {
  return "Basic " + new Buffer("OPENVIDUAPP:" + OPENVIDU_SECRET).toString("base64")
}

/* AUXILIARY METHODS */
