#### WebRTC One-Way video sharing/broadcasting / [Demo](https://www.webrtc-experiment.com/webrtc-broadcasting/)

Participants can view your broadcasted video **anonymously**. They can also listen you without allowing access to their own microphone!

This experiment is actually a **one-way** audio/video/screen streaming.

=

1. This [WebRTC](https://www.webrtc-experiment.com/) experiment is aimed to transmit audio/video streams in one-way style.
2. It setups multiple peer connections to support multi-user connectivity feature. Rememebr, [WebRTC](https://www.webrtc-experiment.com/) doesn't supports 3-way handshake!
3. Out of multi-peers establishment; many RTP-ports are opened according to number of media streamas referenced to each peer connection.
4. Multi-ports establishment will cause huge [CPU and bandwidth usage](https://www.webrtc-experiment.com/docs/RTP-usage.html)!

=

1. Mesh networking model is implemented to open multiple interconnected peer connections.
2. Maximum peer connections limit is 256 (on chrome). It means that 256 users can be interconnected!

=

You can:

1. Share your screen in one-way over many peers
2. Share you camera in one-way over many peers
3. Share/transmit your voice in one-way over many peers

=

#### How WebRTC One-Way Broadcasting Works?

1. Mesh networking model is implemented to open multiple interconnected peer connections
2. Maximum peer connections limit is 256 (on chrome)

=

It is one-way broadcasting; media stream is attached only by the broadcaster.

It means that, if 10 people are watching your one-way broadcasted audio/video stream; on your system:

1. 10 RTP ports are opened to send video upward i.e. outgoing video
2. 10 RTP ports are opened to send audio upward i.e. outgoing audio

And on participants system:

1. 10 RTP ports are opened to receive video i.e. incoming video
2. 10 RTP ports are opened to receive audio i.e. incoming audio

Maximum bandwidth used by each video RTP port (media-track) is about 1MB. You're streaming audio and video tracks. You must be careful when streaming video over more than one peers. If you're broadcasting audio/video over 10 peers; it means that 20MB bandwidth is required on your system to stream-up (broadcast/transmit) your video. Otherwise; you'll face connection lost; CPU usage issues; and obviously audio-lost/noise/echo issues.

You can handle such things using "b=AS" (application specific bandwidth) session description parameter values to deliver a little bit low quality video.

```javascript
// removing existing bandwidth lines
sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');

// setting "outgoing" audio RTP port's bandwidth to "50kbit/s"
sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:50\r\n');

// setting "outgoing" video RTP port's bandwidth to "256kbit/s"
sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:256\r\n');
```

=

Possible issues

1. Blurry video experience
2. Unclear voice and audio lost
3. Bandwidth issues / slow streaming / CPU overwhelming

Solution? Obviously a media server!

=

#### How to setup private rooms?

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

=

#### Want to use video-conferencing in your own webpage?

```html
<script src="//cdn.webrtc-experiment.com/socket.io.js"> </script>
<script src="//cdn.webrtc-experiment.com/RTCPeerConnection-v1.5.js"> </script>
<script src="//cdn.webrtc-experiment.com/webrtc-broadcasting/broadcast.js"> </script>

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
            // http://socketio-over-nodejs.hp.af.cm/  (Ordinary port: HTTP)

            // http://socketio-over-nodejs.nodejitsu.com:80 (Secure port: HTTPs)
            // https://socketio-over-nodejs.nodejitsu.com:443/ (Ordinary port: HTTP)

            // https://webrtc-signaling.nodejitsu:443/ (Secure port: HTTPs)
            // http://webrtc-signaling.nodejitsu:80/ (Ordinary port: HTTP)
			
            var SIGNALING_SERVER = 'https://webrtc-signaling.nodejitsu.com:443/';

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
            htmlElement.setAttribute('controls', true);
            videosContainer.insertBefore(htmlElement, videosContainer.firstChild);
            htmlElement.play();
        },
        onRoomFound: function(room) {
            var alreadyExist = document.querySelector('button[data-broadcaster="' + room.broadcaster + '"]');
            if (alreadyExist) return;

            var tr = document.createElement('tr');
            tr.innerHTML = '<td><strong>' + room.roomName + '</strong> is broadcasting his media!</td>' +
                '<td><button class="join">Join</button></td>';
            roomsList.insertBefore(tr, roomsList.firstChild);

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
        htmlElement.setAttribute('autoplay', true);
        htmlElement.setAttribute('controls', true);
        videosContainer.insertBefore(htmlElement, videosContainer.firstChild);

        var mediaConfig = {
            video: htmlElement,
            onsuccess: function(stream) {
                config.attachStream = stream;
                htmlElement.setAttribute('muted', true);
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

=

#### For signaling; please check following page:

https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

Remember, you can use any signaling implementation exists out there without modifying any single line! Just skip below code and open [above link](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md)!

=

#### Browser Support

This [WebRTC One-Way Broadcasting](https://www.webrtc-experiment.com/webrtc-broadcasting/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### License

[WebRTC One-Way Broadcasting](https://www.webrtc-experiment.com/webrtc-broadcasting/) experiment is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
