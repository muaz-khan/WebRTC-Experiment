# [getUserMedia Adatper](https://github.com/muaz-khan/gumadapter)

Copyrights goes to:

* https://github.com/webrtc/adapter/blob/master/LICENSE.md

[![npm](https://img.shields.io/npm/v/gumadapter.svg)](https://npmjs.org/package/gumadapter) [![downloads](https://img.shields.io/npm/dm/gumadapter.svg)](https://npmjs.org/package/gumadapter)

> `navigator.getUserMedi` is upgraded into promises based API: `navigator.mediaDevices.getUserMedia`.
>
> This shim/polyfill merely helps handling cross-browser issues.

# Check all releases:

* https://github.com/muaz-khan/gumadapter/releases

## How to link?

```html
<script src="https://cdn.WebRTC-Experiment.com/gumadapter.js"></script>
```

It is suggested to link specific release:

* https://github.com/muaz-khan/gumadapter/releases

E.g.

```html
<!-- use 5.2.4 or any other version -->
<script src="https://github.com/muaz-khan/gumadapter/releases/download/1.0.0/gumadapter.js"></script>
```

# How to use?

```javascript
function successCallback(stream) {
    video.srcObject = stream;
}

function errorCallback(error) {
    // maybe another application is using the device
}

var mediaConstraints = { video: true, audio: true };

navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
```
