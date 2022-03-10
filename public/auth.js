async function login(nickname) {
  try {
    const res = await axios.post("/api/user", { nickname })
    console.log(res)
    console.log(res.data)
    if (res.status === 201) {
      window.location.replace("/api/dashboard")
    }
  } catch (err) {
    console.log(err)
  }
}
