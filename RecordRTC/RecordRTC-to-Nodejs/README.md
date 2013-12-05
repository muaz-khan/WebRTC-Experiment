#### RecordRTC to Node.js

This experiment:

1. Records audio/video separately as wav/webm
2. POST them in single HttpPost-Request to Node.js (FormData)
3. Node.js code saves them into disk
4. Node.js code invokes ffmpeg to merge wav/webm in single "webm" file
5. The merged webm file is returned and played on the end!

=

##### Windows Batch File (`merger.bat`)

`merger.bat` file is executed to invoke ffmpeg functionalities:

```
@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %1 -i %2  %3
```

**It is assumed that you already have installed ffmpeg on your system.** Though, EXE file is hard-coded to "C:\ffmpeg\bin\ffmpeg.exe" however you can easily edit it according to your own installations.

=

##### How to install ffmpeg on windows?

1. Download ffmpeg and extract ZIP file
2. Rename extracted directory to "ffmpeg"
3. Right click over "My Computer" icon and select "Properties" context-menu option
4. Select "Advance system settings" from top-left section
5. Click "Environment Variables..." button from "Advanced" tab
6. Click "New..." button and in the "Variable name" box, enter "Path".
7. In the "Variable value" box, enter extracted directory full URI e.g. "C:\ffmpeg"
8. Click "OK" and done!

http://www.wikihow.com/Install-FFmpeg-on-Windows

=

##### How to test?

In the node.js command prompt window; type `node index`; then open `http://localhost:8000/`.

=

##### `index.html`

```html
<!DOCTYPE html>
<html>
	<head>
		<title>RecordRTC over Node.js</title>
		<script src="https://www.WebRTC-Experiment.com/RecordRTC.js"> </script>
	</head>
	<body>
    <video id="camera-preview" controls style="border: 1px solid rgb(15, 158, 238); width: 94%;"></video><hr />
    <button id="start-recording">Start Recording</button>
    <button id="stop-recording" disabled="">Stop Recording</button>
		
<script>
var startRecording = document.getElementById('start-recording');
var stopRecording = document.getElementById('stop-recording');
var cameraPreview = document.getElementById('camera-preview');

var audio = document.querySelector('audio');

var recordAudio, recordVideo;
startRecording.onclick = function() {
    startRecording.disabled = true;
    var video_constraints = {
        mandatory: { },
        optional: []
    };
    navigator.getUserMedia({
            audio: true,
            video: video_constraints
        }, function(stream) {
            cameraPreview.src = window.URL.createObjectURL(stream);
            cameraPreview.play();

            recordAudio = RecordRTC(stream, {
                bufferSize: 4096
            });

            recordVideo = RecordRTC(stream, {
                type: 'video'
            });

            recordAudio.startRecording();
            recordVideo.startRecording();

            stopRecording.disabled = false;
        });
};

var fileName;
stopRecording.onclick = function() {
    startRecording.disabled = false;
    stopRecording.disabled = true;

    fileName = Math.round(Math.random() * 99999999) + 99999999;

    recordAudio.stopRecording();
    recordVideo.stopRecording();

    recordAudio.getDataURL(function(audioDataURL) {
        recordVideo.getDataURL(function(videoDataURL) {
            var files = {
                audio: {
                    name: fileName + '.wav',
                    type: 'audio/wav',
                    contents: audioDataURL
                },
                video: {
                    name: fileName + '.webm',
                    type: 'video/webm',
                    contents: videoDataURL
                }
            };

            cameraPreview.src = '';
            cameraPreview.poster = 'ajax-loader.gif';

            xhr('/upload', JSON.stringify(files), function(fileName) {
                cameraPreview.src = location.href + 'uploads/' + fileName;
                cameraPreview.play();
            });
        });
    });
};

function xhr(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText);
        }
    };
    request.open('POST', url);
    request.send(data);
}
</script>
	</body>
</html>
```

=

##### `index.js`

```javascript
var server = require('./server'),
    handlers = require('./handlers'),
    router = require('./router'),
    handle = { };

handle["/"] = handlers.home;
handle["/home"] = handlers.home;
handle["/upload"] = handlers.upload;
handle._static = handlers.serveStatic;

server.start(router.route, handle);
```

=

##### `server.js`

```javascript
var config = require('./config'),
    http = require('http'),
    url = require('url');

function start(route, handle) {

    function onRequest(request, response) {

        var pathname = url.parse(request.url).pathname,
            postData = '';

        request.setEncoding('utf8');

        request.addListener('data', function(postDataChunk) {
            postData += postDataChunk;
        });

        request.addListener('end', function() {
            route(handle, pathname, response, postData);
        });
    }

    http.createServer(onRequest).listen(config.port);
}

exports.start = start;
```

=

##### `handlers.js`

```javascript
var config = require('./config'),
    fs = require('fs'),
    sys = require('sys'),
    exec = require('child_process').exec;

function home(response, postData) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
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
    // following command tries to merge wav/webm files using ffmpeg
    var merger = __dirname + '\\merger.bat';
    var audioFile = __dirname + '\\uploads\\' + files.audio.name;
    var videoFile = __dirname + '\\uploads\\' + files.video.name;
    var mergedFile = __dirname + '\\uploads\\' + files.audio.name.split('.')[0] + '-merged.webm';

    // if a "directory" has space in its name; below command will fail
    // e.g. "c:\\dir name\\uploads" will fail.
    // it must be like this: "c:\\dir-name\\uploads"
    var command = merger + ', ' + videoFile + " " + audioFile + " " + mergedFile + '';
    var cmd = exec(command, function(error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);
        } else {
            response.statusCode = 200;
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(files.audio.name.split('.')[0] + '-merged.webm');

            // removing audio/video files
            fs.unlink(audioFile);
            fs.unlink(videoFile);

            // auto delete file after 1-minute
            setTimeout(function() {
                fs.unlink(mergedFile);
            }, 60 * 1000);
        }
    });
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
            headers = { 'Content-Type': file.type };

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

    response.writeHead(200, { 'Content-Type': extensionTypes[extension] });
    if (extensionTypes[extension] == 'video/webm')
        response.end(fs.readFileSync('.' + pathname));
    else
        response.end(fs.readFileSync('./static' + pathname));
}

exports.home = home;
exports.upload = upload;
exports.serveStatic = serveStatic;
```

=

##### `router.js`

```javascript
function respondWithHTTPCode(response, code) {
    response.writeHead(code, { 'Content-Type': 'text/plain' });
    response.end();
}

function route(handle, pathname, response, postData) {

    var extension = pathname.split('.').pop();

    var staticFiles = {
        js: 'js',
        gif: 'gif',
        css: 'css',
        webm: 'webm'
    };

    if ('function' === typeof handle[pathname]) {
        handle[pathname](response, postData);
    } else if (staticFiles[extension]) {
        handle._static(response, pathname, postData);
    } else {
        respondWithHTTPCode(response, 404);
    }
}

exports.route = route;
```

=

##### `config.js`

```javascript
exports.port = 8000;
exports.upload_dir = './uploads';

exports.s3 = {
    key: '',
    secret: '',
    bucket: ''
};

exports.s3_enabled = false;
```

=

##### License

[RecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/+MuazKhan).
