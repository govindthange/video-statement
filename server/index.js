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
    console.log("Video Report Server is listening on Port 5000");
    console.log('DIR = ' + __dirname);
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

    file.mv("uploads/" + file.name, function(err) {
        if (err) {
            console.log(err);
            return res.sendStatus(500).send(err);
        }
        console.log("File Uploaded successfully");
    });

    let overlayImageFilter1 = {
        filter: 'overlay',
        inputs: 'rescaled',
        outputs: 'output1',
        options: {
            x: 200,
            y: 200,
            enable: 'between(t,2,3)'
        }
    };

    let textFilter1 = {
        filter: 'drawtext',
        inputs: 'output1',
        outputs: 'output2',
        options: {
            fontfile: 'Lucida Grande.ttf',
            text: clientName,
            fontsize: 68,
            fontcolor: "22128a",
            alpha: "if(lt(t, 1),0,if(lt(t,2),(t- 1)/1 ,if(lt(t,8),1,if(lt(t,9),(1-(t-8))/1,0))))",
            x: 10,
            y: 10
        }
    };

    let textFilter2 = {
        filter: 'drawtext',
        inputs: 'output2',
        outputs: 'output3',
        options: {
            fontfile: 'Lucida Grande.ttf',
            text: `Total Investment = INR ${investedValue}`,
            fontsize: 38,
            alpha: "if(lt(t,1),0,if(lt(t,2),(t-1)/1,if(lt(t,4),1,if(lt(t,5),(1-(t-4))/1,0))))",
            x: 10,
            y: 80
        }
    };

    let textFilter3 = {
        filter: 'drawtext',
        inputs: 'output3',
        outputs: 'output4',
        options: {
            fontfile: 'Lucida Grande.ttf',
            text: `Current Value = INR ${currentValue}`,
            fontsize: 38,
            alpha: "if(lt(t,1),0,if(lt(t,2),(t-1)/1,if(lt(t,4),1,if(lt(t,5),(1-(t-4))/1,0))))",
            x: 10,
            y: 160
        }
    };

    let textFilter4 = {
        filter: 'drawtext',
        inputs: 'output4',
        outputs: 'output5',
        options: {
            fontfile: 'Lucida Grande.ttf',
            text: thankYouNote,
            fontsize: 28,
            fontcolor: "22128a",
            alpha: "if(lt(t, 11),0,if(lt(t,12),(t- 1)/1 ,if(lt(t,24),1,if(lt(t,25),(1-(t-24))/1,0))))",
            x: 100,
            y: 160
        }
    };

    ffmpeg("uploads/" + file.name)
        .withOutputFormat(to)
        .input('uploads/sample-logo.png')
        .addInput('uploads/hello.mp3')
        //.videoFilter(textFilter1, textFilter2, textFilter3, textFilter4)
        .addOption([
            '-strict -2'
        ])
        .complexFilter([
            'scale=640:480[rescaled]',
            overlayImageFilter1,
            textFilter1,
            textFilter2,
            textFilter3,
            textFilter4
        ], 'output5')
        .audioCodec('aac')
        .on('start', function(commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
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