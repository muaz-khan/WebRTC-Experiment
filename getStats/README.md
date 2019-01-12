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

# Usage

```javascript
var rtcPeerConnection = new RTCPeerConnection(rtcConfig);

var repeatInterval = 2000; // 2000 ms == 2 seconds
getStats(rtcPeerConnection, function(result) {
    result.connectionType.remote.ipAddress
    result.connectionType.remote.candidateType
    result.connectionType.transport
    
    result.bandwidth.speed // bandwidth download speed (bytes per second)
    
    // to access native "results" array
    result.results.forEach(function(item) {
        if (item.type === 'ssrc' && item.transportId === 'Channel-audio-1') {
            var packetsLost = item.packetsLost;
            var packetsSent = item.packetsSent;
            var audioInputLevel = item.audioInputLevel;
            var trackId = item.googTrackId; // media stream track id
            var isAudio = item.mediaType === 'audio'; // audio or video
            var isSending = item.id.indexOf('_send') !== -1; // sender or receiver

            console.log('SendRecv type', item.id.split('_send').pop());
            console.log('MediaStream track type', item.mediaType);
        }
    });
}, repeatInterval);
```

# Safari?

```javascript
var audioTrack = stream.getTracks().filter(function(t) {
    return t.kind === 'audio';
});

getStats(peer, audioTrack, function(results) {
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

You can use `result.bandwidth.speed` to detect your system's available download speed.

```json
{
    "speed": 25191,
    "systemBandwidth": 0,
    "sentPerSecond": 0,
    "encodedPerSecond": 0,
    "helper": {
        "audioBytesSent": 103053,
        "videoBytestSent": 0,
        "videoBytesSent": 4316619
    },
    "availableSendBandwidth": "5181906",
    "googActualEncBitrate": "294608",
    "googAvailableSendBandwidth": "5181906",
    "googAvailableReceiveBandwidth": "0",
    "googRetransmitBitrate": "0",
    "googTargetEncBitrate": "1700000",
    "googBucketDelay": "0",
    "googTransmitBitrate": "198296"
}
```

# `result.audio`

```json
{
    "send": {
        "tracks": ["ab5be64a-00b0-4c69-9ffa-b934a3cdaf92"],
        "codecs": ["opus"],
        "availableBandwidth": "0.4",
        "streams": 1
    },
    "recv": {
        "tracks": ["ab5be64a-00b0-4c69-9ffa-b934a3cdaf92"],
        "codecs": ["opus"],
        "availableBandwidth": "0.4",
        "streams": 1
    },
    "bytesSent": 103053,
    "bytesReceived": 103053
}
```

# `result.video`

```json
{
    "send": {
        "tracks": ["c07bbd24-4e99-4b94-b429-5174370f8d12"],
        "codecs": ["VP9"],
        "availableBandwidth": "24.2",
        "streams": 1
    },
    "recv": {
        "tracks": ["c07bbd24-4e99-4b94-b429-5174370f8d12"],
        "codecs": ["VP9"],
        "availableBandwidth": "25.5",
        "streams": 1
    },
    "bytesSent": 4316619,
    "bytesReceived": 4294692
}
```

# `result.connectionType`

```json
{
    "systemNetworkType": "wifi",
    "systemIpAddress": ["192.168.1.2:66666"],
    "local": {
        "candidateType": ["host"],
        "transport": ["udp"],
        "ipAddress": ["192.168.1.2:66666"],
        "networkType": ["wlan"]
    },
    "remote": {
        "candidateType": ["host"],
        "transport": ["udp"],
        "ipAddress": ["192.168.1.2:66666"],
        "networkType": []
    },
    "transport": "udp"
}
```

# `result.resolutions`

```json
{
    "send": {
        "width": "640",
        "height": "480"
    },
    "recv": {
        "width": "640",
        "height": "480"
    }
}
```

# `result.results`

It is an array that is returned by browser's native PeerConnection API.

```javascript
// "getStatsResult" is your "result" object
getStatsResult.results.forEach(function(item) {
    if (item.type === 'ssrc' && item.transportId === 'Channel-audio-1') {
        var packetsLost = item.packetsLost;
        var packetsSent = item.packetsSent;
        var audioInputLevel = item.audioInputLevel;
        var trackId = item.googTrackId; // media stream track id
        var isAudio = item.mediaType === 'audio'; // audio or video
        var isSending = item.id.indexOf('_send') !== -1; // sender or receiver

        console.log('SendRecv type', item.id.split('_send').pop());
        console.log('MediaStream track type', item.mediaType);
    }
});
```

**Above array looks like this:**

```json
[{
    "googTrackId": "ab5be64a-00b0-4c69-9ffa-b934a3cdaf92",
    "id": "googTrack_ab5be64a-00b0-4c69-9ffa-b934a3cdaf92",
    "type": "googTrack",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "googInitiator": "true",
    "id": "googLibjingleSession_2403774673032347671",
    "type": "googLibjingleSession",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "googActualEncBitrate": "294608",
    "googAvailableSendBandwidth": "5181906",
    "googRetransmitBitrate": "0",
    "googAvailableReceiveBandwidth": "0",
    "googTargetEncBitrate": "1700000",
    "googBucketDelay": "0",
    "googTransmitBitrate": "198296",
    "id": "bweforvideo",
    "type": "VideoBwe",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "googTrackId": "c07bbd24-4e99-4b94-b429-5174370f8d12",
    "id": "googTrack_c07bbd24-4e99-4b94-b429-5174370f8d12",
    "type": "googTrack",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "googFingerprint": "8B:---:70",
    "googFingerprintAlgorithm": "sha-256",
    "googDerBase64": "MII----FdhT",
    "id": "googCertificate_8B:---:70",
    "type": "googCertificate",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "googFingerprint": "EE:---:80",
    "googFingerprintAlgorithm": "sha-256",
    "googDerBase64": "MI----kr",
    "id": "googCertificate_EE:13:---:80",
    "type": "googCertificate",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "googComponent": "1",
    "remoteCertificateId": "googCertificate_EE:---:80",
    "selectedCandidatePairId": "Conn-audio-1-0",
    "dtlsCipher": "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
    "localCertificateId": "googCertificate_8B:---:70",
    "srtpCipher": "AES_CM_128_HMAC_SHA1_32",
    "id": "Channel-audio-1",
    "type": "googComponent",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "responsesSent": "12",
    "requestsReceived": "12",
    "googRemoteCandidateType": "local",
    "googReadable": "true",
    "googLocalAddress": "192.168.1.2:61885",
    "consentRequestsSent": "1",
    "googTransportType": "udp",
    "googChannelId": "Channel-audio-1",
    "googLocalCandidateType": "local",
    "googWritable": "true",
    "requestsSent": "12",
    "googRemoteAddress": "192.168.1.2:60256",
    "googRtt": "0",
    "googActiveConnection": "true",
    "packetsDiscardedOnSend": "0",
    "bytesReceived": "4455306",
    "responsesReceived": "12",
    "remoteCandidateId": "Cand-aws75dws",
    "localCandidateId": "Cand-4hzYq0su",
    "bytesSent": "4466782",
    "packetsSent": "5437",
    "id": "Conn-audio-1-0",
    "type": "googCandidatePair",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "portNumber": "61885",
    "networkType": "wlan",
    "ipAddress": "192.168.1.2",
    "transport": "udp",
    "candidateType": "host",
    "priority": "2122260223",
    "id": "Cand-4hzYq0su",
    "type": "localcandidate",
    "timestamp": "2017-11-21T04:09:48.850Z"
}, {
    "portNumber": "60256",
    "ipAddress": "192.168.1.2",
    "transport": "udp",
    "candidateType": "host",
    "priority": "2122260223",
    "id": "Cand-aws75dws",
    "type": "remotecandidate",
    "timestamp": "2017-11-21T04:09:48.850Z"
}, {
    "googDecodingCTN": "2206",
    "packetsLost": "0",
    "googSecondaryDecodedRate": "0",
    "googDecodingPLC": "21",
    "packetsReceived": "1056",
    "googExpandRate": "0.900574",
    "googJitterReceived": "1",
    "googDecodingCNG": "0",
    "ssrc": "3719978459",
    "googPreferredJitterBufferMs": "20",
    "googSpeechExpandRate": "0.178711",
    "totalSamplesDuration": "22.06",
    "totalAudioEnergy": "0",
    "transportId": "Channel-audio-1",
    "mediaType": "audio",
    "googDecodingPLCCNG": "72",
    "googCodecName": "opus",
    "googSecondaryDiscardedRate": "0",
    "googDecodingNormal": "2113",
    "googTrackId": "ab5be64a-00b0-4c69-9ffa-b934a3cdaf92",
    "audioOutputLevel": "0",
    "googAccelerateRate": "0",
    "bytesReceived": "103053",
    "googCurrentDelayMs": "61",
    "googDecodingCTSG": "0",
    "googCaptureStartNtpTimeMs": "3720226188883",
    "googPreemptiveExpandRate": "0",
    "googJitterBufferMs": "5",
    "googDecodingMuted": "71",
    "id": "ssrc_3719978459_recv",
    "type": "ssrc",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "audioInputLevel": "38",
    "packetsLost": "0",
    "googTrackId": "ab5be64a-00b0-4c69-9ffa-b934a3cdaf92",
    "googRtt": "1",
    "googResidualEchoLikelihoodRecentMax": "0",
    "googEchoCancellationReturnLossEnhancement": "-100",
    "totalSamplesDuration": "0",
    "googCodecName": "opus",
    "transportId": "Channel-audio-1",
    "mediaType": "audio",
    "aecDivergentFilterFraction": "0",
    "googEchoCancellationReturnLoss": "-100",
    "googResidualEchoLikelihood": "0",
    "googEchoCancellationQualityMin": "0",
    "totalAudioEnergy": "0",
    "ssrc": "4057371623",
    "googJitterReceived": "1",
    "googTypingNoiseState": "false",
    "packetsSent": "1056",
    "bytesSent": "103053",
    "id": "ssrc_4057371623_send",
    "type": "ssrc",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "googContentType": "realtime",
    "googCaptureStartNtpTimeMs": "3720226188863",
    "googTargetDelayMs": "28",
    "packetsLost": "0",
    "googDecodeMs": "3",
    "googFrameHeightReceived": "480",
    "googFrameRateOutput": "2",
    "packetsReceived": "3843",
    "ssrc": "2926085704",
    "googRenderDelayMs": "10",
    "googMaxDecodeMs": "4",
    "googTrackId": "c07bbd24-4e99-4b94-b429-5174370f8d12",
    "googFrameWidthReceived": "640",
    "codecImplementationName": "libvpx",
    "transportId": "Channel-audio-1",
    "mediaType": "video",
    "googTimingFrameInfo": "2498355253,490771956,490771960,490771967,490771967,490771974,0,1",
    "googInterframeDelayMax": "67",
    "googCodecName": "VP9",
    "googFrameRateReceived": "2",
    "qpSum": "35281",
    "framesDecoded": "348",
    "googNacksSent": "0",
    "googFirsSent": "0",
    "bytesReceived": "4294692",
    "googCurrentDelayMs": "28",
    "googMinPlayoutDelayMs": "0",
    "googFrameRateDecoded": "2",
    "googJitterBufferMs": "14",
    "googPlisSent": "0",
    "id": "ssrc_2926085704_recv",
    "type": "ssrc",
    "timestamp": "2017-11-21T04:10:10.905Z"
}, {
    "googFrameWidthSent": "640",
    "packetsLost": "0",
    "googRtt": "1",
    "googEncodeUsagePercent": "19",
    "googCpuLimitedResolution": "false",
    "googNacksReceived": "0",
    "googBandwidthLimitedResolution": "false",
    "googPlisReceived": "0",
    "googAvgEncodeMs": "7",
    "googTrackId": "c07bbd24-4e99-4b94-b429-5174370f8d12",
    "googFrameRateInput": "2",
    "framesEncoded": "348",
    "codecImplementationName": "libvpx",
    "transportId": "Channel-audio-1",
    "mediaType": "video",
    "googFrameHeightSent": "480",
    "googFrameRateSent": "18",
    "googCodecName": "VP9",
    "qpSum": "35291",
    "googAdaptationChanges": "0",
    "ssrc": "3181351409",
    "googFirsReceived": "0",
    "packetsSent": "3884",
    "bytesSent": "4316619",
    "id": "ssrc_3181351409_send",
    "type": "ssrc",
    "timestamp": "2017-11-21T04:10:10.905Z"
}]
```

## License

[getStats.js](https://github.com/muaz-khan/getStats) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
