# [getStats.js](https://github.com/muaz-khan/getStats) | WebRTC getStats API

# [Single Page Demo](https://www.webrtc-experiment.com/getStats/) or [Multi User P2P Demo](https://rtcmulticonnection.herokuapp.com/demos/getStats.html)

[![npm](https://img.shields.io/npm/v/getstats.svg)](https://npmjs.org/package/getstats) [![downloads](https://img.shields.io/npm/dm/getstats.svg)](https://npmjs.org/package/getstats) [![Build Status: Linux](https://travis-ci.org/muaz-khan/getStats.png?branch=master)](https://travis-ci.org/muaz-khan/getStats)

A tiny JavaScript library using [WebRTC getStats API](http://dev.w3.org/2011/webrtc/editor/webrtc.html#dom-peerconnection-getstats) to return peer connection stats i.e. bandwidth usage, packets lost, local/remote ip addresses and ports, type of connection etc.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

![getStats](https://cdn.webrtc-experiment.com/images/getStats.png)

```
npm install getstats

cd node_modules
cd getstats
node server.js

# and open:
# http://localhost:9999/
```

To use it:

```htm
<script src="./node_modules/getstats/getStats.js"></script>
```

# Link the library

```html
<script src="https://cdn.webrtc-experiment.com/getStats.js"></script>

<!-- or min.js -->
<script src="https://cdn.webrtc-experiment.com/getStats.min.js"></script>

<!-- or without CDN -->
<script src="https://www.webrtc-experiment.com/getStats.js"></script>

<!-- or rawgit -->
<script src="https://rawgit.com/muaz-khan/getStats/master/getStats.js"></script>
```

Or link specific build:

* https://github.com/muaz-khan/getStats/releases

```html
<script src="https://github.com/muaz-khan/getStats/releases/download/1.0.5/getStats.js"></script>
```

# `window.getStats`

To invoke directly:

```javascript
getStats(peer, callback, interval);
```

# RTCPeerConnection.prototype.getPeerStats

Or, to setup an instance method:

```javascript
// if your code is encapsulated under a method
(function() {
    RTCPeerConnection.prototype.getPeerStats = window.getStats;
    
    // or
    RTCPeerConnection.prototype.__getStats = window.getStats;
    
    // or
    RTCPeerConnection.prototype.getConnectionStats = window.getStats;
    
    // or
    RTCPeerConnection.prototype['your-choice'] = window.getStats;
})();
```

**NEVER set/override `RTCPeerConnection.prototype.getStats`** because it is a reserved method.

```javascript
// following will fail
RTCPeerConnection.prototype.getStats = window.getStats;

// it should be
RTCPeerConnection.prototype.intanceMethodNamae = window.getStats;
```

# Usage

```javascript
var rtcPeerConnection = new RTCPeerConnection(rtcConfig);

var repeatInterval = 2000; // 2000 ms == 2 seconds
rtcPeerConnection.getPeerStats(function(result) {
    result.connectionType.remote.ipAddress
    result.connectionType.remote.candidateType
    result.connectionType.transport
    
    result.bandwidth.availableSendBandwidth // it will be your system bandwidth for STUN connections
    result.audio.packetsSent
    result.audio.packetsLost
    result.audio.rtt
    
    // to access native "results" array
    result.results.forEach(function(r) {
        console.log(r);
    });
}, repeatInterval);
```

# Firefox?

```javascript
peer.getStats(peer.getLocalStreams()[0].getAudioTracks()[0], function(results) {
    // rest goes here
}, 5 * 1000);
```

# `result.datachannel`

```javascript
// states => open or close
alert(result.datachannel.state === 'open');
```

# `result.isOfferer`

Offerer is the person who invoked `createOffer` method.

# `result.encryption`

To detect which tech is used to encrypt your connections.

```javascript
alert(result.encryption === 'sha-256');
```

# `result.nomore()`

This function can be used to ask to stop invoking getStats API.

```javascript
btnStopGetStats.onclick  = function() {
    getStatsResult.nomore();
};
```

# `result.bandwidth`

1. `result.bandwidth.availableSendBandwidth`

# `result.audio`

1. `result.audio.send.availableBandwidth`
2. `result.audio.recv.availableBandwidth`
3. `result.audio.inputLevel`
4. `result.audio.packetsLost`
5. `result.audio.rtt`
6. `result.audio.packetsSent`
7. `result.audio.bytesSent`
8. `result.video.tracks.length` /* array */

# `result.video`

1. `result.video.send.availableBandwidth`
2. `result.video.recv.availableBandwidth`
3. `result.video.googFrameHeightInput`
4. `result.video.googFrameWidthInput`
5. `result.video.googCaptureQueueDelayMsPerS`
6. `result.video.rtt`
7. `result.video.packetsLost`
8. `result.video.packetsSent`
9. `result.video.googEncodeUsagePercent`
10. `result.video.googCpuLimitedResolution`
11. `result.video.googNacksReceived`
12. `result.video.googFrameRateInput`
13. `result.video.googPlisReceived`
14. `result.video.googViewLimitedResolution`
15. `result.video.googCaptureJitterMs`
16. `result.video.googAvgEncodeMs`
17. `result.video.googFrameHeightSent`
18. `result.video.googFrameRateSent`
19. `result.video.googBandwidthLimitedResolution`
20. `result.video.googFrameWidthSent`
21. `result.video.googFirsReceived`
22. `result.video.bytesSent`
23. `result.video.tracks.length` /* array */

# `result.connectionType`

1. `result.connectionType.local.candidateType`
2. `result.connectionType.local.ipAddress` /* external ip-address */
3. `result.connectionType.local.networkType`
4. `result.connectionType.remote.candidateType`
5. `result.connectionType.remote.ipAddress`
6. `result.connectionType.transport`
7. `result.connectionType.systemIpAddress` /* 192.168.1.1 */

# `result.resolutions`

1. `result.resolutions.send.width`
2. `result.resolutions.send.height`
3. `result.resolutions.recv.width`
4. `result.resolutions.recv.height`

# `result.results`

It is an array that is returned by browser's native PeerConnection API.

```javascript
console.log(result.results);
```

## License

[getStats.js](https://github.com/muaz-khan/getStats) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
