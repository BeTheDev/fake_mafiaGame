async function login(user) {
  try {
    const res = await axios.post("/login", { user })
    console.log(res.data.token)

    if (res.status === 200) {
      const { token } = res.data
      localStorage.setItem("token", token)
      window.location.replace("/")
    }
  } catch (err) {
    console.log(err)
  }
}
