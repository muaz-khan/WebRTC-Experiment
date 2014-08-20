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
Plugin.getUserMedia({video: true}, function(stream) {
    Plugin.attachMediaStream( DOMLoaded_HTML_Video_Element, stream );
}, function(error) {});
```

=

### Muaz Khan

1. Personal Webpage — http://www.muazkhan.com
2. Email — muazkh@gmail.com
3. Twitter — https://twitter.com/muazkh and https://twitter.com/WebRTCWeb

=

### License

[PluginRTC](https://github.com/muaz-khan/PluginRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
