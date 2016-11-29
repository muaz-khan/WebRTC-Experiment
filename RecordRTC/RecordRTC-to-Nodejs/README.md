#### [RecordRTC to Node.js](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-Nodejs)

<a href="https://nodei.co/npm/recordrtc-nodejs/">
    <img src="https://nodei.co/npm/recordrtc-nodejs.png">
</a>

```
npm install recordrtc-nodejs

// to run it!
node ./node_modules/recordrtc-nodejs/index.js
```

=

##### How to test?

In the node.js command prompt window; type `node index`; then open `http://localhost:8000/`.

=

There are some other NPM packages regarding RecordRTC:

* https://www.npmjs.org/search?q=RecordRTC

=

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
"C:\ffmpeg\bin\ffmpeg.exe" -i %1 -itsoffset -00:00:01 -i %2 %3
```

**It is assumed that you already have installed ffmpeg on your system.** Though, EXE file is hard-coded to "C:\ffmpeg\bin\ffmpeg.exe" however you can easily edit it according to your own installations.

=

##### `.sh` file

`merger.sh` file is executed to invoke ffmpeg functionalities on Mac/Linux/etc.

```
ffmpeg -i audio-file.wav -itsoffset -00:00:01 -i video-file.webm -map 0:0 -map 1:0 output-file-name.webm
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

=

##### `index.html`

```html
<!--
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Experiments   - github.com/muaz-khan/RecordRTC
-->

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>RecordRTC to Node.js</title>
        <script>
            if (location.href.indexOf('file:') == 0) {
                document.write('<h1 style="color:red;">Please load this HTML file on HTTP or HTTPS.</h1>');
            }
        </script>
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <link rel="author" type="text/html" href="https://plus.google.com/+MuazKhan">
        <meta name="author" content="Muaz Khan">
        
        <style>
            html { background-color: #f7f7f7; }

            body {
                background-color: white;
                border: 1px solid rgb(15, 158, 238);
                margin: 1% 35%;
                text-align: center;
            }

            hr {
                border: 0;
                border-top: 1px solid rgb(15, 158, 238);
            }

            a {
                color: #2844FA;
                text-decoration: none;
            }

            a:hover, a:focus { color: #1B29A4; }

            a:active { color: #000; }
            
            audio, video {
                border: 1px solid rgb(15, 158, 238); width: 94%;
            }
            button[disabled], input[disabled] { background: rgba(216, 205, 205, 0.2); border: 1px solid rgb(233, 224, 224);}
        </style>
    </head>
    <body>
        <h1>RecordRTC to Node.js</h1>
        <p>
            <video></video> 
        </p><hr />
        
        <div>
            <label id="percentage">0%</label>
            <progress id="progress-bar" value=0></progress><br />
        </div>
            
        <hr />

        <div>
            <button id="btn-start-recording">Start Recording</button>
            <button id="btn-stop-recording" disabled="">Stop Recording</button>
        </div>

        <script src="https://cdn.webrtc-experiment.com/RecordRTC.js"> </script>
        
        <script>
            // fetching DOM references
            var btnStartRecording = document.querySelector('#btn-start-recording');
            var btnStopRecording  = document.querySelector('#btn-stop-recording');
            
            var videoElement      = document.querySelector('video');
            
            var progressBar = document.querySelector('#progress-bar');
            var percentage = document.querySelector('#percentage');
        </script>
        
        <script>
            // global variables
            var currentBrowser = !!navigator.mozGetUserMedia ? 'gecko' : 'chromium';
            
            var fileName;
            var audioRecorder;
            var videoRecorder;
            
            // Firefox can record both audio/video in single webm container
            // Don't need to create multiple instances of the RecordRTC for Firefox
            // You can even use below property to force recording only audio blob on chrome
            // var isRecordOnlyAudio = true;
            var isRecordOnlyAudio = !!navigator.mozGetUserMedia;
            
            // if recording only audio, we should replace "HTMLVideoElement" with "HTMLAudioElement"
            if(isRecordOnlyAudio && currentBrowser == 'chromium') {
                var parentNode = videoElement.parentNode;
                parentNode.removeChild(videoElement);
                
                videoElement = document.createElement('audio');
                videoElement.style.padding = '.4em';
                videoElement.controls = true;
                parentNode.appendChild(videoElement);
            }
        </script>
        
        <script>
            // reusable helpers
            
            // this function submits both audio/video or single recorded blob to nodejs server
            function postFiles(audio, video) {
                // getting unique identifier for the file name
                fileName = generateRandomString();
                
                // this object is used to allow submitting multiple recorded blobs
                var files = { };

                // recorded audio blob
                files.audio = {
                    name: fileName + '.' + audio.blob.type.split('/')[1], // MUST be wav or ogg
                    type: audio.blob.type,
                    contents: audio.dataURL
                };
                
                if(video) {
                    files.video = {
                        name: fileName + '.' + video.blob.type.split('/')[1], // MUST be webm or mp4
                        type: video.blob.type,
                        contents: video.dataURL
                    };
                }
                
                files.uploadOnlyAudio = !video;

                videoElement.src = '';
                videoElement.poster = '/ajax-loader.gif';

                xhr('/upload', JSON.stringify(files), function(_fileName) {
                    var href = location.href.substr(0, location.href.lastIndexOf('/') + 1);
                    videoElement.src = href + 'uploads/' + _fileName;
                    videoElement.play();
                    videoElement.muted = false;
                    videoElement.controls = true;

                    document.querySelector('#footer-h2').innerHTML = '<a href="' + videoElement.src + '">' + videoElement.src + '</a>';
                });
                
                if(mediaStream) mediaStream.stop();
            }
            
            // XHR2/FormData
            function xhr(url, data, callback) {
                var request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if (request.readyState == 4 && request.status == 200) {
                        callback(request.responseText);
                    }
                };
                        
                request.upload.onprogress = function(event) {
                    progressBar.max = event.total;
                    progressBar.value = event.loaded;
                    progressBar.innerHTML = 'Upload Progress ' + Math.round(event.loaded / event.total * 100) + "%";
                };
                        
                request.upload.onload = function() {
                    percentage.style.display = 'none';
                    progressBar.style.display = 'none';
                };
                request.open('POST', url);
                request.send(data);
            }

            // generating random string
            function generateRandomString() {
                if (window.crypto) {
                    var a = window.crypto.getRandomValues(new Uint32Array(3)),
                        token = '';
                    for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
                    return token;
                } else {
                    return (Math.random() * new Date().getTime()).toString(36).replace( /\./g , '');
                }
            }
            
            // when btnStopRecording is clicked
            function onStopRecording() {
                audioRecorder.getDataURL(function(audioDataURL) {
                    var audio = {
                        blob: audioRecorder.getBlob(),
                        dataURL: audioDataURL
                    };
                    
                    // if record both wav and webm
                    if(!isRecordOnlyAudio) {
                        audio.blob = new File([audio.blob], 'audio.wav', {
                            type: 'audio/wav'
                        });
                        
                        videoRecorder.getDataURL(function(videoDataURL) {
                            var video = {
                                blob: videoRecorder.getBlob(),
                                dataURL: videoDataURL
                            };
                            
                            postFiles(audio, video);
                        });
                        return;
                    }
                    
                    // if record only audio (either wav or ogg)
                    if (isRecordOnlyAudio) postFiles(audio);
                });
            }
        </script>
        
        <script>
            var mediaStream = null;
            // reusable getUserMedia
            function captureUserMedia(success_callback) {
                var session = {
                    audio: true,
                    video: true
                };
                
                navigator.getUserMedia(session, success_callback, function(error) {
                    alert( JSON.stringify(error) );
                });
            }
        </script>
        
        <script>
            // UI events handling
            btnStartRecording.onclick = function() {
                btnStartRecording.disabled = true;
                
                captureUserMedia(function(stream) {
                    mediaStream = stream;
                    
                    videoElement.src = window.URL.createObjectURL(stream);
                    videoElement.play();
                    videoElement.muted = true;
                    videoElement.controls = false;
                    
                    // it is second parameter of the RecordRTC
                    var audioConfig = {};

                    if(currentBrowser == 'chromium') {
                        audioConfig.recorderType = StereoAudioRecorder;
                    }

                    if(!isRecordOnlyAudio) {
                        audioConfig.onAudioProcessStarted = function() {
                            // invoke video recorder in this callback
                            // to get maximum sync
                            videoRecorder.startRecording();
                        };
                    }
                    
                    audioRecorder = RecordRTC(stream, audioConfig);
                    
                    if(!isRecordOnlyAudio) {
                        // it is second parameter of the RecordRTC
                        var videoConfig = { type: 'video' };

                        if(currentBrowser == 'chromium') {
                            audioConfig.recorderType = WhammyRecorder;
                        }

                        videoRecorder = RecordRTC(stream, videoConfig);
                        videoRecorder.startRecording();
                    }
                    
                    audioRecorder.startRecording();
                    
                    // enable stop-recording button
                    btnStopRecording.disabled = false;
                });
            };


            btnStopRecording.onclick = function() {
                btnStartRecording.disabled = false;
                btnStopRecording.disabled = true;
                
                if(isRecordOnlyAudio) {
                    audioRecorder.stopRecording(onStopRecording);
                    return;
                }

                if(!isRecordOnlyAudio) {
                    audioRecorder.stopRecording(function() {
                        videoRecorder.stopRecording(function() {
                            onStopRecording();
                        });
                    });
                }
            };
        </script>
        
        <script>
            window.onbeforeunload = function() {
                startRecording.disabled = false;
            };
        </script>
        <footer style="width:100%;position: fixed; right: 0; text-align: center;color:red;">
            <h2 id="footer-h2"></h2>
            Questions?? <a href="mailto:muazkh@gmail.com">muazkh@gmail.com</a>

            <br><br>
            Open-Sourced here:<br>
            <a href="https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-Nodejs">https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-Nodejs</a>
        </footer>
    </body>
</html>
```

