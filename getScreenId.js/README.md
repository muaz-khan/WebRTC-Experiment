# [getStats.js](https://github.com/muaz-khan/getStats) / [Demo](https://www.webrtc-experiment.com/getStats/)

[![npm](https://img.shields.io/npm/v/getstats.svg)](https://npmjs.org/package/getstats) [![downloads](https://img.shields.io/npm/dm/getstats.svg)](https://npmjs.org/package/getstats)

A tiny JavaScript library using [WebRTC getStats API](http://dev.w3.org/2011/webrtc/editor/webrtc.html#dom-peerconnection-getstats) to return peer connection stats i.e. bandwidth usage, packets lost, local/remote ip addresses and ports, type of connection etc.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

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
```

Or link specific build:

* https://github.com/muaz-khan/getStats/releases

```html
<script src="https://github.com/muaz-khan/getStats/releases/download/1.0.4/getStats.js"></script>
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
    
    result.audio.availableBandwidth
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

# `result.audio`

1. `result.audio.availableBandwidth`
2. `result.audio.inputLevel`
3. `result.audio.packetsLost`
3. `result.audio.rtt`
4. `result.audio.packetsSent`
5. `result.audio.bytesSent`

# `result.video`

1. `result.video.availableBandwidth`
2. `result.video.googFrameHeightInput`
3. `result.video.googFrameWidthInput`
4. `result.video.googCaptureQueueDelayMsPerS`
5. `result.video.rtt`
6. `result.video.packetsLost`
7. `result.video.packetsSent`
8. `result.video.googEncodeUsagePercent`
9. `result.video.googCpuLimitedResolution`
10. `result.video.googNacksReceived`
11. `result.video.googFrameRateInput`
12. `result.video.googPlisReceived`
13. `result.video.googViewLimitedResolution`
14. `result.video.googCaptureJitterMs`
15. `result.video.googAvgEncodeMs`
16. `result.video.googFrameHeightSent`
17. `result.video.googFrameRateSent`
18. `result.video.googBandwidthLimitedResolution`
19. `result.video.googFrameWidthSent`
20. `result.video.googFirsReceived`
21. `result.video.bytesSent`

# `result.connectionType`

1. `result.connectionType.local.candidateType`
2. `result.connectionType.local.ipAddress`
3. `result.connectionType.local.networkType`
4. `result.connectionType.remote.candidateType`
5. `result.connectionType.remote.ipAddress`
6. `result.connectionType.transport`

# `result.results`

It is an array that is returned by browser's native PeerConnection API.

```javascript
console.log(result.results);
```

## License

[getStats.js](https://github.com/muaz-khan/getStats) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
