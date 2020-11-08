const express = require('express')
const fileUpload = require("express-fileupload");
const app = express();

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})
app.listen(5000, () => {
    console.log("Video Report Server is listening on Port 5000")
})

app.post("/generate", (req, res) => {
    let to = req.body.to;
    let file = req.files.file;
    let fileName = `output.${to}`;
    console.log(to);
    console.log(file);

    file.mv("uploads/" + file.name, function(err) {
        if (err) {
            console.log(err);
            return res.sendStatus(500).send(err);
        }
        console.log("File Uploaded successfully");
    });

    res.send('Feature to generate video statement is pending...');

});