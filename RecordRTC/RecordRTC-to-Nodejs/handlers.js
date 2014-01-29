// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Experiments   - github.com/muaz-khan/WebRTC-Experiment

var config = require('./config'),
    fs = require('fs'),
    sys = require('sys'),
    exec = require('child_process').exec;

function home(response, postData) {
    response.writeHead(200, {
        'Content-Type': 'text/html'
    });
    response.end(fs.readFileSync('./static/index.html'));
}

// this function uploads files

function upload(response, postData) {
    var files = JSON.parse(postData);

    // writing audio file to disk
    _upload(response, files.audio);

    // writing video file to disk
    _upload(response, files.video);

    merge(response, files);
}

// this function merges wav/webm files

function merge(response, files) {
    // detect the current operating system
    var isWin = !! process.platform.match(/^win/);

    if (isWin) {
        ifWin(response, files);
    } else {
        ifMac(response, files);
    }
}

function _upload(response, file) {
    var fileRootName = file.name.split('.').shift(),
        fileExtension = file.name.split('.').pop(),
        filePathBase = config.upload_dir + '/',
        fileRootNameWithBase = filePathBase + fileRootName,
        filePath = fileRootNameWithBase + '.' + fileExtension,
        fileID = 2,
        fileBuffer;

    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    file.contents = file.contents.split(',').pop();

    fileBuffer = new Buffer(file.contents, "base64");

    if (config.s3_enabled) {

        var knox = require('knox'),
            client = knox.createClient(config.s3),
            headers = {
                'Content-Type': file.type
            };

        client.putBuffer(fileBuffer, fileRootName, headers);

    } else {
        fs.writeFileSync(filePath, fileBuffer);
    }
}

function serveStatic(response, pathname, postData) {

    var extension = pathname.split('.').pop(),
        extensionTypes = {
            'js': 'application/javascript',
            'webm': 'video/webm',
            'gif': 'image/gif'
        };

    response.writeHead(200, {
        'Content-Type': extensionTypes[extension]
    });
    if (extensionTypes[extension] == 'video/webm')
        response.end(fs.readFileSync('.' + pathname));
    else
        response.end(fs.readFileSync('./static' + pathname));
}

function ifWin(response, files) {
    // following command tries to merge wav/webm files using ffmpeg
    var merger = __dirname + '\\merger.bat';
    var audioFile = __dirname + '\\uploads\\' + files.audio.name;
    var videoFile = __dirname + '\\uploads\\' + files.video.name;
    var mergedFile = __dirname + '\\uploads\\' + files.audio.name.split('.')[0] + '-merged.webm';

    // if a "directory" has space in its name; below command will fail
    // e.g. "c:\\dir name\\uploads" will fail.
    // it must be like this: "c:\\dir-name\\uploads"
    var command = merger + ', ' + videoFile + " " + audioFile + " " + mergedFile + '';
    var cmd = exec(command, function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);
        } else {
            response.statusCode = 200;
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(files.audio.name.split('.')[0] + '-merged.webm');

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

function ifMac(response, files) {
    // its probably *nix, assume ffmpeg is available
    var audioFile = __dirname + '/uploads/' + files.audio.name;
    var videoFile = __dirname + '/uploads/' + files.video.name;
    var mergedFile = __dirname + '/uploads/' + files.audio.name.split('.')[0] + '-merged.webm';
    var util = require('util'),
        exec = require('child_process').exec;
    //child_process = require('child_process');

    var command = "ffmpeg -i " + videoFile + " -i " + audioFile + " -map 0:0 -map 1:0 " + mergedFile;

    var child = exec(command, function (error, stdout, stderr) {

        stdout ? util.print('stdout: ' + stdout) : null;
        stderr ? util.print('stderr: ' + stderr) : null;

        if (error) {

            console.log('exec error: ' + error);
            response.statusCode = 404;
            response.end();

        } else {

            response.statusCode = 200;
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(files.audio.name.split('.')[0] + '-merged.webm');

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

exports.home = home;
exports.upload = upload;
exports.serveStatic = serveStatic;
