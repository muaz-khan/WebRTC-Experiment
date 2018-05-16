# WebRTC Video Conferencing / [Demo](https://www.webrtc-experiment.com/video-conferencing/)

1. This [WebRTC](https://www.webrtc-experiment.com/) experiment is aimed to transmit audio/video streams in many-to-many style.
2. It setups multiple peer connections to support multi-user connectivity feature. Remember, [WebRTC](https://www.webrtc-experiment.com/) doesn't supports 3-way handshake!
3. Out of multi-peers establishment; many RTP-ports are opened according to number of media streams referenced to each peer connection.
4. Multi-ports establishment will cause huge [CPU and bandwidth usage](https://www.webrtc-experiment.com/docs/RTP-usage.html)!

----

1. Mesh networking model is implemented to open multiple interconnected peer connections.
2. Maximum peer connections limit is 256 (on chrome). It means that 256 users can be interconnected!

# Want to use video-conferencing in your own webpage?

```html
<script src="https://cdn.webrtc-experiment.com/socket.io.js"> </script>
<script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
<script src="https://cdn.webrtc-experiment.com/IceServersHandler.js"></script>
<script src="https://cdn.webrtc-experiment.com/CodecsHandler.js"></script>
<script src="https://cdn.webrtc-experiment.com/video-conferencing/RTCPeerConnection-v1.5.js"> </script>
<script src="https://cdn.webrtc-experiment.com/video-conferencing/conference.js"> </script>

<button id="setup-new-room">Setup New Conference</button>
<table style="width: 100%;" id="rooms-list"></table>
<div id="videos-container"></div>

<script>
var config = {
    openSocket: function (config) {
        var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/',
            defaultChannel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

        var channel = config.channel || defaultChannel;
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + channel);
        socket.channel = channel;
        socket.on('connect', function () {
            if (config.callback) config.callback(socket);
        });

        socket.send = function (message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    },
    onRemoteStream: function (media) {
        var video = media.video;
        video.setAttribute('id', media.stream.id);
        videosContainer.appendChild(video);
    },
    onRemoteStreamEnded: function (stream) {
        var video = document.getElementById(stream.id);
        if (video) video.parentNode.removeChild(video);
    },
    onRoomFound: function (room) {
        var alreadyExist = document.querySelector('button[data-broadcaster="' + room.broadcaster + '"]');
        if (alreadyExist) return;

        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + room.roomName + '</strong> shared a conferencing room with you!</td>' +
            '<td><button class="join">Join</button></td>';
        roomsList.appendChild(tr);

        var joinRoomButton = tr.querySelector('.join');
        joinRoomButton.setAttribute('data-broadcaster', room.broadcaster);
        joinRoomButton.setAttribute('data-roomToken', room.broadcaster);
        joinRoomButton.onclick = function () {
            this.disabled = true;

            var broadcaster = this.getAttribute('data-broadcaster');
            var roomToken = this.getAttribute('data-roomToken');
            captureUserMedia(function () {
                conferenceUI.joinRoom({
                    roomToken: roomToken,
                    joinUser: broadcaster
                });
            });
        };
    }
};

var conferenceUI = conference(config);
var videosContainer = document.getElementById('videos-container') || document.body;
var roomsList = document.getElementById('rooms-list');

document.getElementById('setup-new-room').onclick = function () {
    this.disabled = true;
    captureUserMedia(function () {
        conferenceUI.createRoom({
            roomName: 'Anonymous'
        });
    });
};

function captureUserMedia(success_callback, failure_callback) {
    var video = document.createElement('video');
    video.muted = true;
    video.volume = 0;

    video.setAttributeNode(document.createAttribute('autoplay'));
    video.setAttributeNode(document.createAttribute('playsinline'));
    video.setAttributeNode(document.createAttribute('controls'));

    getUserMedia({
        video: video,
        onsuccess: function (stream) {
            config.attachStream = stream;
            videosContainer.appendChild(video);
            success_callback();
        }
    });
}
</script>
```

For signaling; please check following page:

https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

Remember, you can use any signaling implementation exists out there without modifying any single line! Just skip below code and open [above link](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md)!

# Want to use [Firebase](https://www.firebase.com/) for signaling?

```javascript
var config = {
    openSocket: function (config) {
        var channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        var socket = new Firebase('https://chat.firebaseIO.com/' + channel);
        socket.channel = channel;
        socket.on('child_added', function (data) {
            config.onmessage(data.val());
        });
        socket.send = function (data) {
            this.push(data);
        }
        config.onopen && setTimeout(config.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
    }
}
```

# Want to use [PubNub](http://www.pubnub.com/) for signaling?

```javascript
var config = {
    openSocket: function (config) {
        var channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        var socket = io.connect('https://pubsub.pubnub.com/' + channel, {
            publish_key: 'demo',
            subscribe_key: 'demo',
            channel: config.channel || channel,
            ssl: true
        });
        if (config.onopen) socket.on('connect', config.onopen);
        socket.on('message', config.onmessage);
        return socket;
    }
}
```

# API

### `conference` function

```javascript
var conf = conference(options);
```

### `createRoom` method

```javascript
var conf = conference(options);
conf.createRoom({
    roomName: 'roomid'
});
```

### `joinRoom` method

```javascript
var conf = conference({
    onRoomFound: function(room) {
        conf.joinRoom({
            roomToken: room.roomToken,
            joinUser: room.broadcaster
        });
    }
});
```

### `conference` function's options

```javascript
var conf = conference({
    attachStream: MediaStream,
    openSocket: function(config) {},
    onRemoteStream: function(event) {},
    onRoomFound: function(room) {},
    onRoomClosed: function(room) {},
    onReady: function() {}
});
```

### `attachStream` option

```javascript
navigator.mediaDevices.getUserMedia({ video: true }).then(function(camera) {
    var conf = conference({
        attachStream: camera
    });
});
```

### `onRemoteStream` event

```javascript
var conf = conference({
    onRemoteStream: function(event) {
        document.body.appendChild(event.media);
    }
});
```

### `onRoomFound` event

```javascript
var join_only_one_room = true;
var conf = conference({
    onRoomFound: function(room) {
        if(!join_only_one_room) return;
        join_only_one_room = false;
        
        conf.joinRoom({
            roomToken: room.roomToken,
            joinUser: room.broadcaster
        });
    }
});
```

### `openSocket` option

```javascript
var conf = conference({
    openSocket: function(config) {
        var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/',
            defaultChannel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

        var channel = config.channel || defaultChannel;
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + channel);
        socket.channel = channel;
        socket.on('connect', function() {
            if (config.callback) config.callback(socket);
        });

        socket.send = function(message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    }
});
```

# Browser Support

This [WebRTC Video Conferencing](https://www.webrtc-experiment.com/video-conferencing/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Opera | [Stable](http://www.opera.com/) / [NEXT](http://www.opera.com/computer/next)  |
| Android | [Chrome](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) / [Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox) / [Opera](https://play.google.com/store/apps/details?id=com.opera.browser) |
| Edge | Version 16 or higher |
| Safari | Version 11 on both MacOSX and iOS |

# License

[WebRTC Video Conferencing](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/video-conferencing) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
