const express = require('express')
const ffmpeg = require("fluent-ffmpeg");
const fileUpload = require("express-fileupload");
const app = express();

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/uploads/",
    })
);

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");
ffmpeg.setFfprobePath("C:/ffmpeg/bin");
ffmpeg.setFlvtoolPath("C:/flvtool");
console.log(ffmpeg);

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

    ffmpeg("uploads/" + file.name)
        .withOutputFormat(to)
        .on("end", function(stdout, stderr) {
            console.log("Finished");
            res.download(__dirname + fileName, function(err) {
                if (err) throw err;
            });
        })
        .saveToFile(__dirname + fileName);
});