/* CONFIGURATION */

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

// // Mock database
// var users = [
//   {
//     user: "publisher1",
//     pass: "pass",
//     role: OpenViduRole.PUBLISHER,
//   },
//   {
//     user: "publisher2",
//     pass: "pass",
//     role: OpenViduRole.PUBLISHER,
//   },
// ]

/* CONFIGURATION */

// connect DataBase
const db = require("./models")
db.sequelize
  .sync()
  .then(() => {
    console.log("mafia app DB connected")
  })
  .catch(console.error)

app.use("/api", [userRouter])
app.use("/", roomRouter)

app.get("/", (req, res) => {
  res.send("hello world")
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
