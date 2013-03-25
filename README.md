**Just copy HTML/JS code in your site and that's all you need to do. Nothing to install! No requirements!**

====
#### Browser Support
[WebRTC Experiments](https://webrtc-experiment.appspot.com) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |


| Hangout / Conferencing / Group Sharing |
| ------------- |
| [Video Conferencing / Hangout](https://webrtc-experiment.appspot.com/video-conferencing/) : Group video sharing |
| [File Sharing / Hangout](https://webrtc-experiment.appspot.com/file-hangout/) : Group file sharing |
| [Text Chat Hangout](https://webrtc-experiment.appspot.com/chat-hangout/) : Group text chat |


| Broadcasting |
| ------------- |
| [One-Way Broadcasting](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/webrtc-broadcasting/) : Unidirectional i.e. one-way audio, video and screen sharing |
| [Video Broadcast](https://webrtc-experiment.appspot.com/broadcast/) : One-to-Many video sharing |
| [Audio Broadcast](https://webrtc-experiment.appspot.com/audio-broadcast/) : One-to-Many audio sharing |


| One-to-One |
| ------------- |
| [One-to-one WebRTC video chat using WebSocket](https://webrtc-experiment.appspot.com/websocket/) |
| [One-to-one WebRTC video chat using socket.io](https://webrtc-experiment.appspot.com/socket.io/) |


| in-Page / One-Page / Client Side |
| ------------- |
| [Text chat using RTCDataChannel APIs](https://webrtc-experiment.appspot.com/demos/client-side-datachannel.html) |
| [Simple video chat](https://webrtc-experiment.appspot.com/demos/client-side.html) |
| [Sharing video - using socket.io for signaling](https://webrtc-experiment.appspot.com/demos/client-side-socket-io.html) |
| [Sharing video - using WebSockets for signaling](https://webrtc-experiment.appspot.com/demos/client-side-websocket.html) |


| Screen Sharing |
| ------------- |
| [Plugin free screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html) : Share screen directly without any plugin/extension/add-ons installation! |
| [Chrome to Firefox Screen Sharing](https://googledrive.com/host/0B6GWd_dUUTT8YUJaMkZ2d0NzQmc/WebRTC-Screen-Viewer.html) :  Cross Browser Screen Sharing using tabCapture APIs! |
| [Screen Sharing](https://webrtc-experiment.appspot.com/screen-broadcast/) : One-to-Many screen sharing/broadcasting using tabCapture APIs |
| [Screen Viewer](https://webrtc-experiment.appspot.com/screen-viewer/) : Broadcasted/Shared screens viewer |


| `Part of Screen` Sharing |
| ------------- |
| [Using RTCDataChannel](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/part-of-screen-sharing/RTCDataChannel/) |
| [Using Firebase](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/part-of-screen-sharing/) |
| [A realtime chat using RTCDataChannel](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/realtime-chat/) |
| [A realtime chat using Firebase](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/realtime-chat/No-WebRTC-Chat.html) |


| Other WebRTC Experiments |
| ------------- |
| [RecordRTC: WebRTC audio/video recording](http://bit.ly/RecordRTC) / [Demo](http://bit.ly/RecordRTC-Demo) |
| [Pre-recorded media streaming](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/Pre-recorded-Media-Streaming/) |


| A few documents for newbies and beginners        |
| ------------- |
| [RTCPeerConnection Documentation](https://github.com/muaz-khan/WebRTC-Experiment/wiki/RTCPeerConnection-Documentation) |
| [How to use RTCPeerConnection.js?](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcpeerconnection-js-v1.1.html) |
| [RTCDataChannel for Beginners](https://webrtc-experiment.appspot.com/docs/rtc-datachannel-for-beginners.html) |
| [How to use RTCDataChannel?](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcdatachannel.html) - single code for both canary and nightly |
| [WebRTC for Beginners: A getting stared guide!](https://webrtc-experiment.appspot.com/docs/webrtc-for-beginners.html) |
| [WebRTC for Newbies ](https://webrtc-experiment.appspot.com/docs/webrtc-for-newbies.html) |
| [How to broadcast video using RTCWeb APIs?](https://webrtc-experiment.appspot.com/docs/how-to-broadcast-video-using-RTCWeb-APIs.html) |
| [How to broadcast files using RTCDataChannel APIs?](https://webrtc-experiment.appspot.com/docs/how-file-broadcast-works.html) |

A few other documents on [WebRTC Wiki](https://github.com/muaz-khan/WebRTC-Experiment/wiki) pages.

#### Use your own socket.io implementation!

You must link `socket.io.js` file before using below code:

```javascript
var config = {
    openSocket: function (config) {
        var socket = io.connect('http://your-site:8888');
        socket.channel = config.channel || 'WebRTC-Experiment';
		socket.on('message', config.onmessage);
		
        socket.send = function (data) {
            socket.emit('message', data);
        };

        if (config.onopen) setTimeout(config.onopen, 1);
        return socket;
    }
};
```

For `testing purpose`, you can use **Firebase**. Remember, You must link [firebase.js](https://cdn.firebase.com/v0/firebase.js) file before using below code:

```javascript
var config = {
    openSocket: function (config) {
        var channel = config.channel || 'WebRTC-Experiment';
        var socket = new Firebase('https://chat.firebaseIO.com/' + channel);
        socket.channel = channel;
        socket.on("child_added", function (data) {
            config.onmessage && config.onmessage(data.val());
        });
        socket.send = function (data) {
            this.push(data);
        }
        config.onopen && setTimeout(config.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
    }
};

```

[RTCMultiConnection](http://bit.ly/RTCMultiConnection) highly simplifies multi-user connectivity along with multi-session establishment. 

#### Write a `video conferencing` application using `RTCMultiConnection` / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/videoconferencing.html)

```html
<script src="https://bit.ly/RTCMultiConnection-v1-0"></script>
```

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.ManyToMany,
    session: Session.AudioVideo,
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    },
    onRemoteStream: function (media) {},
    onLocalStream: function (media) {}
});
rtcMultiConnection.initSession();
```

1. Default **direction** is **ManyToMany** - so you can skip that line.
2. Default **session** is **AudioVideo** - so you can skip that line too.
3. Only **openSignalingChannel** is mandatory.
4. To understand how to write your own socket.io implementation in `openSignalingChannel` method; click [here](http://bit.ly/RTCMultiConnection#openSignalingChannel);

For further demos and information; read [RTCMultiConnection Documentation](http://bit.ly/RTCMultiConnection).

#### RTCMultiConnection [Demos](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/) / [All-in-One Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/)

1. [video conferencing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/videoconferencing.html)
2. [audio conferencing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/audioconferencing.html)
3. [video conferencing + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/videoconferencing-plus-filesharing-plus-textchat.html)
4. [audio conferencing + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/audioconferencing-plus-filesharing-plus-textchat.html)
5. [screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/screen-sharing.html)
6. [screen sharing + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/screensharing-plus-filesharing-plus-textchat.html)
7. [file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/filesharing-plus-textchat.html)
8. [one-to-one file sharing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/one-to-one-filesharing.html)
9. [video broadcasting](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/video-broadcasting.html)
10. [video broadcasting + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/video-broadcasting-plus-filesharing-plus-textchat.html)


#### Use [RTCDataConnection](http://bit.ly/RTCDataConnection) to share files, data, or text

Write your own **group file sharing** application in **maximum 2 minutes**!!

```html
<script src="https://bit.ly/RTCDataConnection-v1-0"></script>
```

```javascript
var rtcDataConnection = new RTCDataConnection({
    onmessage: function (data) {
        console.log(data);
    },
    openSignalingChannel: function (config) {
        var socket = io.connect('http://your-site:8888');
        socket.channel = config.channel || 'WebRTC-RTCDataConnection';
		socket.on('message', config.onmessage);
		
        socket.send = function (data) {
            socket.emit('message', data);
        };

        if (config.onopen) setTimeout(config.onopen, 1);
        return socket;
    },
	
    // 'one-to-one' || 'one-to-many' || 'many-to-many'
    // default: 'many-to-many' ------- it is optional
    direction: 'one-to-many'
});

// Only session initiator should call below line; 
// All other 10000 room participants don't need to call "initDataConnection"!
rtcDataConnection.initDataConnection();

// to send file/data /or text
var file = this.files[0];
rtcDataConnection.send( file );

rtcDataConnection.send( data );
rtcDataConnection.send( 'text' );
```

#### Read [RTCDataConnection Documentation](http://bit.ly/RTCDataConnection)


#### License

[WebRTC Experiments](https://github.com/muaz-khan/WebRTC-Experiment) are released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
