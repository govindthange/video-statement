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

// Ref: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
app.post("/generate", (req, res) => {
    let clientName = req.body.clientName;
    let currentValue = req.body.currentValue;
    let investedValue = req.body.investedValue;
    let thankYouNote = req.body.thankYouNote;

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
        .videoFilter({
            filter: 'drawtext',
            options: {
                fontfile: 'Lucida Grande.ttf',
                text: clientName,
                fontsize: 68,
                fontcolor: "22128a",
                alpha: "if(lt(t, 1),0,if(lt(t,2),(t- 1)/1 ,if(lt(t,8),1,if(lt(t,9),(1-(t-8))/1,0))))",
                x: 10,
                y: 10
            }
        }, {
            filter: 'drawtext',
            options: {
                fontfile: 'Lucida Grande.ttf',
                text: `Total Investment = INR ${investedValue}`,
                fontsize: 38,
                alpha: "if(lt(t,1),0,if(lt(t,2),(t-1)/1,if(lt(t,4),1,if(lt(t,5),(1-(t-4))/1,0))))",
                x: 10,
                y: 80
            }
        }, {
            filter: 'drawtext',
            options: {
                fontfile: 'Lucida Grande.ttf',
                text: `Current Value = INR ${currentValue}`,
                fontsize: 38,
                alpha: "if(lt(t,1),0,if(lt(t,2),(t-1)/1,if(lt(t,4),1,if(lt(t,5),(1-(t-4))/1,0))))",
                x: 10,
                y: 160
            }
        }, {
            filter: 'drawtext',
            options: {
                fontfile: 'Lucida Grande.ttf',
                text: thankYouNote,
                fontsize: 28,
                fontcolor: "22128a",
                alpha: "if(lt(t, 11),0,if(lt(t,12),(t- 1)/1 ,if(lt(t,24),1,if(lt(t,25),(1-(t-24))/1,0))))",
                x: 100,
                y: 160
            }
        })
        .on("end", function(stdout, stderr) {
            console.log("Finished");
            res.download(__dirname + fileName, function(err) {
                if (err) throw err;
                /*
                fs.unlink(__dirname + fileName, function(err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
                */
            });
            /*
            fs.unlink("uploads/" + file.name, function(err) {
                if (err) throw err;
                console.log("File deleted");
            });
            */
        })
        .on("error", function(err) {
            console.log("an error happened: " + err.message);
            fs.unlink("uploads/" + file.name, function(err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName);
});