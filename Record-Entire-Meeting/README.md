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

# Goals

* Record both audio/video from each user participating in a meeting room.
* Record all videos from all the participants.
* Merge/Mux then Concatenate using Ffmpeg on Node.js server
* Scale videos at the end into a single grid-like stream so that later viewers are given single file containing all the videos and audios.

# Helper Scripts

[Browser-Recording-Helper.js](https://github.com/streamproc/Record-Entire-Meeting/blob/master/Browser-Recording-Helper.js):

> This script provides browser public API.

[Write-Recordings-To-Disk.js](https://github.com/streamproc/Record-Entire-Meeting/blob/master/Write-Recordings-To-Disk.js):

> This script helps writing both audio/video files to nodejs disk.

[Merge-Recordings.js](https://github.com/streamproc/Record-Entire-Meeting/blob/master/Merge-Recordings.js):

> This script helps merging/muxing both WAV/WebM into single WebM.

[Concatenate-Recordings.js](https://github.com/streamproc/Record-Entire-Meeting/blob/master/Concatenate-Recordings.js)

> This script helps concatenating all interval based recordings into single WebM file. It runs in node.js server.

[Scale-Recordings.js](https://github.com/streamproc/Record-Entire-Meeting/blob/master/Scale-Recordings.js):

> This script is currently optional. It helps increasing audio/video quality.

[MediaStreamRecorder.js](https://github.com/streamproc/Record-Entire-Meeting/blob/master/MediaStreamRecorder.js):

> It is a javascript library support cross-browser intervals-based audio/video/gif recordings.

## License

[Record-Entire-Meeting](https://github.com/streamproc/Record-Entire-Meeting) is released under [MIT licence](https://www.webrtc-experiment.com/licence/). Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
