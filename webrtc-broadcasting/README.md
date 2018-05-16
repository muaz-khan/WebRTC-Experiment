# WebRTC One-Way Video Broadcasting / [Demo](https://www.webrtc-experiment.com/webrtc-broadcasting/)

Participants can view your broadcasted video **anonymously**. They can also listen you without allowing access to their own microphone!

This experiment is actually a **one-way** audio/video/screen streaming.

----

1. This [WebRTC](https://www.webrtc-experiment.com/) experiment is aimed to transmit audio/video streams in one-way style.
2. It setups multiple peer connections to support multi-user connectivity feature. Rememebr, [WebRTC](https://www.webrtc-experiment.com/) doesn't supports 3-way handshake!
3. Out of multi-peers establishment; many RTP-ports are opened according to number of media streamas referenced to each peer connection.
4. Multi-ports establishment will cause huge [CPU and bandwidth usage](https://www.webrtc-experiment.com/docs/RTP-usage.html)!

----

1. Mesh networking model is implemented to open multiple interconnected peer connections.
2. Maximum peer connections limit is 256 (on chrome). It means that 256 users can be interconnected!

----

You can:

1. Share your screen in one-way over many peers
2. Share you camera in one-way over many peers
3. Share/transmit your voice in one-way over many peers

# How WebRTC One-Way Broadcasting Works?

1. Mesh networking model is implemented to open multiple interconnected peer connections
2. Maximum peer connections limit is 256 (on chrome)

# How to setup private rooms?

Following "channel" line makes private rooms according to the domain name.

https://github.com/muaz-khan/WebRTC-Experiment/blob/master/webrtc-broadcasting/index.html#L140

```javascript
var channel = config.channel || location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
```

You can see this code:    `location.href.replace( /\/|:|#|%|\.|\[|\]/g , '')`

It means that "channel" which is a unique identifier of the room....is taken from the actual URL...

So, your room will be visible only on your domain.

You can use custom channel name if you wanna open single channel among all your pages.....

var channel = config.channel || 'this-must-be-unique-must-be-private';

For first case, where I was taking "channel" from the URL .... 

i.e. `location.href.replace( /\/|:|#|%|\.|\[|\]/g , '')`

In that case, each URL will have unique channel i.e.

```
http://localhost/first-page/
http://localhost/second-page/
http://localhost/third-page/
```

Users from all three pages can't see each other; they'll NEVER see "join" buttons etc.

If no one has access to your channel; he can't see/view your broadcast.

Also, hashes or query-string parameters causes unique channels.

```
http://localhost/first-page/
http://localhost/first-page/#hash
http://localhost/first-page/?query=something
```

All these three pages has unique channels. They'll NEVER see rooms from each other.

# Want to use video-conferencing in your own webpage?

```html
<script src="https://cdn.webrtc-experiment.com/socket.io.js"> </script>
<script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
<script src="https://cdn.webrtc-experiment.com/IceServersHandler.js"></script>
<script src="https://cdn.webrtc-experiment.com/CodecsHandler.js"></script>
<script src="https://cdn.webrtc-experiment.com/webrtc-broadcasting/RTCPeerConnection-v1.5.js"> </script>
<script src="https://cdn.webrtc-experiment.com/webrtc-broadcasting/broadcast.js"> </script>

<select id="broadcasting-option">
    <option>Audio + Video</option>
    <option>Only Audio</option>
    <option>Screen</option>
</select>
<button id="setup-new-broadcast">Setup New Broadcast</button>

        
<table style="width: 100%;" id="rooms-list"></table>
<div id="videos-container"></div>
        
<script>
    var config = {
        openSocket: function(config) {
            var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com/';

            var channel = config.channel || location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
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
        },
        onRemoteStream: function(htmlElement) {
            videosContainer.appendChild(htmlElement);
        },
        onRoomFound: function(room) {
            var alreadyExist = document.querySelector('button[data-broadcaster="' + room.broadcaster + '"]');
            if (alreadyExist) return;

            var tr = document.createElement('tr');
            tr.innerHTML = '<td><strong>' + room.roomName + '</strong> is broadcasting his media!</td>' +
                '<td><button class="join">Join</button></td>';
            roomsList.htmlElement(tr);

            var joinRoomButton = tr.querySelector('.join');
            joinRoomButton.setAttribute('data-broadcaster', room.broadcaster);
            joinRoomButton.setAttribute('data-roomToken', room.broadcaster);
            joinRoomButton.onclick = function() {
                this.disabled = true;

                var broadcaster = this.getAttribute('data-broadcaster');
                var roomToken = this.getAttribute('data-roomToken');
                broadcastUI.joinRoom({
                    roomToken: roomToken,
                    joinUser: broadcaster
                });
            };
        },
        onNewParticipant: function(numberOfViewers) {
            document.title = 'Viewers: ' + numberOfViewers;
        }
    };


    var broadcastUI = broadcast(config);

    var videosContainer = document.getElementById('videos-container') || document.body;
    var setupNewBroadcast = document.getElementById('setup-new-broadcast');
    var roomsList = document.getElementById('rooms-list');
    var broadcastingOption = document.getElementById('broadcasting-option');

    document.getElementById('broadcasting-option').onclick = function() {
        this.disabled = true;

        captureUserMedia(function() {
            var shared = 'video';
            if (window.option == 'Only Audio') shared = 'audio';
            if (window.option == 'Screen') shared = 'screen';
            broadcastUI.createRoom({
                roomName: 'Anonymous',
                isAudio: shared === 'audio'
            });
        });
    };

    function captureUserMedia(callback) {
        var constraints = null;
        window.option = broadcastingOption ? broadcastingOption.value : '';
        if (option === 'Only Audio') {
            constraints = {
                audio: true,
                video: false
            };
        }
        if (option === 'Screen') {
            var video_constraints = {
                mandatory: {
                    chromeMediaSource: 'screen'
                },
                optional: []
            };
            constraints = {
                audio: false,
                video: video_constraints
            };
        }

        var htmlElement = document.createElement(option === 'Only Audio' ? 'audio' : 'video');
        htmlElement.muted = true;
        htmlElement.volume = 0;

        htmlElement.setAttributeNode(document.createAttribute('autoplay'));
        htmlElement.setAttributeNode(document.createAttribute('playsinline'));
        htmlElement.setAttributeNode(document.createAttribute('controls'));

        var mediaConfig = {
            video: htmlElement,
            onsuccess: function(stream) {
                config.attachStream = stream;
                videosContainer.htmlElement(htmlElement);
                callback();
            },
            onerror: function() {
                if (option === 'Only Audio') alert('unable to get access to your microphone');
                else if (option === 'Screen') {
                    if (location.protocol === 'http:') alert('Please test this WebRTC experiment on HTTPS.');
                    else alert('Screen capturing is either denied or not supported. Are you enabled flag: "Enable screen capture support in getUserMedia"?');
                } else alert('unable to get access to your webcam');
            }
        };
        if (constraints) mediaConfig.constraints = constraints;
        getUserMedia(mediaConfig);
    }
</script>
```

# For signaling; please check following page:

https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

Remember, you can use any signaling implementation exists out there without modifying any single line! Just skip below code and open [above link](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md)!

# API

### `broadcast` function

```javascript
var cast = broadcast(options);
```

### `createRoom` method

```javascript
var cast = broadcast(options);
cast.createRoom({
    roomName: 'roomid',
    isAudio: false
});
```

### `joinRoom` method

```javascript
var cast = broadcast({
    onRoomFound: function(room) {
        cast.joinRoom({
            roomToken: room.roomToken,
            joinUser: room.broadcaster
        });
    }
});
```

### `conference` function's options

```javascript
var cast = broadcast({
    attachStream: MediaStream,
    openSocket: function(config) {},
    onRemoteStream: function(htmlElement) {},
    onRoomFound: function(room) {},
    onNewParticipant: function(numberOfViewers) {},
    onReady: function() {}
});
```

### `attachStream` option

```javascript
navigator.mediaDevices.getUserMedia({ video: true }).then(function(camera) {
    var cast = broadcast({
        attachStream: camera
    });
});
```

### `onRemoteStream` event

```javascript
var cast = broadcast({
    onRemoteStream: function(htmlElement) {
        document.body.appendChild(htmlElement);
    }
});
```

### `onRoomFound` event

```javascript
var join_only_one_room = true;
var cast = broadcast({
    onRoomFound: function(room) {
        if(!join_only_one_room) return;
        join_only_one_room = false;
        
        cast.joinRoom({
            roomToken: room.roomToken,
            joinUser: room.broadcaster
        });
    }
});
```

### `openSocket` option

```javascript
var cast = broadcast({
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

[WebRTC One-Way Broadcasting](https://www.webrtc-experiment.com/webrtc-broadcasting/) experiment is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
