## [Demo / Preview / Test / Experiment](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html)

## Enable screen capture support in getUserMedia()

Open "chrome://flags" in the latest chrome (canary/beta). 

Scroll to the bottom of the page. 

Enable flag "Enable screen capture support in getUserMedia()" 

That flag allows web pages to request access to the screen contents via the getUserMedia() API.

```javascript
var video_constraints = {
    mandatory: { chromeMediaSource: 'screen' },
    optional: []
};
navigator.webkitGetUserMedia({
    audio: false,
    video: video_constraints
}, onstreaming, onfailure);
```

====
# Cross Browser Support (Interoperable)

This [WebRTC Experiment](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

## Use it in your own site!

```html
<table class="visible">
    <tr>
        <td style="text-align: right;">
            <input type="text" id="conference-name" placeholder="Room Name">
        </td>
        <td>
            <button id="start-conferencing">Share your screen</button>
        </td>
    </tr>
</table>

<table id="rooms-list" class="visible"></table>
<div id="participants"></div>

<script src="https://bit.ly/socket-io"></script>
<script src="https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/RTCPeerConnection-v1.4.js"></script>
<script src="https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/conference.js"> </script>
<script src="https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/conference-ui.js"></script>
```

# Use your own socket.io implementation!

```javascript
var config = {
    // JUST change code in openSocket method
    openSocket: function (config) {
        // ---------------------------- from here
        
        var socket = io.connect('your own socket.io URL');

        // set channel: 'screen-sharing' is the default channel
        socket.channel = config.channel || 'screen-sharing';

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
