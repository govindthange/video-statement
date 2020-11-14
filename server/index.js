const express = require('express')
const ffmpeg = require("fluent-ffmpeg");
const fileUpload = require("express-fileupload");
const app = express();
const gTTS = require('gtts');

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

    ffmpeg("uploads/" + file.name)
        .withOutputFormat(to)
        .input('templates/pie.png')
        //.videoFilter(textFilter1, textFilter2, textFilter3, textFilter4)
        .addOption([
            '-strict -2'
        ])
        .complexFilter([
            'scale=640:480[rescaled]',
            getOverlayFilter(2, 3, 200, 200, 'rescaled', 'output1'),
            getTextFilter(clientName, 68, 1, 6, 10, 10, 'output1', 'output2'),
            getTextFilter(`Total Investment = INR ${investedValue}`, 38, 1, 2, 10, 80, 'output2', 'output3'),
            getTextFilter(`Current Value = INR ${currentValue}`, 38, 1, 2, 10, 160, 'output3', 'output4'),
            getTextFilter(thankYouNote, 28, 11, 12, 100, 160, 'output4', 'output5')
        ], 'output5')
        .audioCodec('aac')
        .on('start', function(commandLine) {
            console.log('Applying text and image filters...');
            //console.log('Command line: ' + commandLine);
        })
        .on("end", function(stdout, stderr) {
            console.log("Finished adding text and image filters.");
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

    let text = `Hello ${clientName}! You invested ${investedValue} Rupees and your current value is ${currentValue} Rupees. ${thankYouNote}`;
    var gtts = new gTTS(text, 'en');
    gtts.save(__dirname + '\\templates\\tts-sample.mp3', function(err, result) {
        if (err) { throw new Error(err) }
        console.log(`Success! Open file [${__dirname}\\templates\\tts-sample.mp3] to hear the result.`);

        addVoice(__dirname + fileName, __dirname + '\\templates\\tts-sample.mp3');
    });

});

function getOverlayFilter(startTime, duration, x, y, ip, op) {
    return {
        filter: 'overlay',
        inputs: ip,
        outputs: op,
        options: {
            x: x,
            y: y,
            enable: `between(t,${startTime},${duration})`
        }
    };
}

function getTextFilter(txt, font, startTime, duration, x, y, ip, op) {
    return {
        filter: 'drawtext',
        inputs: ip,
        outputs: op,
        options: {
            fontfile: 'Lucida Grande.ttf',
            text: txt,
            fontsize: font,
            fontcolor: "22128a",
            alpha: getAlpha(startTime, 1, duration, 1),
            x: x,
            y: y
        }
    };
}

function getAlpha(fadeInStartTime, fadeInLength, opaqueDuration, fadeOutLength) {
    let t1 = fadeInStartTime;
    let t2 = fadeInLength;
    let t3 = opaqueDuration;
    let t4 = fadeOutLength;
    return `if(lt(t,${t1}),0,if(lt(t,${t1+t2}),(t-${t1})/${t2},if(lt(t,${t1+t2+t3}),1,if(lt(t,${t1+t2+t3+t4}),(${t4}-(t${-t1-t2-t3}))/${t4},0))))`;
}

function addVoice(videoPath, audioPath) {
    ffmpeg(videoPath)
        .input(audioPath)
        .complexFilter([{
            filter: 'amix',
            options: { inputs: 1, duration: 'longest' }
        }])
        .on('start', function(commandLine) {
            console.log('Adding voice...');
            //console.log('Command line: ' + commandLine);
        })
        .on('end', async function(output) {
            console.log(output, 'Finished adding voice.')
        })
        .saveToFile(__dirname + '\\outputs\\video-with-voice.mp4');
}