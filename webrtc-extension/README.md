Try [WebRTC plugin free screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html) instead. No tabCapture APIs; No chrome extension; No Firefox add-ons!

====
# Browser Support

[WebRTC Screen Broadcasting Experiment](https://webrtc-experiment.appspot.com/screen-broadcast/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

In simple words, multi-peers and sockets are opened to make it work!

[This webrtc experiment](https://webrtc-experiment.appspot.com/screen-broadcast/) uses socket.io as signaling gateway.

Stream is captured using Google Chrome experimental `tabCapture APIs` and transmitted over socket.

## [Download](http://code.google.com/p/muazkh/downloads/list) chrome extension using tabCapture APIs

It has the ability to handle unlimited peers. So unlimited peers can get access to broadcasted screen.

If you [download extension](http://code.google.com/p/muazkh/downloads/list), you can see a file [broadcaster.js](https://webrtc-experiment.appspot.com/webrtc-extension/broadcaster.js). This file do all the stuff needed to interact with Google Chrome extension APIs. Also, this file uses tabCapture APIs to capture screen and broadcast it.

The following function is used to capture tab/screen:

```javascript
chrome.tabCapture.capture({ audio: true, video: true }, function(stream) {
    // broadcastNow(stream);
});
```

[manifest.json](https://webrtc-experiment.appspot.com/webrtc-extension/manifest.json) file looks like this:

```javascript
...
"background": {
    "scripts": ["socket.io.js", "RTCPeerConnection.js", "original.js", "broadcaster.js"],
    "persistent": false
},
...
"permissions": [
    "tabCapture", "notifications", "contextMenus"
],
...
```

You can see permission for `tabCapture APIs`.

1. [socket.io.js](https://webrtc-experiment.appspot.com/webrtc-extension/socket.io.js)
2. [RTCPeerConnection.js](https://webrtc-experiment.appspot.com/webrtc-extension/RTCPeerConnection.js)
3. [original.js](https://webrtc-experiment.appspot.com/webrtc-extension/original.js)
4. [broadcaster.js](https://webrtc-experiment.appspot.com/webrtc-extension/broadcaster.js)

I used socket.io over `PubNub`...you can use whatever you want. So only [broadcaster.js](https://webrtc-experiment.appspot.com/webrtc-extension/broadcaster.js) file is important for you!

# Remember:

The key used in [original.js](https://webrtc-experiment.appspot.com/webrtc-extension/original.js) file MUST match the key used in your webpage. Otherwise, you'll get no result!

```javascript
var socket_config = {
	publish_key: 'demo',       // Line 3 in original.js
	subscribe_key: 'demo',
	ssl: true
};
```

====
## License

[WebRTC Screen Broadcasting Experiment](https://webrtc-experiment.appspot.com/screen-broadcast/) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
