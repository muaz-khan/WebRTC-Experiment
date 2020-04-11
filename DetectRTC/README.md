<a href="https://github.com/muaz-khan/DetectRTC"><img alt="DetectRTC" src="https://www.webrtc-experiment.com/images/DetectRTC-icon.png" /> DetectRTC.js</a>

# DetectRTC | Is WebRTC Supported In Your Browser?

[![npm](https://img.shields.io/npm/v/detectrtc.svg)](https://npmjs.org/package/detectrtc) [![downloads](https://img.shields.io/npm/dm/detectrtc.svg)](https://npmjs.org/package/detectrtc)  [![Build Status: Linux](https://travis-ci.org/muaz-khan/DetectRTC.png?branch=master)](https://travis-ci.org/muaz-khan/DetectRTC) <a href="https://www.browserstack.com"><img src="https://3fxtqy18kygf3on3bu39kh93-wpengine.netdna-ssl.com/wp-content/themes/browserstack/img/browserstack-logo.svg" height="20px" /></a>

### Live Demo: https://www.webrtc-experiment.com/DetectRTC/

```javascript
if (DetectRTC.isWebRTCSupported === false) {
    alert('Please use Chrome or Firefox.');
}

if (DetectRTC.hasWebcam === false) {
    alert('Please install an external webcam device.');
}

if (DetectRTC.hasMicrophone === false) {
    alert('Please install an external microphone device.');
}

if (DetectRTC.hasSpeakers === false && (DetectRTC.browser.name === 'Chrome' || DetectRTC.browser.name === 'Edge')) {
    alert('Oops, your system can not play audios.');
}
```

## What is this?

A tiny JavaScript library that can be used to detect WebRTC features e.g. system having speakers, microphone or webcam, screen capturing is supported, number of audio/video devices etc.

## Free?

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

## Tests?

* https://travis-ci.org/muaz-khan/DetectRTC

## Releases?

* https://github.com/muaz-khan/DetectRTC/releases

## How to install?

```
npm install detectrtc --production

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

# LocalHost

```sh
node server.js

# or
npm start

# and open:
http://127.0.0.1:9001

# or
http://localhost:9001
```

# NPM

```javascript
var DetectRTC = require('detectrtc');

console.log(DetectRTC.browser);

DetectRTC.load(function() {
    console.log(DetectRTC);
});
```

* Live NPM test: https://tonicdev.com/npm/detectrtc

Or try `npm-test.js`:

```sh
cd node_modules
cd detectrtc

# npm test
# or
node npm-test.js
```

# How to link the script?

```html
<script src="./node_modules/detectrtc/DetectRTC.js"></script>

<!-- or bower -->
<script src="./bower_components/detectrtc/DetectRTC.js"></script>

<!-- or RawGit (if CDN fails) -->
<script src="https://cdn.rawgit.com/muaz-khan/DetectRTC/master/DetectRTC.js"></script>

<!-- Not Recommended -->
<script src="https://www.webrtc-experiment.com/DetectRTC.js"></script>
```

You can even link specific versions:

```html
<script src="https://github.com/muaz-khan/DetectRTC/releases/download/1.4.0/DetectRTC.js"></script>
```

<img src="https://www.webrtc-experiment.com/images/DetectRTC.png" style="width:100%;" />

# How to use it?

```javascript
// for node.js users
var DetectRTC = require('detectrtc');

// non-nodejs users can skip above line
// below code will work for all users

DetectRTC.load(function() {
    DetectRTC.hasWebcam; // (has webcam device!)
    DetectRTC.hasMicrophone; // (has microphone device!)
    DetectRTC.hasSpeakers; // (has speakers!)
    DetectRTC.isScreenCapturingSupported; // Chrome, Firefox, Opera, Edge and Android
    DetectRTC.isSctpDataChannelsSupported;
    DetectRTC.isRtpDataChannelsSupported;
    DetectRTC.isAudioContextSupported;
    DetectRTC.isWebRTCSupported;
    DetectRTC.isDesktopCapturingSupported;
    DetectRTC.isMobileDevice;

    DetectRTC.isWebSocketsSupported;
    DetectRTC.isWebSocketsBlocked;
    DetectRTC.checkWebSocketsSupport(callback);

    DetectRTC.isWebsiteHasWebcamPermissions;        // getUserMedia allowed for HTTPs domain in Chrome?
    DetectRTC.isWebsiteHasMicrophonePermissions;    // getUserMedia allowed for HTTPs domain in Chrome?

    DetectRTC.audioInputDevices;    // microphones
    DetectRTC.audioOutputDevices;   // speakers
    DetectRTC.videoInputDevices;    // cameras

    DetectRTC.osName;
    DetectRTC.osVersion;

    DetectRTC.browser.name === 'Edge' || 'Chrome' || 'Firefox';
    DetectRTC.browser.version;
    DetectRTC.browser.isChrome;
    DetectRTC.browser.isFirefox;
    DetectRTC.browser.isOpera;
    DetectRTC.browser.isIE;
    DetectRTC.browser.isSafari;
    DetectRTC.browser.isEdge;

    DetectRTC.browser.isPrivateBrowsing; // incognito or private modes

    DetectRTC.isCanvasSupportsStreamCapturing;
    DetectRTC.isVideoSupportsStreamCapturing;

    DetectRTC.DetectLocalIPAddress(callback);
});
```

# `DetectRTC.version`

DetectRTC is supporting `version` property since `1.4.0`.

```javascript
if(DetectRTC.version === '1.4.0') {
    alert('We are using DetectRTC version 1.4.0');
}
```

# Why `load` method?

If you're not detecting audio/video input/output devices then you can skip this method.

`DetectRTC.load` simply makes sure that all devices are captured and valid result is set for relevant properties.

# How to fix devices' labels?

You need to check for `device.isCustomLabel` boolean. If this boolean is `true` then assume that DetectRTC given a custom label to the device.

You must getUserMedia request whenever you find `isCustomLabel===true`. getUserMedia request will return valid device labels.

```javascript
if (DetectRTC.MediaDevices[0] && DetectRTC.MediaDevices[0].isCustomLabel) {
    // it seems that we did not make getUserMedia request yet
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    }).then(function(stream) {
        var video;
        try {
            video = document.createElement('video');
            video.muted = true;
            video.src = URL.createObjectURL(stream);
            video.style.display = 'none';
            (document.body || document.documentElement).appendChild(vide);
        } catch (e) {}

        DetectRTC.load(function() {
            DetectRTC.videoInputDevices.forEach(function(device, idx) {
                // ------------------------------
                // now you get valid label here
                console.log(device.label);
                // ------------------------------
            });

            // release camera
            stream.getTracks().forEach(function(track) {
                track.stop();
            });

            if (video && video.parentNode) {
                video.parentNode.removeChild(video);
            }
        });
    });
} else {
    DetectRTC.videoInputDevices.forEach(function(device, idx) {
        console.log(device.label);
    });
}
```

# How to select specific camera?

Demo: [https://jsfiddle.net/cf90az9q/](https://jsfiddle.net/cf90az9q/)

```html
<script src="https://www.webrtc-experiment.com/DetectRTC/CheckDeviceSupport.js"></script>
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

```sh
mkdir DetectRTC
cd DetectRTC
git clone git://github.com/muaz-khan/DetectRTC.git ./

# install grunt for code style verifications
npm install grunt-cli

# install all dependencies
npm install --save-dev

# verify your changes
# npm test  # or "grunt"
grunt

# Success? Make a pull request!
```

# Github

* https://github.com/muaz-khan/DetectRTC

# Tests powered by

<a href="https://www.browserstack.com"><img src="https://3fxtqy18kygf3on3bu39kh93-wpengine.netdna-ssl.com/wp-content/themes/browserstack/img/browserstack-logo.svg" height="32px" /></a>

**Check tests here:** https://travis-ci.org/muaz-khan/DetectRTC

# License

[DetectRTC.js](https://github.com/muaz-khan/DetectRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
