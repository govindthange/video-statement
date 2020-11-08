const express = require('express')
const app = express()

app.get("/", (req, res) => {
    res.send("Video Report Server 1.0")
})
app.listen(5000, () => {
    console.log("Video Report Server is listening on Port 5000")
})