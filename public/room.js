async function checkToken() {
  const token = localStorage.getItem("token")
  console.log(token)
  if (!token) {
    window.alert("please log in")
  } else {
    return token
  }
}

async function writePost(title, content) {
  try {
    //const token = localStorage.getItem("token")
    const res = await axios.post("/api/room", { title, content })

    if (res.status === 201) {
      window.location.replace("/")
    }
  } catch (err) {
    console.log(err)
  }
}
