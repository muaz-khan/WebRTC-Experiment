## [MRecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC) i.e. Multi-RecordRTC! / [Demo](https://www.webrtc-experiment.com/RecordRTC/MRecordRTC/)

This [WebRTC](https://www.webrtc-experiment.com/) experiment is using [RecordRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) to record multiple audio/video/gif streams.

1. It simplifies coding for multi-streams recording i.e. audio+video recording
2. It auto synchronizes audio and video
3. It is capable to write all blobs to indexed-db
4. It allows to get/fetch all blobs or individual blob from disk/indexed-db

=

```html
<script src="//cdn.WebRTC-Experiment.com/RecordRTC.js"></script>
<script>
var recorder = new MRecordRTC();
recorder.addStream(MediaStream);
recorder.mediaType = {
   audio: true,
   video: true,
   gif: true
};
recorder.startRecording();
recorder.stopRecording(function(url, type) {
    document.querySelector(type).src = url;
});

recorder.getBlob(function(blobs) {
   blobs.audio --- audio blob
   blobs.video --- video blob
   blobs.gif   --- gif blob
});
// or
var blobs = recorder.getBlob();
var audioBlob = blobs.audio;
var videoBlob = blobs.video;
var gifBlob = blobs.gif;

// invoke save-as dialog
// for all recorded blobs
recorder.save();

recorder.writeToDisk();

// get all blobs from disk
MRecordRTC.getFromDisk('all', function(dataURL, type) {
   type == 'audio'
   type == 'video'
   type == 'gif'
});

// or get just single blob
MRecordRTC.getFromDisk('audio', function(dataURL) {
   // only audio blob is returned from disk!
});
</script>
```

=

#### `getDataURL`

```javascript
mRecordRTC.getDataURL(function (dataURL) {
    // dataURL.audio
    // dataURL.video
});
```

=

#### `save`

Invoke save-as dialog:

```javascript
recorder.save();

// or save only audio stream
recorder.save({
    audio: true
});

// or save audio and video streams
recorder.save({
    audio: true,
    video: true
});
```

=

#### `getBlob`

```javascript
recorder.getBlob(function(blobs) {
   blobs.audio --- audio blob
   blobs.video --- video blob
   blobs.gif   --- gif blob
});

// or
var blobs = recorder.getBlob();
var audioBlob = blobs.audio;
var videoBlob = blobs.video;
var gifBlob = blobs.gif;
```

=

#### `writeToDisk`

This method allows you write all recorded blobs to indexed-db. It will auto-write those blobs to disk!

```javascript
recorder.stopRecording();

// invoke it after "stop-recording"
recorder.writeToDisk();
```

=

#### `getFromDisk`

This method allows you fetch all blobs from indexed-db or you can suggest returning only audio blob; only video or gif blob.

```javascript
// get all blobs from disk
MRecordRTC.getFromDisk('all', function(dataURL, type) {
   type == 'audio'
   type == 'video'
   type == 'gif'
});

// or get just single blob
MRecordRTC.getFromDisk('audio', function(dataURL) {
   // only audio blob is returned from disk!
});
```

You can invoke `getFromDisk` method any time; until you "manually" clear all browsing history!

=

#### `autoWriteToDisk`

You can suggest `MRecordRTC` or `RecordRTC` objects to automatically write recorded blobs to disk:

```javascript
recorder.autoWriteToDisk = true;
autoWriteToDisk.startRecording();
```

Again, it works both with `MRecordRTC` object and `RecordRTC` object. `MRecordRTC` will write all recorded blobs to disk; however `RecordRTC` object will write single blob to disk!

=

```javascript
// gif properties
recorder.quality = 1;
recorder.frameRate = 1000;

// audio properties
recorder.framSize = 96000;

// video/gif width/height
recorder.video = recorder.canvas = {
    width: innerWidth,
    height: innerHeight
};
```

=

[RecordRTC](https://www.webrtc-experiment.com/RecordRTC/) is a server-less (entire client-side) JavaScript library can be used to record WebRTC audio/video media streams. It supports cross-browser audio/video recording.

1. [RecordRTC to Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio)

=

## License

[RecordRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
