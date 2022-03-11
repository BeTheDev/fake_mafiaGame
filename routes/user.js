const express = require("express")
const router = express.Router()
let session = require("express-session")
const { User } = require("../models")

//게임시작 페이지
router.get("/user", (req, res) => {
  res.render("index.ejs")
})
router.post("/user", async (req, res) => {
  try {
    let { nickname } = req.body
    let user = await User.create({ nickname })

    res.status(200).json({
      user,
    })
  } catch (err) {
    console.log(err)
    res.status(400).json({
      errorMessage: "확인 후 다시 입력해주세요.",
    })
  }
})

module.exports = router
