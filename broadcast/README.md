**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

*Only one limitation: A link back to [Muaz Khan](http://github.com/muaz-khan)!*

====
# Cross Browser Support

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/broadcast/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta) |

## How Video Broadcast Works?

In simple words, multi-peers and sockets are opened to make it work!

1. Video broadcasting capability (one-to-many)
2. Private broadcasting rooms

Just copy following HTML code to enjoy video broadcasting in your own site!

```html
<table class="visible">
    <tr>
        <td style="text-align: right;">
            <input type="text" id="conference-name" placeholder="Broadcast Name">
        </td>
        <td>
            <button id="start-conferencing">Start Video Broadcasting</button>
        </td>
    </tr>
</table>

<table id="rooms-list" class="visible"></table>
<div id="participants"></div>

<script src="https://bit.ly/socket-io"></script>
<script src="https://bit.ly/RTCPeerConnection-v1-4"></script>
<script src="https://webrtc-experiment.appspot.com/broadcast/broadcast.js"> </script>
<script src="https://webrtc-experiment.appspot.com/broadcast/broadcast-ui.js"></script>
```

# Use your own socket.io implementation!

```javascript
var config = {
    // JUST change code in openSocket method
    openSocket: function (config) {
        // ---------------------------- from here
        
        var socket = io.connect('your own socket.io URL');

        // set channel: 'video-broadcasting' is the default channel
        socket.channel = config.channel || 'video-broadcasting';

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

====
## License & Credits

Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - A link back is MUST! - All rights reserved!
