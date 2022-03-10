async function login(nickname) {
  try {
    const res = await axios.post("/api/user", { nickname })
    console.log(res)
    console.log(res.data)
    if (res.status === 200) {
      window.location.replace("/dashboard")
    }
  } catch (err) {
    console.log(err)
  }
}
