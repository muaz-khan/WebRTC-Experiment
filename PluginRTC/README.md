## [PluginRTC](https://github.com/muaz-khan/PluginRTC): IE/Safari Plugins compatible WebRTC-Experiments

This repository is a sub-part of: https://github.com/muaz-khan/WebRTC-Experiment

This repository isn't providing WebRTC plugins. It is simply using existing plugins in WebRTC-Experiments & Libraries e.g. RTCMultiConection.js, DataChannel.js and especially RecordRTC.js and MediaStreamRecorder.js.

=

### Experiments Supported?

1. [RTCMultiConection.js](https://github.com/muaz-khan/RTCMultiConnection) - `npm install rtcmulticonnection`

[Scroll to bottom](https://github.com/muaz-khan/PluginRTC#how-to-use-in-your-own-demoslibraries) to see how to use these plugins within other [WebRTC Experiments](https://github.com/muaz-khan/WebRTC-Experiment).

=

### Plugins?

1. https://github.com/sarandogou/webrtc-everywhere#downloads
2. https://temasys.atlassian.net/wiki/display/TWPP/Downloads+and+Installing

=

### How to use in your own demos/libraries?

First step; link any of the following:

```html
<script src="//cdn.webrtc-experiment.com/Plugin.EveryWhere.js"></script>

<!-- or -->
<script src="//cdn.webrtc-experiment.com/Plugin.Temasys.js"></script>
```

Second step; add following code:

```javascript
var Plugin = {};
window.onPluginRTCInitialized = function(pluginRTCObject) {
    Plugin = pluginRTCObject;
    MediaStreamTrack      = Plugin.MediaStreamTrack;
    RTCPeerConnection     = Plugin.RTCPeerConnection;
    RTCIceCandidate       = Plugin.RTCIceCandidate;
    RTCSessionDescription = Plugin.RTCSessionDescription;
};
if (!!window.PluginRTC) window.onPluginRTCInitialized(window.PluginRTC);
```

Now you can use `Plugin` object like this:

```javascript
// capture video
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var isIE = !!document.documentMode;
var isPluginRTC = isSafari || isIE;

if (isPluginRTC) {
    var mediaElement = document.createElement('video');
    Plugin.getUserMedia({
        video: true
    }, function(stream) {
        var body = (document.body || document.documentElement);
        body.insertBefore(mediaElement, body.firstChild);

        setTimeout(function() {
            Plugin.attachMediaStream(mediaElement, stream);
            
            // here you can append "mediaElement" to specific container
            // specificContainer.appendChild(mediaElement);
        }, 3000);
    }, function(error) {});
} else {
    navigator.getUserMedia(hints, success, failure);
}
```

When `onaddstream` event is fired:

```javascript
peer.onaddstream = function(event) {
    if (isPluginRTC) {
        var mediaElement = document.createElement('video');

        var body = (document.body || document.documentElement);
        body.insertBefore(mediaElement, body.firstChild);

        setTimeout(function() {
            Plugin.attachMediaStream(mediaElement, event.stream);

            // here you can append "mediaElement" to specific container
            // specificContainer.appendChild(mediaElement);
        }, 3000);
    } else {
        // do chrome/Firefox relevant stuff with "event.stream"
    }
};
```

When `onicecandidate` event is fired:

```javascript
peer.onicecandidate = function(event) {
    if (!event.candidate) return;
    
    // always use like this!
    // don't use JSON.stringify
    // or, don't directly send "event.candidate"
    sendToRemoteParty({
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex
    });
};
```

When getting local session-description (SDP):

```javascript
peer.setLocalDescription(localSdp);

// always use like this!
// don't use JSON.stringify
// or, don't directly send "RTCSessionDescription" object
sendToRemoteParty({
    type: localSdp.type,
    sdp: localSdp.sdp
});
```

=

### Muaz Khan

1. Personal Webpage — http://www.muazkhan.com
2. Email — muazkh@gmail.com
3. Twitter — https://twitter.com/muazkh and https://twitter.com/WebRTCWeb

=

### License

[PluginRTC](https://github.com/muaz-khan/PluginRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
