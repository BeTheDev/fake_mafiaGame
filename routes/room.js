const express = require("express")
const router = express.Router()
// const Room = require("../models/rooms")
var OpenVidu = require("openvidu-node-client").OpenVidu
var OpenViduRole = require("openvidu-node-client").OpenViduRole
// Environment variable: URL where our OpenVidu server is listening
var OPENVIDU_URL = process.argv[2]
// Environment variable: secret shared with our OpenVidu server
var OPENVIDU_SECRET = process.argv[3]

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

// Entrypoint to OpenVidu Node Client SDK
var OV = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET)

// Collection to pair session names with OpenVidu Session objects
var mapSessions = {}
// Collection to pair session names with tokens
var mapSessionNamesTokens = {}

// Get token (add new user to session)
router.post("/api-sessions/get-token", function (req, res) {
  if (!isLogged(req.session)) {
    req.session.destroy()
    res.status(401).send("User not logged")
  } else {
    // The video-call to connect
    var sessionName = req.body.sessionName

    // Role associated to this user
    var role = users.find((u) => u.user === req.session.loggedUser).role

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

          // Return the token to the client
          res.status(200).send({
            0: connection.token,
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

          // Generate a new connection asynchronously with the recently created connectionProperties
          session
            .createConnection(connectionProperties)
            .then((connection) => {
              // Store the new token in the collection of tokens
              mapSessionNamesTokens[sessionName].push(connection.token)

              // Return the Token to the client
              res.status(200).send({
                0: connection.token,
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

// Remove user from session
router.post("/api-sessions/remove-user", function (req, res) {
  if (!isLogged(req.session)) {
    req.session.destroy()
    res.status(401).send("User not logged")
  } else {
    // Retrieve params from POST body
    var sessionName = req.body.sessionName
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
        res.status(500).send(msg)
      }
      if (tokens.length == 0) {
        // Last user left: session must be removed
        console.log(sessionName + " empty!")
        delete mapSessions[sessionName]
      }
      res.status(200).send()
    } else {
      var msg = "Problems in the app server: the SESSION does not exist"
      console.log(msg)
      res.status(500).send(msg)
    }
  }
})
function login(user, pass) {
  return users.find((u) => u.user === user && u.pass === pass)
}
function isLogged(session) {
  return session.loggedUser != null
}

module.exports = router
