# Record Entire Meeting using Pure JavaScript API!

[![npm](https://img.shields.io/npm/v/record-entire-meeting.svg)](https://npmjs.org/package/record-entire-meeting) [![downloads](https://img.shields.io/npm/dm/record-entire-meeting.svg)](https://npmjs.org/package/record-entire-meeting)

```
npm install record-entire-meeting

node server.js
# https://127.0.0.1:9001/
# https://localhost:9001/
```

This application runs top over `MediaStreamRecorder.js`:

* https://github.com/streamproc/MediaStreamRecorder

# Browser Support

1. Canary with `chrome://flags/#enable-experimental-web-platform-features`
2. Firefox

# Goals

* Record both audio/video from each user participating in a meeting room.
* Record all videos from all the participants.
* Merge/Mux then Concatenate using Ffmpeg on Node.js server
* Scale videos at the end into a single grid-like stream so that later viewers are given single file containing all the videos and audios.

# Use in your own applications

```javascript
// 1st step
var NodeJsRecordingHandler = require('./Nodejs-Recording-Handler.js');

io.on('connection', function(socket) {
    // 2nd & last step:
    // call below line for each socket connection
    // it will never affect your other socket.io events or objects
    NodeJsRecordingHandler(socket);

    // your custom socket.io code goes here
});
```


## License

[Record-Entire-Meeting](https://github.com/streamproc/Record-Entire-Meeting) is released under [MIT licence](https://www.webrtc-experiment.com/licence/). Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