=

##### `handlers.js`

```javascript
var config = require('./config'),
    fs = require('fs'),
    sys = require('sys'),
    exec = require('child_process').exec;

function home(response) {
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

    if (files.isFirefox) {
        response.statusCode = 200;
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(files.audio.name);
    }

    if (!files.isFirefox) {
        // writing video file to disk
        _upload(response, files.video);

        merge(response, files);
    }
}

// this function merges wav/webm files

function merge(response, files) {
    // detect the current operating system
    var isWin = !!process.platform.match( /^win/ );

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

    fs.writeFileSync(filePath, fileBuffer);
}

function serveStatic(response, pathname) {

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
    var command = merger + ', ' + audioFile + " " + videoFile + " " + mergedFile + '';
    exec(command, function (error, stdout, stderr) {
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

            fs.unlink(audioFile);
            fs.unlink(videoFile);
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

    var command = "ffmpeg -i " + audioFile + " -itsoffset -00:00:01 -i " + videoFile + " -map 0:0 -map 1:0 " + mergedFile;

    exec(command, function (error, stdout, stderr) {
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);

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
        }

    });
}

exports.home = home;
exports.upload = upload;
exports.serveStatic = serveStatic;
```

=

1. [RecordRTC to Node.js](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio)

=

##### License

[RecordRTC-to-Nodejs](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-Nodejs) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
