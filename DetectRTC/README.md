# [DetectRTC.js](https://github.com/muaz-khan/DetectRTC) / [Try LIVE Demo](https://www.webrtc-experiment.com/DetectRTC/)

[![npm](https://img.shields.io/npm/v/detectrtc.svg)](https://npmjs.org/package/detectrtc) [![downloads](https://img.shields.io/npm/dm/detectrtc.svg)](https://npmjs.org/package/detectrtc)  [![Build Status: Linux](https://travis-ci.org/muaz-khan/DetectRTC.png?branch=master)](https://travis-ci.org/muaz-khan/DetectRTC)

* [Check all DetectRTC releases](https://github.com/muaz-khan/DetectRTC/releases)

A tiny JavaScript library that can be used to detect WebRTC features e.g. system having speakers, microphone or webcam, screen capturing is supported, number of audio/video devices etc.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

```
npm install detectrtc

# or via "bower"
bower install detectrtc
```

# Proposed NEW API

```javascript
DetectRTC.isSetSinkIdSupported                  // (implemented)
DetectRTC.isRTPSenderReplaceTracksSupported     // (implemented)
DetectRTC.isORTCSupported                       // (implemented)
DetectRTC.isRemoteStreamProcessingSupported     // (implemented)

DetectRTC.isWebsiteHasWebcamPermissions        // (implemented)
DetectRTC.isWebsiteHasMicrophonePermissions    // (implemented)

DetectRTC.audioInputDevices    // (implemented)
DetectRTC.audioOutputDevices   // (implemented)
DetectRTC.videoInputDevices    // (implemented)

// Below API are NOT implemented yet
DetectRTC.browser.googSupportedFlags.googDAEEchoCancellation
DetecRTC.browser.googSupportedFlags.echoCancellation
DetectRTC.isMediaHintsSupportsNewSyntax
```

# Test in LocalHost

```
node server.js

# and open:
127.0.0.1:9001

# or
http://localhost:9001
```

# Test on NPM

```javascript
var DetectRTC = require('detectrtc');

console.log(DetectRTC.browser);

DetectRTC.load(function() {
    console.log(DetectRTC);
});
```

* Live NPM test: https://tonicdev.com/npm/detectrtc

Or try `npm-test.js`:

```
cd node_modules
cd detectrtc
node npm-test.js
```

# How to link?

```html
<script src="./node_modules/detectrtc/DetectRTC.js"></script>

<!-- or bower -->
<script src="./bower_components/detectrtc/DetectRTC.js"></script>

<!-- or CDN link (suggested) -->
<script src="https://cdn.webrtc-experiment.com/DetectRTC.js"></script>

<!-- or RawGit (if CDN fails) -->
<script src="https://cdn.rawgit.com/muaz-khan/DetectRTC/master/DetectRTC.js"></script>
```

You can even link specific versions:

```html
<script src="https://github.com/muaz-khan/DetectRTC/releases/download/1.3.4/DetectRTC.js"></script>
```

<img src="https://cdn.webrtc-experiment.com/images/DetectRTC.png" style="width:100%;" />

# How to use it?

```javascript
// for node.js users
var DetectRTC = require('detectrtc');

// non-nodejs users can skip above line
// below code will work for all users

DetectRTC.load(function() {
    DetectRTC.hasWebcam (has webcam device!)
    DetectRTC.hasMicrophone (has microphone device!)
    DetectRTC.hasSpeakers (has speakers!)
    DetectRTC.isScreenCapturingSupported
    DetectRTC.isSctpDataChannelsSupported
    DetectRTC.isRtpDataChannelsSupported
    DetectRTC.isAudioContextSupported
    DetectRTC.isWebRTCSupported
    DetectRTC.isDesktopCapturingSupported
    DetectRTC.isMobileDevice

    DetectRTC.isWebSocketsSupported
    DetectRTC.isWebSocketsBlocked
    DetectRTC.checkWebSocketsSupport(callback)

    DetectRTC.isWebsiteHasWebcamPermissions        // getUserMedia allowed for HTTPs domain in Chrome?
    DetectRTC.isWebsiteHasMicrophonePermissions    // getUserMedia allowed for HTTPs domain in Chrome?

    DetectRTC.audioInputDevices    // microphones
    DetectRTC.audioOutputDevices   // speakers
    DetectRTC.videoInputDevices    // cameras

    DetectRTC.osName
    DetectRTC.osVersion

    DetectRTC.browser.name === 'Edge' || 'Chrome' || 'Firefox'
    DetectRTC.browser.version
    DetectRTC.browser.isChrome
    DetectRTC.browser.isFirefox
    DetectRTC.browser.isOpera
    DetectRTC.browser.isIE
    DetectRTC.browser.isSafari
    DetectRTC.browser.isEdge

    DetectRTC.browser.isPrivateBrowsing // incognito or private modes

    DetectRTC.isCanvasSupportsStreamCapturing
    DetectRTC.isVideoSupportsStreamCapturing

    DetectRTC.DetectLocalIPAddress(callback)
});
```

# Why `load` method?

If you're not detecting audio/video input/outupt devices then you can skip this method.

`DetectRTC.load` simply makes sure that all devices are captured and valid result is set for relevant properties.

# How to use specific files?

Demo: [https://jsfiddle.net/cf90az9q/](https://jsfiddle.net/cf90az9q/)

```html
<script src="https://cdn.webrtc-experiment.com/DetectRTC/checkDeviceSupport.js"></script>
<script>
function selectSecondaryCamera() {
    checkDeviceSupport(function() {
        var secondDevice = videoInputDevices[1];
        if(!secondDevice) return alert('Secondary webcam is NOT available.');

        var videoConstraints = {
            deviceId: secondDevice.deviceId
        };

        if(!!navigator.webkitGetUserMedia) {
            videoConstraints = {
                mandatory: {},
                optional: [{
                    sourceId: secondDevice.deviceId
                }]
            }
        }

        navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
        navigator.getUserMedia({ video: videoConstraints }, function(stream) {
            //
        }, function(error) {
            alert(JSON.stringify(error));
        });
    });
}
</script>
```

For further tricks & usages:

* https://www.webrtc-experiment.com/webrtcpedia/#modify-streams

# Rules to Contribute

```
git clone --depth=50 --branch=development git://github.com/muaz-khan/DetectRTC.git muaz-khan/DetectRTC

# install all dependencies
[sudo] npm install

# install grunt for code style verifications
[sudo] npm install grunt-cli
[sudo] npm install grunt

# verify your changes
npm test  # or "grunt"

# Success? Make a pull request!
```

# License

[DetectRTC.js](https://github.com/muaz-khan/DetectRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
