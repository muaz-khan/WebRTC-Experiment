**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

# [WebRTC Shared Screens Viewer](https://webrtc-experiment.appspot.com/screen-viewer/)

WebRTC Screen Sharing using Google Chrome experimental tabCapture APIs.

====
# Browser Support

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/screen-viewer/) works fine on following web-browsers:

# To Broadcast your own stream

| Browser        | Support           |
| ------------- |:-------------:|
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

# To Join any broadcasted screen

| Browser        | Support           |
| ------------- |:-------------:|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

## How Screen Broadcast Works?

Following 3 lines given access to media stream and everything else was same!

```javascript
chrome.tabCapture.capture({ audio: true, video: true }, function(stream) {
    // broadcastNow(stream);
});
```

In simple words, multi-peers and sockets are opened to make it work!

# Use your own socket.io implementation!

```javascript
var config = {
    // JUST change code in openSocket method
    openSocket: function (config) {
        // ---------------------------- from here
        
        var socket = io.connect('your own socket.io URL');

        // set channel: 'video-conferencing' is the default channel
        socket.channel = config.channel || 'video-conferencing';

        // when socket opens: call 'config.onopen'
        config.onopen && socket.on('connect', config.onopen);

        // when socket gets message: call 'config.onmessage'
        socket.on('message', config.onmessage);

        // return socket object; because it will be used later
        return socket;

        // ---------------------------- to here --- and that's all you need to do!
    }
};
```

# Use Screen Viewer in your own site!

```html
<video id="screen-preview" controls autoplay style="display:none;"></video>
<table id="rooms-list"></table>

<script src="https://bit.ly/socket-io"></script>
<script src="https://bit.ly/RTCPeerConnection-v1-3"></script>
<script src="https://webrtc-experiment.appspot.com/screen-viewer/screen-viewer.js"></script>
```


====
## License & Credits

MIT: https://webrtc-experiment.appspot.com/licence/ : Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
