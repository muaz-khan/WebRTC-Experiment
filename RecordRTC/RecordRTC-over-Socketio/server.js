// Last time updated at May 21, 2014, 09:21:23

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Experiments    - github.com/muaz-khan/WebRTC-Experiment
// RecordRTC      - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC

// RecordRTC over Socket.io - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8888;

var app = http.createServer(function (request, response) {

    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    path.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.readFile(filename, 'binary', function (err, file) {
            if (err) {
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, 'binary');
            response.end();
        });
    });
}).listen(parseInt(port, 10));

var sys = require('sys'),
    exec = require('child_process').exec;

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        ffmpeg_finished = false;

        writeToDisk(data.audio.dataURL, data.audio.name);
        
        // if it is chrome
        if(data.video) {
            writeToDisk(data.video.dataURL, data.video.name);
            merge(socket, data.audio.name, data.video.name);
        }
        
        // if it is firefox or if user is recording only audio
        else socket.emit('merged', data.audio.name);
    });
});

app.listen(8888);

function writeToDisk(dataURL, fileName) {
    var fileExtension = fileName.split('.').pop(),
        fileRootNameWithBase = './uploads/' + fileName,
        filePath = fileRootNameWithBase,
        fileID = 2,
        fileBuffer;

    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    dataURL = dataURL.split(',').pop();
    fileBuffer = new Buffer(dataURL, 'base64');
    fs.writeFileSync(filePath, fileBuffer);

    console.log('filePath', filePath);
}

function merge(socket, audioName, videoName) {
    // detect the current operating system
    var isWin = !!process.platform.match(/^win/);

    if (isWin) {
        ifWin(socket, audioName, videoName);
    } else {
        ifMac(socket, audioName, videoName);
    }
    
    readFfmpeOutput(audioName, socket);
}

var ffmpeg_finished = false;

function ifWin(socket, audioName, videoName) {
    // following command tries to merge wav/webm files using ffmpeg
    var merger = __dirname + '\\merger.bat';
    var audioFile = __dirname + '\\uploads\\' + audioName;
    var videoFile = __dirname + '\\uploads\\' + videoName;
    var mergedFile = __dirname + '\\uploads\\' + audioName.split('.')[0] + '-merged.webm';

    // if a "directory" has space in its name; below command will fail
    // e.g. "c:\\dir name\\uploads" will fail.
    // it must be like this: "c:\\dir-name\\uploads"
    var command = merger + ', ' + videoFile + " " + audioFile + " " + mergedFile + ' ' + audioName.split('.')[0] + '';

    var cmd = exec(command, function (error) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);
        } else {
            ffmpeg_finished = true;
            socket.emit('merged', audioName.split('.')[0] + '-merged.webm');

            // removing audio/video files
            fs.unlink(audioFile);
            fs.unlink(videoFile);

            // auto delete file after 1-minute
            setTimeout(function () {
                fs.unlink(mergedFile);
            }, 60 * 1000);
        }
    });
}

function ifMac(response, audioName, videoName) {
    // its probably *nix, assume ffmpeg is available
    var audioFile = __dirname + '/uploads/' + audioName;
    var videoFile = __dirname + '/uploads/' + videoName;
    var mergedFile = __dirname + '/uploads/' + audioName.split('.')[0] + '-merged.webm';
    var util = require('util'),
        exec = require('child_process').exec;
    //child_process = require('child_process');

    var command = "ffmpeg -i " + videoFile + " -i " + audioFile + " -map 0:0 -map 1:0 " + mergedFile + '  1> ffmpeg-output/%4.txt 2>&1';

    var child = exec(command, function (error) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);

        } else {
            ffmpeg_finished = true;
            socket.emit('merged', audioName.split('.')[0] + '-merged.webm');

            // removing audio/video files
            fs.unlink(audioFile);
            fs.unlink(videoFile);

            // auto delete file after 1-minute
            setTimeout(function () {
                fs.unlink(mergedFile);
            }, 60 * 1000);
        }
    });
}

function readFfmpeOutput(fName, socket) {
    if (ffmpeg_finished) return;
    fs.readFile('ffmpeg-output/' + fName.split('.')[0] + '.txt', 'utf8', function (err, content) {
        if (!err && content.match(/Duration: (.*?), start:/)) {
            var duration = 0,
                time = 0,
                progress = 0;
            var resArr = [];
            var matches = (content) ? content.match(/Duration: (.*?), start:/) : [];
            if (matches.length > 0) {
                var rawDuration = matches[1];
                var ar = rawDuration.split(":").reverse();
                duration = parseFloat(ar[0]);
                if (ar[1]) duration += parseInt(ar[1]) * 60;
                if (ar[2]) duration += parseInt(ar[2]) * 60 * 60;
                matches = content.match(/time=(.*?) bitrate/g);
                if (content.match(/time=(.*?) bitrate/g) && matches.length > 0) {
                    var rawTime = matches.pop();
                    rawTime = rawTime.replace('time=', '').replace(' bitrate', '');
                    ar = rawTime.split(":").reverse();
                    time = parseFloat(ar[0]);
                    if (ar[1]) time += parseInt(ar[1]) * 60;
                    if (ar[2]) time += parseInt(ar[2]) * 60 * 60;
                    progress = Math.round((time / duration) * 100);
                }

                socket.emit('ffmpeg-output', progress);
            } else if (content.indexOf('Permission denied') > -1) {
                socket.emit('ffmpeg-error', 'ffmpeg : Permission denied, either for ffmpeg or upload location ...');
            }

            readFfmpeOutput(fName, socket);
        } else setTimeout(function() {
            readFfmpeOutput(fName, socket);
        }, 500);
    });
}
