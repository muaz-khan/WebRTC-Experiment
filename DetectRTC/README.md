## [DetectRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC) / Detect <a href="https://www.webrtc-experiment.com/">WebRTC</a> features!

> A library for detecting WebRTC features!
> Demo: https://www.webrtc-experiment.com/DetectRTC/

<img src="https://www.webrtc-experiment.com/images/DetectRTC.png" style="width:100%;" />

=

### How to use it?

```html
<script src="//www.webrtc-experiment.com/DetectRTC.js"></script>
```

=

### Browser has Microphone?

```javascript
if(DetectRTC.hasMicrophone) {
    alert('Your browser has microphone (audio input device!)!');
}
```

=

### Browser has Webcam?

```javascript
if(DetectRTC.hasWebcam) {
    alert('Your browser has webcam (video output device!)!');
}
```

=

### Browser Supports Screen Capturing?

```javascript
if(DetectRTC.isScreenCapturingSupported) {
    alert('Your browser seems supporting screen capturing!');
}
```

=

### Browser Supports WebRTC?

```javascript
if(DetectRTC.isWebRTCSupported) {
    alert('Your browser seems supporting WebRTC!');
}
```

=

### Browser Supports WebAudio API?

```javascript
if(DetectRTC.isAudioContextSupported) {
    alert('Your browser seems supporting WebAudio API!');
}
```

=

### Browser Supports SCTP Data Channels?

```javascript
if(DetectRTC.isSctpDataChannelsSupported) {
    alert('Your browser seems supporting SCTP Data Channels!');
}
```

=

### Browser Supports RTP Data Channels?

```javascript
if(DetectRTC.isRtpDataChannelsSupported) {
    alert('Your browser seems supporting RTP Data Channels!');
}
```

=

##### License

[DetectRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
