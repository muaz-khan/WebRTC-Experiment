# [DetectRTC.js](https://github.com/muaz-khan/DetectRTC) / [Demo](https://www.webrtc-experiment.com/DetectRTC/) [![npm](https://img.shields.io/npm/v/detectrtc.svg)](https://npmjs.org/package/detectrtc) [![downloads](https://img.shields.io/npm/dm/detectrtc.svg)](https://npmjs.org/package/detectrtc)  [![Build Status: Linux](https://travis-ci.org/muaz-khan/DetectRTC.png?branch=master)](https://travis-ci.org/muaz-khan/DetectRTC)

A tiny JavaScript library that can be used to detect WebRTC features e.g. system having speakers, microphone or webcam, screen capturing is supported, number of audio/video devices etc.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

```
npm install detectrtc

# or
bower install detectrtc
```

To use it:

```html
<script src="./node_modules/detectrtc/DetectRTC.js"></script>

<!-- or CDN link -->
<script src="//cdn.webrtc-experiment.com/DetectRTC.js"></script>
```

**Check all releases:**

* https://github.com/muaz-khan/DetectRTC/releases

<img src="https://cdn.webrtc-experiment.com/images/DetectRTC.png" style="width:100%;" />

# How to use it?

```javascript
DetectRTC.load(function() {
    // DetectRTC.hasWebcam (has webcam device!)
    // DetectRTC.hasMicrophone (has microphone device!)
    // DetectRTC.hasSpeakers (has speakers!)
    // DetectRTC.isScreenCapturingSupported
    // DetectRTC.isSctpDataChannelsSupported
    // DetectRTC.isRtpDataChannelsSupported
    // DetectRTC.isAudioContextSupported
    // DetectRTC.isWebRTCSupported
    // DetectRTC.isDesktopCapturingSupported
    // DetectRTC.isMobileDevice
    // DetectRTC.isWebSocketsSupported
    
    // DetectRTC.osName
    
    // DetectRTC.browser.name
    // DetectRTC.browser.version
    // DetectRTC.browser.isChrome
    // DetectRTC.browser.isFirefox
    // DetectRTC.browser.isOpera
    // DetectRTC.browser.isIE
    // DetectRTC.browser.isSafari

    // DetectRTC.DetectLocalIPAddress(callback)
});
```

## Why `load` method?

If you're not detecting audio/video input/outupt devices then you can skip this method.

`DetectRTC.load` simply makes sure that all devices are captured and valid result is set for relevant properties.

# Demo

* https://www.webrtc-experiment.com/DetectRTC/

# License

[DetectRTC.js](https://github.com/muaz-khan/DetectRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
