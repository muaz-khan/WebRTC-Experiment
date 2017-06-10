# RecordRTC to Node.js

[![npm](https://img.shields.io/npm/v/recordrtc-nodejs.svg)](https://npmjs.org/package/recordrtc-nodejs) [![downloads](https://img.shields.io/npm/dm/recordrtc-nodejs.svg)](https://npmjs.org/package/recordrtc-nodejs) [![Build Status: Linux](https://travis-ci.org/muaz-khan/RecordRTC.png?branch=master)](https://travis-ci.org/muaz-khan/RecordRTC)

# Open sourced

* https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-Nodejs

```sh
mkdir node_modules
npm install recordrtc-nodejs

# to run it!
cd node_modules/recordrtc-nodejs/
mkdir node_modules

# install prerequisites
npm install
node server.js
```

# How to test?

In the node.js command prompt window; type `node server.js`; then open `http://localhost:9001/`.

There are some other NPM packages regarding RecordRTC:

* https://www.npmjs.org/search?q=RecordRTC

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

# Other Demos

* https://github.com/muaz-khan/RecordRTC

# License

[RecordRTC-to-Nodejs](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-Nodejs) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
