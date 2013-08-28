#### Realtime working WebRTC Experiments and Demos

Plug & play type of WebRTC Experiments. Nothing to install. No requirements. Just copy JavaScript code in your site and that's all you need to do!

=

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| **Switch streams from screen-sharing to audio+video. (Renegotiation)** | [Demo](https://www.webrtc-experiment.com/demos/switch-streams.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/demos/switch-streams.html) |
| **Share screen and audio/video from single peer connection!** | [Demo](https://www.webrtc-experiment.com/demos/screen-and-video-from-single-peer.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/demos/screen-and-video-from-single-peer.html) |
| **Text chat using RTCDataChannel APIs** | [Demo](https://www.webrtc-experiment.com/demos/client-side-datachannel.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/demos/) |client-side-datachannel.html
| **Simple video chat** | [Demo](https://www.webrtc-experiment.com/demos/client-side.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/demos/client-side.html) |
| **Sharing video - using socket.io for signaling** |[Demo](https://www.webrtc-experiment.com/demos/client-side-socket-io.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/demos/client-side-socket-io.html) |
| **Sharing video - using WebSockets for signaling** | [Demo](https://www.webrtc-experiment.com/demos/client-side-websocket.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/demos/client-side-websocket.html) |
| **Audio Only Streaming** | [Demo](https://www.webrtc-experiment.com/demos/audio-only-streaming.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/demos/audio-only-streaming.html) |
| **MediaStreamTrack.getSources** | [Demo](https://www.webrtc-experiment.com/demos/MediaStreamTrack.getSources.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/demos/MediaStreamTrack.getSources.html) |

=

#### Chrome-to-Chrome WebRTC Data Connection

It is a single-page demo. Copy/paste code in the console tab and you're done!

```javascript
var iceServers = {
    iceServers: [{
        url: 'stun:stun.l.google.com:19302'
    }]
};

var optionalRtpDataChannels = {
    optional: [{
        RtpDataChannels: true
    }]
};

var offerer = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels),
    answerer, answererDataChannel;

var offererDataChannel = offerer.createDataChannel('RTCDataChannel', {
    reliable: false
});

setChannelEvents(offererDataChannel, 'offerer');

offerer.onicecandidate = function (event) {
    if (!event || !event.candidate) return;
    answerer && answerer.addIceCandidate(event.candidate);
};

var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: false, // Hmm!!
        OfferToReceiveVideo: false // Hmm!!
    }
};

offerer.createOffer(function (sessionDescription) {
    offerer.setLocalDescription(sessionDescription);
    createAnswer(sessionDescription);
}, null, mediaConstraints);


function createAnswer(offerSDP) {
    answerer = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels);
    answererDataChannel = answerer.createDataChannel('RTCDataChannel', {
        reliable: false
    });

    setChannelEvents(answererDataChannel, 'answerer');

    answerer.onicecandidate = function (event) {
        if (!event || !event.candidate) return;
        offerer && offerer.addIceCandidate(event.candidate);
    };

    answerer.setRemoteDescription(offerSDP);
    answerer.createAnswer(function (sessionDescription) {
        answerer.setLocalDescription(sessionDescription);
        offerer.setRemoteDescription(sessionDescription);
    }, null, mediaConstraints);
}

function setChannelEvents(channel, channelNameForConsoleOutput) {
    channel.onmessage = function (event) {
        console.debug(channelNameForConsoleOutput, 'received a message:', event.data);
    };

    channel.onopen = function () {
        channel.send('first text message over RTP data ports');
    };
}
```

After RTP data ports get open; you can send text messages like this:

```javascript
offererDataChannel.send('text message');
answererDataChannel.send('text message');
```

=

#### Firefox-to-Firefox WebRTC Data Connection

From April 2013, Mozilla did [broken changes](https://github.com/muaz-khan/WebRTC-Experiment/wiki/WebRTC-DataChannel-and-Firefox#points) in Firefox data channel implementation. So, following code will work with upcoming releases.

```javascript
function setChannelEvents(channel, channelNameForConsoleOutput) {
    channel.onmessage = function (event) {
        console.debug(channelNameForConsoleOutput, 'received a message:', event.data);
    };
    channel.onopen = function () {
        channel.send('first text message over SCTP data ports');
    };
}

function useless() {}

var iceServers = {
    iceServers: [{
            url: 'stun:23.21.150.121'
        }
    ]
};

var offerer = new mozRTCPeerConnection(iceServers),
    answerer, answererDataChannel, offererDataChannel;

offererDataChannel = offerer.createDataChannel('channel', {});
offererDataChannel.binaryType = 'blob';
setChannelEvents(offererDataChannel, 'offerer');

navigator.mozGetUserMedia({
    audio: true,
    fake: true
}, function (stream) {
    offerer.addStream(stream);

    offerer.createOffer(function (sessionDescription) {
        offerer.setLocalDescription(sessionDescription);
        createAnswer(sessionDescription);
    }, null, mediaConstraints);

}, useless);

var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};

function createAnswer(offerSDP) {
    answerer = new mozRTCPeerConnection(iceServers);
    answerer.ondatachannel = function (event) {
        answererDataChannel = event.channel;
        answererDataChannel.binaryType = 'blob';
        setChannelEvents(answererDataChannel, 'answerer');
    };

    navigator.mozGetUserMedia({
        audio: true,
        fake: true
    }, function (stream) {

        answerer.addStream(stream);
        answerer.setRemoteDescription(offerSDP);

        answerer.createAnswer(function (sessionDescription) {
            answerer.setLocalDescription(sessionDescription);

            offerer.setRemoteDescription(sessionDescription);
        }, null, mediaConstraints);

    }, useless);
}
```

After SCTP data ports get open; you can send text messages, objects, blobs or files like this:

```javascript
offererDataChannel.send('text message');
offererDataChannel.send(data);
offererDataChannel.send(blob);
offererDataChannel.send(file);

answererDataChannel.send('text message');
answererDataChannel.send(data);
answererDataChannel.send(blob);
answererDataChannel.send(file);
```

#### Firefox-to-Firefox WebRTC Data Connection [old / deprecated]

Here is the old implementation of data channels on Firefox:

```javascript
var dataPorts = [123, 321]; // [inbound, outbound]
var iceServers = {
    iceServers: [{
        url: 'stun:23.21.150.121'
    }]
};

var offerer = new mozRTCPeerConnection(iceServers),
    answerer, answererDataChannel, offererDataChannel;

offerer.onconnection = function () {
    offererDataChannel = offerer.createDataChannel('channel', {});
    setChannelEvents(offererDataChannel, 'offerer');
};

navigator.mozGetUserMedia({
    audio: true,
    fake: true
}, function (stream) {
    offerer.addStream(stream);

    offerer.createOffer(function (sessionDescription) {
        offerer.setLocalDescription(sessionDescription);
        createAnswer(sessionDescription);
    }, null, mediaConstraints);

}, useless);

var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};

function createAnswer(offerSDP) {
    answerer = new mozRTCPeerConnection(iceServers);
    answerer.ondatachannel = function (_channel) {
        answererDataChannel = _channel;
        answererDataChannel.binaryType = 'blob';
        setChannelEvents(answererDataChannel, 'answerer');
    };

    navigator.mozGetUserMedia({
        audio: true,
        fake: true
    }, function (stream) {

        answerer.addStream(stream);
        answerer.setRemoteDescription(offerSDP);

        answerer.createAnswer(function (sessionDescription) {
            answerer.setLocalDescription(sessionDescription);

            offerer.setRemoteDescription(sessionDescription, function () {
                answerer.connectDataConnection(dataPorts[0], dataPorts[1]);
                offerer.connectDataConnection(dataPorts[1], dataPorts[0]);
            });
        }, null, mediaConstraints);

    }, useless);
}

function setChannelEvents(channel, channelNameForConsoleOutput) {
    channel.onmessage = function (event) {
        console.debug(channelNameForConsoleOutput, 'received a message:', event.data);
    };

    channel.onopen = function () {
        channel.send('first text message over SCTP data ports');
    };
}

function useless() { }
```

=

#### Browser Support

[WebRTC Experiments & Demos](https://www.webrtc-experiment.com) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

=

#### License

[WebRTC Experiments & Demos](https://github.com/muaz-khan/WebRTC-Experiment) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
