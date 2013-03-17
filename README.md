**Just copy HTML/JS code in your site and that's all you need to do. Nothing to install! No requirements!**

====
## Browser Support
[WebRTC Experiments](https://webrtc-experiment.appspot.com) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) |
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta) |


| A few top-level [WebRTC Experiments](https://webrtc-experiment.appspot.com)        |
| ------------- |
| [WebRTC One-Way Broadcasting](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/webrtc-broadcasting/) : *One-way audio/video/screen broadcasting. Participants don't need to have camera/microphone.* |
| [Plugin free screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html) : *Directly Share full screen / No Extension / No Add-ons* |
| [Video Conferencing / Hangout](https://webrtc-experiment.appspot.com/video-conferencing/) : *many to many* |
| [Video Broadcast](https://webrtc-experiment.appspot.com/broadcast/) : *one to many* |
| [File Sharing / Hangout](https://webrtc-experiment.appspot.com/file-hangout/) : *many to many* |
| [Text Chat Hangout](https://webrtc-experiment.appspot.com/chat-hangout/) : *many to many* |
| [Audio Broadcast](https://webrtc-experiment.appspot.com/audio-broadcast/) : *one to many* |
| [Screen Sharing](https://webrtc-experiment.appspot.com/screen-broadcast/) : *one to many* |
| [Screen Viewer](https://webrtc-experiment.appspot.com/screen-viewer/) : *one-to-many WebRTC Screen Sharing!* |
| [Chrome to Firefox Screen Sharing](https://googledrive.com/host/0B6GWd_dUUTT8YUJaMkZ2d0NzQmc/WebRTC-Screen-Viewer.html) :  Cross Browser Screen Sharing! |

1. [WebRTC part of screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/realtime-chat/) / *Sharing part of screen (DIV/SECTION/ASIDE/ARTICLE/etc.); not the entire screen!*
2. [RecordRTC: WebRTC audio/video recording](http://bit.ly/RecordRTC) / [Demo](http://bit.ly/RecordRTC-Demo)
3. [Pre-recorded media streaming](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/Pre-recorded-Media-Streaming/)

| A few documents for newbies and beginners        |
| ------------- |
| [RTCPeerConnection Documentation](https://github.com/muaz-khan/WebRTC-Experiment/wiki/RTCPeerConnection-Documentation) |
| [How to use RTCPeerConnection.js?](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcpeerconnection-js-v1.1.html) |
| [RTCDataChannel for Beginners](https://webrtc-experiment.appspot.com/docs/rtc-datachannel-for-beginners.html) |
| [How to use RTCDataChannel?](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcdatachannel.html) - single code for both canary and nightly |
| [WebRTC for Beginners: A getting stared guide!](https://webrtc-experiment.appspot.com/docs/webrtc-for-beginners.html) |
| [WebRTC for Newbies ](https://webrtc-experiment.appspot.com/docs/webrtc-for-newbies.html) |
| [How to broadcast video using RTCWeb APIs?](https://webrtc-experiment.appspot.com/docs/how-to-broadcast-video-using-RTCWeb-APIs.html) |
| [How to share audio-only streams?](https://webrtc-experiment.appspot.com/docs/how-to-share-audio-only-streams.html) |
| [How to broadcast files using RTCDataChannel APIs?](https://webrtc-experiment.appspot.com/docs/how-file-broadcast-works.html) |

Some other documents on [WebRTC Wiki](https://github.com/muaz-khan/WebRTC-Experiment/wiki) pages.

## Use your own socket.io implementation!

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

====
## License

[WebRTC Experiments](https://github.com/muaz-khan/WebRTC-Experiment) are released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
