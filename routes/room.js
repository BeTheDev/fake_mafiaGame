const express = require("express")
const router = express.Router()
const OpenVidu = require("openvidu-node-client").OpenVidu
// const OpenViduRole = require("openvidu-node-client").OpenViduRole

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

router.get("/lobby", (req, res) => {
  res.render("rooms.ejs")
})

router.post("/room", async (req, res) => {
  const { roomName, maxPlayer, roomPwd, onPlay, currPlayer } = req.body
  const { userId } = req.params
  const room = await roomService.create.room({
    roomName,
    maxPlayer,
    roomPwd,
    onPlay: "N",
    currPlayer: 1,
    userId,
  })
  return res.status(201).json({ room })
})

router.post("/dashboard", dashboardController)
router.get("/dashboard", (req, res) => {
  res.render("dashboard.ejs")
})

function dashboardController(req, res) {
  // Check if the user is already logged in
  if (player(req.session)) {
    // User is already logged. Immediately return dashboard
    nickname = req.session.player
    res.render("dashboard.ejs", {
      user: nickname,
    })
  } else {
    // User wasn't logged and wants to

    // Retrieve params from POST body
    var user = req.body.user
    console.log("Logging in | {user, pass}={" + user + "}")

    if (login(user)) {
      // Correct user-pass
      // Validate session and return OK
      // Value stored in req.session allows us to identify the user in future requests
      console.log("'" + user + "' has logged in")
      req.session.player = user
      res.render("dashboard.ejs", {
        user: user,
      })
    } else {
      // Wrong user-pass
      // Invalidate session and return index template
      console.log("'" + user + "' invalid credentials")
      req.session.destroy()
      res.redirect("/dashboard")
    }
  }
}

function login(user, pass) {
  return user != null && pass != null && users.find((u) => u.user === user && u.pass === pass)
}

function isLogged(session) {
  return session.loggedUser != null
}
router.post("/session", (req, res) => {
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

router.post("/leave-session", (req, res) => {
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

module.exports = router
