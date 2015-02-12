## [getStats.js](https://github.com/muaz-khan/getStats) [![npm](https://img.shields.io/npm/v/getstats.svg)](https://npmjs.org/package/getstats) [![downloads](https://img.shields.io/npm/dm/getstats.svg)](https://npmjs.org/package/getstats)

A tiny JavaScript library using [WebRTC getStats API](http://dev.w3.org/2011/webrtc/editor/webrtc.html#dom-peerconnection-getstats) to return peer connection stats i.e. bandwidth usage, packets lost, local/remote ip addresses and ports, type of connection etc.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

```
npm install getstats
```

To use it:

```htm
<script src="./node_modules/getstats/getStats.js"></script>
```

## Link the library

```html
<script src="//cdn.webrtc-experiment.com/getStats.js"></script>
```

## window.getStats

To invoke directly:

```javascript
getStats(peer, callback, interval);
```

## RTCPeerConnection.prototype.getPeerStats

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

## Usage

```javascript
var rtcPeerConnection = new RTCPeerConnection(iceServers);

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

## Firefox?

```javascript
peer.getStats(peer.getLocalStreams()[0].getAudioTracks()[0], function(results) {
    // rest goes here
}, 5 * 1000);
```

## result.audio

1. availableBandwidth
2. inputLevel
3. packetsLost
3. rtt
4. packetsSent
5. bytesSent

## result.video

1. availableBandwidth
2. googFrameHeightInput
3. googFrameWidthInput
4. googCaptureQueueDelayMsPerS
5. rtt
6. packetsLost
7. packetsSent
8. googEncodeUsagePercent
9. googCpuLimitedResolution
10. googNacksReceived
11. googFrameRateInput
12. googPlisReceived
13. googViewLimitedResolution
14. googCaptureJitterMs
15. googAvgEncodeMs
16. googFrameHeightSent
17. googFrameRateSent
18. googBandwidthLimitedResolution
19. googFrameWidthSent
20. googFirsReceived
21. bytesSent

## result.connectionType

1. local.candidateType
2. local.ipAddress
3. remote.candidateType
4. remote.ipAddress
5. transport

## result.results

It is an array that is returned by browser's native PeerConnection API.

## Credits

[Muaz Khan](https://github.com/muaz-khan):

1. Personal Webpage: http://www.muazkhan.com
2. Email: muazkh@gmail.com
3. Twitter: https://twitter.com/muazkh and https://twitter.com/WebRTCWeb
4. Google+: https://plus.google.com/+WebRTC-Experiment
5. Facebook: https://www.facebook.com/WebRTC

## License

[getStats.js](https://github.com/muaz-khan/getStats) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
