#### [RecordRTC to Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs)

<a href="https://nodei.co/npm/recordrtc/">
    <img src="https://nodei.co/npm/recordrtc.png">
</a>

```
npm install recordrtc

// to run it!
cd ./node_modules/recordrtc/ && node index.js
```

**Make sure that directory names MUST NOT have spaces; e.g.**

```
// invalid directory
C:\Hello Sir\Another\RecordRTC

// valid
C:\Hello-Sir\Another\RecordRTC

// invalid directory
C:\First\Second Dir\Third\RecordRTC

// valid
C:\\First\Second-Dir\Third\RecordRTC
```

This experiment:

1. Records audio/video separately as wav/webm
2. POST both files in single HttpPost-Request to Node.js (FormData)
3. Node.js code saves both files into disk
4. Node.js code invokes ffmpeg to merge wav/webm in single "webm" file
5. The merged webm file's URL is returned using same HTTP-callback for playback!

=

##### Windows Batch File (`merger.bat`)

`merger.bat` file is executed to invoke ffmpeg functionalities on windows:

```
@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %1 -i %2  %3
```

**It is assumed that you already have installed ffmpeg on your system.** Though, EXE file is hard-coded to "C:\ffmpeg\bin\ffmpeg.exe" however you can easily edit it according to your own installations.

=

##### `.sh` file

`merger.sh` file is executed to invoke ffmpeg functionalities on Mac/Linux/etc.

```
ffmpeg -i video-file.webm -i audio-file.wav -map 0:0 -map 1:0 output-file-name.webm
```

Using Linux; ffmpeg installation is super-easy! You can install DEVEL packages as well.

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

##### How to install ffmpeg on Mac OSX?

Make sure you have **homebrew** installed. Then run following command:

```
brew install ffmpeg --with-libvpx --with-theora --whit-libogg --with-libvorbis
```

##### How to test?

In the node.js command prompt window; type `node index`; then open `http://localhost:8000/`.

=

##### RecordRTC invocation code in `index.html`

```javascript
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
            cameraPreview.poster = '//www.webrtc-experiment.com/images/ajax-loader.gif';

            xhr('/upload', JSON.stringify(files), function(fileName) {
                var href = location.href.substr(0, location.href.lastIndexOf('/') + 1);
                cameraPreview.src = href + 'uploads/' + fileName;
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
    // detect the current operating system
    var isWin = !!process.platform.match(/^win/);

    if (isWin) {
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
              response.statusCode = 404;
              response.end();
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
    } else { // its probably *nix, assume ffmpeg is available
      var audioFile = __dirname + '/uploads/' + files.audio.name;
      var videoFile = __dirname + '/uploads/' + files.video.name;
      var mergedFile = __dirname + '/uploads/' + files.audio.name.split('.')[0] + '-merged.webm';
      var util = require('util'),
        exec = require('child_process').exec;
        //child_process = require('child_process');

        var command = "ffmpeg -i " + videoFile + " -i " + audioFile + " -map 0:0 -map 1:0 " + mergedFile;

        var child = exec(command, function(error, stdout, stderr){

            stdout ? util.print('stdout: ' + stdout) : null;
            stderr ? util.print('stderr: ' + stderr) : null;

            if (error) {

                console.log('exec error: ' + error);
                response.statusCode = 404;
                response.end();

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

1. [RecordRTC to Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio)

=

##### License

[RecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
