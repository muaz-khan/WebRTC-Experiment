Your wav/webm files will be saved in this directory.

#### [RecordRTC over Socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio)

This experiment:

1. Records audio/video separately as wav/webm
2. Emits both files using socket.io
3. Socket.io server end receives emitted data; and writes wav/web files to disk
4. Node.js code invokes ffmpeg to merge wav/webm in single "webm" file
5. Socket.io server emits `merged` event; and passes-back the URL of the merged file

Client side stuff:

```javascript
var socketio = io.connect('http://localhost:8888/');

var files = {
    audio: {
        name: fileName + '.wav',
        type: 'audio/wav',
        dataURL: dataURL.audio
    },
    video: {
        name: fileName + '.webm',
        type: 'video/webm',
        dataURL: dataURL.video
    }
};

socketio.emit('message', files);
```

Server side code that captures above data:

```javascript
io.sockets.on('connection', function(socket) {
    socket.on('message', function(data) {
        console.log('writing to disk');
        writeToDisk(data.audio.dataURL, data.audio.name);
        writeToDisk(data.video.dataURL, data.video.name);

        merge(socket, data.audio.name, data.video.name);
    });
});
```

After merging; server side code that passes back the URL of the merged file:

```javascript
socket.emit('merged', audioName.split('.')[0] + '-merged.webm');
```

Client-side code that receives merged-file URL:

```javascript
socketio.on('merged', function (fileName) {
    cameraPreview.src = location.href + '/uploads/' + fileName;
    cameraPreview.play();
});
```

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

In the node.js command prompt window; type `node server`. It will run socket.io server at port 8888. Then you can open index.html file on any webserver.

=

##### License

[RecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
