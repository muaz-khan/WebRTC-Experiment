## [MRecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC) i.e. Multi-RecordRTC! / [Demo](https://www.webrtc-experiment.com/RecordRTC/MRecordRTC/)

[RecordRTC Documentation](http://RecordRTC.org/) / [RecordRTC Wiki Pages](https://github.com/muaz-khan/RecordRTC/wiki) / [RecordRTC Demo](https://www.webrtc-experiment.com/RecordRTC/) / [WebRTC Experiments](https://www.webrtc-experiment.com/)

[![npm](https://img.shields.io/npm/v/recordrtc.svg)](https://npmjs.org/package/recordrtc) [![downloads](https://img.shields.io/npm/dm/recordrtc.svg)](https://npmjs.org/package/recordrtc) [![Build Status: Linux](https://travis-ci.org/muaz-khan/RecordRTC.png?branch=master)](https://travis-ci.org/muaz-khan/RecordRTC)

This [WebRTC](https://www.webrtc-experiment.com/) experiment is using [RecordRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) to record multiple audio/video/gif streams.

1. It simplifies coding for multi-streams recording i.e. audio+video recording
2. It auto synchronizes audio and video
3. It is capable to write all blobs to indexed-db
4. It allows to get/fetch all blobs or individual blob from disk/indexed-db

=

```html
<script src="https://cdn.WebRTC-Experiment.com/RecordRTC.js"></script>
<script>
var recorder = new MRecordRTC();
recorder.addStream(MediaStream);
recorder.mediaType = {
   audio: true, // or StereoAudioRecorder
   video: true, // or WhammyRecorder
   gif: true    // or GifRecorder
};
// mimeType is optional and should be set only in advance cases.
recorder.mimeType = {
    audio: 'audio/wav',
    video: 'video/webm',
    gif:   'image/gif'
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

#### `mediaType`

```javascript
// normally
recorder.mediaType = {
   audio: true,
   video: true,
   gif: true
};

// or advance cases:
recorder.mediaType = {
   audio: StereoAudioRecorder, // or MediaStreamRecorder
   video: WhammyRecorder, // or MediaStreamRecorder
   gif: GifRecorder // or TRUE
};
```

=

#### `mimeType`

```javascript
// mimeType is optional and should be set only in advance cases.
recorder.mimeType = {
    audio: 'audio/wav',  // audio/ogg or audio/webm or audio/wav
    video: 'video/webm', // video/webm or video/vp8
    gif:   'image/gif'
};
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

## License

[RecordRTC.js](https://github.com/muaz-khan/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://www.MuazKhan.com/).
