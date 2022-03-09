const mongoose = require("mongoose")

const connect = () => {
  mongoose.connect(
    "mongodb://localhost:27017/fakeMafia",
    { ignoreUndefined: true },
    (error) => {
      if (error) {
        console.log("mongodb error", error)
      } else {
        console.log("connected")
      }
    }
  )
}

module.exports = connect
