const express = require("express")
const router = express.Router()

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

function login(user) {
  return user != null && users.find((u) => u.user === user)
}

function player(session) {
  return session.player != null
}

module.exports = router
