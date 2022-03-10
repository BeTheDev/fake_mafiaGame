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
    session = req.session
    console.log(session)
    if (session.player) {
      //유저 로그인하면 닉네임을 세션에 저장하여 sid 만들어줌 => cookie에 sid가 만들어지면서 토큰이 만들어짐
      nickname = session.player
    }
    const user = await User.create({ nickname })
    res.status(201).json({
      user,
    })
  } catch (err) {
    console.log(err)
    res.status(400).json({
      errorMessage: "확인 후 다시 입력해주세요.",
    })
  }
})

/* REST API */

// router.post("/user", loginController)
// router.get("/user", loginController)

// async function loginController(req, res) {
//   console.log(req.session.loggedUser)
//   if (req.session.loggedUser) {
//     // User is logged
//     nickname = req.session.loggedUser
//     await User.create({ nickname })
//     res.status(200).json({
//       msg: "회원가입 완료!",
//     })
//     res.redirect("/dashboard")
//   } else {
//     // User is not logged
//     req.session.destroy()
//     res.render("index.ejs")
//   }
// }

// router.post("/logout", (req, res) => {
//   req.session.destroy()
//   res.redirect("/")
// })

module.exports = router
