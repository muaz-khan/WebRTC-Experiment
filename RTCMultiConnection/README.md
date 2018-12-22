<a href="https://www.rtcmulticonnection.org/"><img src="https://i.imgur.com/MFfRBSM.png" /></a>

## RTCMultiConnection - WebRTC JavaScript Library

### Demos: https://rtcmulticonnection.herokuapp.com/demos/

[![npm](https://img.shields.io/npm/v/rtcmulticonnection.svg)](https://npmjs.org/package/rtcmulticonnection) [![downloads](https://img.shields.io/npm/dm/rtcmulticonnection.svg)](https://npmjs.org/package/rtcmulticonnection) [![Build Status: Linux](https://travis-ci.org/muaz-khan/RTCMultiConnection.png?branch=master)](https://travis-ci.org/muaz-khan/RTCMultiConnection)

## Install On Your Own Site

* https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/installation-guide.md

```sh
mkdir demo && cd demo

# install from NPM
npm install rtcmulticonnection

# or clone from github
git clone https://github.com/muaz-khan/RTCMultiConnection.git ./

# install all required packages
# you can optionally include --save-dev
npm install
node server --port=9001
```

## Free socket.io servers

```javascript
// v3.4.7 or newer
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

// v3.4.6 or older
connection.socketURL = 'https://webrtcweb.com:9001/';
```

## Install ONLY socket.io server

```sh
npm install rtcmulticonnection-server
node server --port=9001
```

For more info, please check:

* https://github.com/muaz-khan/RTCMultiConnection-Server

## YouTube videos

1. [Getting started guide / RTCMultiConnection](https://www.youtube.com/watch?v=jqtC7mSTCgk)
2. [Setup custom socket.io server / RTCMultiConnection](https://www.youtube.com/watch?v=EtsiYEW_T8Y)
3. [Write screen sharing applications / RTCMultiConnection](https://www.youtube.com/watch?v=nBUuMKtEeyU)
4. [YouTube Playlist](https://www.youtube.com/playlist?list=PLPRQUXAnRydKdyun-vjKPMrySoow2N4tl)
5. RTCMultiConnection-v2 (old) videos: https://vimeo.com/muazkh

## [Docs/Tutorials](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/)

1. [Getting Started guide for RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/getting-started.md)
2. [Installation Guide](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/installation-guide.md)
3. [How to Use?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/how-to-use.md)
4. [API Reference](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/api.md)
5. [Upgrade from v2 to v3](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/upgrade.md)
6. [How to write iOS/Android applications?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/ios-android.md)
7. [Tips & Tricks](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/tips-tricks.md)

## iOS+Android Demo Apps

* https://github.com/muaz-khan/cordova-mobile-apps
* https://webrtcweb.com/cordova-apps/

> Note: RTCMultiConnection supports Safari-11 and Edge.

## Wiki Pages

* https://github.com/muaz-khan/RTCMultiConnection/wiki
* https://github.com/muaz-khan/RTCMultiConnection-Server/wiki

## License

[RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](https://MuazKhan.com/).
