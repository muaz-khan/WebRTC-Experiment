**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

====
# Cross Browser Support

This [WebRTC Experiment](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/webrtc-broadcasting/) works fine on following web-browsers:

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

## How WebRTC Broadcast Works?

In simple words, multi-peers and sockets are opened to make it work!

You can share audio/video or screen and anyone can join you regardless of whether he has webcam/microphone or not. It is a real broadcast!

Just copy following HTML code to enjoy webrtc broadcasting in your own site!

```html
<table class="visible">
    <tr>
        <td style="text-align: right;">
            <input type="text" id="conference-name" placeholder="Broadcast Name">
        </td>
        <td>
            <select id="broadcasting-option" style="font-size: 1.8em;">
                <option>Audio + Video</option>
                <option>Only Audio</option>
                <option>Screen</option>
            </select>
        </td>
        <td>
            <button id="start-conferencing">Start Broadcasting</button>
        </td>
    </tr>
</table>

<table id="rooms-list" class="visible"></table>
<div id="participants"></div>

<script src="https://bit.ly/socket-io"></script>
<script src="https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCPeerConnection-v1.4.js"></script>
<script src="https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/webrtc-broadcasting/broadcast.js"></script>
<script src="https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/webrtc-broadcasting/broadcast-ui.js"></script>
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

MIT: https://webrtc-experiment.appspot.com/licence/ : Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
