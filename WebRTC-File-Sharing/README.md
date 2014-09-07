### FileBufferReader.js is recommended:

* https://github.com/muaz-khan/FileBufferReader


### WebRTC File Sharing using SCTP Data Channels / [Demo](https://www.webrtc-experiment.com/WebRTC-File-Sharing/)

This [WebRTC Experiment](https://www.webrtc-experiment.com/) is using SCTP-based data channels to share files across browsers (chrome & firefox).

## [`File.js`](https://www.webrtc-experiment.com/WebRTC-File-Sharing/File.js)

A reusable "standalone" library that can be used in any WebRTC or non-WebRTC application to share files.

```javascript
// https://www.webrtc-experiment.com/File.js

var progressHelper = {};
var outputPanel = document.body;

var fileHelper = {
    onBegin: function (file) {
        var div = document.createElement('div');
        div.title = file.name;
        div.innerHTML = '&lt;label&gt;0%&lt;/label&gt; &lt;progress&gt;&lt;/progress&gt;';
        outputPanel.insertBefore(div, outputPanel.firstChild);
        progressHelper[file.uuid] = {
            div: div,
            progress: div.querySelector('progress'),
            label: div.querySelector('label')
        };
        progressHelper[file.uuid].progress.max = file.maxChunks;
    },
    onEnd: function (file) {
        progressHelper[file.uuid].div.innerHTML = '&lt;a href="' + file.url + '" target="_blank" download="' + file.name + '"&lt;' + file.name + '&lt;/a&gt;';
    },
    onProgress: function (chunk) {
        var helper = progressHelper[chunk.uuid];
        helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
        updateLabel(helper.progress, helper.label);
    }
};

function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}

// To Send a File
File.Send({
    file: file,
    channel: peer,
    interval: 100,
    chunkSize: 1000, // 1000 for RTP; or 16k for SCTP
                     // chrome's sending limit is 64k; firefox' receiving limit is 16k!
	
    onBegin: fileHelper.onBegin,
    onEnd: fileHelper.onEnd,
    onProgress: fileHelper.onProgress
});

// To Receive a File
var fleReceiver = new File.Receiver(fileHelper);
peer.onmessage = function (data) {
    fleReceiver.receive(data);
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

WebRTC [WebRTC File Sharing](https://www.webrtc-experiment.com/WebRTC-File-Sharing/) experiment is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
