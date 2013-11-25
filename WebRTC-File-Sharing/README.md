#### WebRTC File Sharing using SCTP Data Channels / [Demo](https://www.webrtc-experiment.com/WebRTC-File-Sharing/)

This [WebRTC Experiment](https://www.webrtc-experiment.com/) is using SCTP-based data channels to share files across browsers (chrome & firefox).

#### [`File.js`](https://www.webrtc-experiment.com/WebRTC-File-Sharing/File.js)

A reusable "standalone" library that can be used in any WebRTC or non-WebRTC application to share files.

```javascript
// https://www.webrtc-experiment.com/WebRTC-File-Sharing/File.js

// To send a file
File.Send({
    file: file,
    channel: socket_or_datachannel,
    interval: 0,
    onBegin: function (file) {
        // progress.max = file.maxChunks;
        console.log(file.name, ' is about to be shared.');
    },
    onEnd: function (file) {
        console.log('Sent:', file);
        li.innerHTML = '<a href="' + file.url + '" target="_blank">' + file.name + '</a>';
    },
    onProgress: function (chunk) {
        // progress.value = chunk.currentPosition || chunk.max || progress.max;
    }
});

// To receive files
var fileReceiver = new File.Receiver({
    onBegin: function (file) {
        // progress.max = file.maxChunks;
        console.log('about to receive', file.name, file.size, file.type);
    },
    onEnd: function (file) {
        console.log('Received:', file);
        this.li.innerHTML = '<a href="' + file.url + '" target="_blank">' + file.name + '</a>';
    },
    onProgress: function (chunk) {
        // progress.value = chunk.currentPosition || chunk.max || this.progress.max;
    }
});

// in the socket.on('message') or peer.onmessage
peer.onmessage = function (data) {
    fileReceiver.receive(data);
};
```

#### [`PeerConnection.js`](https://www.webrtc-experiment.com/WebRTC-File-Sharing/PeerConnection.js)

A reusable "standalone" library that can be used on any webpage to setup WebRTC SCTP connections (in minutes!).

Documentation of this library available here:

https://github.com/muaz-khan/WebRTC-Experiment/tree/master/file-sharing

=

#### Browser Support

WebRTC [WebRTC File Sharing](https://www.webrtc-experiment.com/WebRTC-File-Sharing/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### License

WebRTC [WebRTC File Sharing](https://www.webrtc-experiment.com/WebRTC-File-Sharing/) experiment is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
