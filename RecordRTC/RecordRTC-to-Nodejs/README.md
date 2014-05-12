Note: You MUST always manually create a directory and name it "uploads".

=

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
ffmpeg -i audio-file.wav -i video-file.webm 0:0 -map 1:0 output-file-name.webm
```

**It is assumed that you already have installed ffmpeg on your system.** Though, EXE file is hard-coded to "C:\ffmpeg\bin\ffmpeg.exe" however you can easily edit it according to your own installations.

=

##### `.sh` file

`merger.sh` file is executed to invoke ffmpeg functionalities on Mac/Linux/etc.

```
ffmpeg -i audio-file.wav -i video-file.webm -map 0:0 -map 1:0 output-file-name.webm
```

Using Linux; ffmpeg installation is super-easy! You can install DEVEL packages as well.

=

##### Ubuntu, Debian, or Linux Mint?

You're suggested to install ffmpeg and libvpx from following URL:

* https://trac.ffmpeg.org/wiki/UbuntuCompilationGuide

Another useful resource is:

* http://wiki.razuna.com/display/ecp/FFmpeg+Installation+for+Ubuntu

Read following comments:

> Actually it is very easy to install FFmpeg under Ubuntu with the apt-get command.
> Unfortunately, the default FFmpeg installation doesn't let you include the latest codecs 
> which are needed to merge WAV/WebM into vp8 encoded video i.e. WebM!
> Thus you have to compile FFmpeg yourself!

For example, you can check libvpx installation using following command:

```
dpkg -s libvpx | grep Status
```

This doesn't mean that you enabled libvpx for ffmpeg; you need to verify vp8 encoders in ffmpeg using following commands:

```
ffmpeg -codecs     # to check list of all decoders
ffmpeg -encoders   # to check list of all encoders
```

Usually latest ffmpeg can decode WebM i.e. vp8 codecs; however it can't encode back into vp8 until you manually install libvpx.

There is another useful resource!

* http://juliensimon.blogspot.com/2013/08/howto-compiling-ffmpeg-x264-mp3-aac.html

This provides a good command to check list of encoders in ffmpeg:

```
ffmpeg -encoders|grep -E "mp3|xvid|aac|gsm|amr|x264|theora|vorbis"
```

Sometimes you mistakenly install multiple ffmpeg instances. Find-out ffmpeg instance that has included libvpx; then include that instance's full path in the ffmpeg-command. E.g.

```
ffmpeg -i audioFile -i videoFile -map 0:0 -map 1:0 outputFile
```

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
brew install ffmpeg --with-libvpx --with-theora --with-libogg --with-libvorbis
```

More info here:

* https://github.com/muaz-khan/WebRTC-Experiment/issues/198

##### How to test?

In the node.js command prompt window; type `node index`; then open `http://localhost:8000/`.

=

#### How to fix audio/video sync issues on chrome?

```javascript
recordAudio = RecordRTC( stream, {
     onAudioProcessStarted: function( ) {
         recordVideo.startRecording();
     }
});

recordVideo = RecordRTC(stream, {
    type: 'video'
});

recordAudio.startRecording();
```

`onAudioProcessStarted` fixes shared/exclusive audio gap (a little bit). Because shared audio sometimes causes 100ms delay...
sometime about 400-to-500 ms delay. 
Delay depends upon number of applications concurrently requesting same audio devices and CPU/Memory available. 
Shared mode is the only mode currently available on 90% of windows systems especially on windows 7.

=

#### Want to recording only audio?

```
// line 91:

// Firefox can record both audio/video in single webm container
// Don't need to create multiple instances of the RecordRTC for Firefox
// You can even use below property to force recording only audio blob on chrome
var isRecordOnlyAudio = true;
```

=

1. [RecordRTC to Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio)

=

##### License

[RecordRTC-to-Nodejs](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
