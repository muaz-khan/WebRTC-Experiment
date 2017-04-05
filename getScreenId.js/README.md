# getScreenId | Capture Screen on Any Domain!

* Live Demo: https://www.webrtc-experiment.com/getScreenId/
* YouTube video: https://www.youtube.com/watch?v=UHrsfe9RYAQ

1. Install this: https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk
2. Now use below codes on any HTTPs domain.
3. Remember, HTTPs is required.
4. getScreenId gives you "MediaStream" object; you can share that object with other users using AppRTC demo, SimpleWebRTC or EasyRTC or PeerJs libraries, or any standalone peer-to-peer demo.
5. In simple words, you have to use RTCPeerConnection API along with getScreenId to share screen with other users.

> Hacking to use single chrome-extension on any domain!

```html
<!--
* This script is a hack used to support single chrome extension usage on any domain.

* This script has issues, though.
* It uses "postMessage" mechanism which fails to work if someone is using it from inside an <iframe>.
* The only solution for such cases is, use WebSockets or external servers to pass "source-ids".
-->
```

> You don't need to PUBLISH/deploy your own chrome-extension when using this script!

# LocalHost server

```sh
node server.js
```

Nope open: `https://localhost:9001/`

# How to use?

```html
<script src="https://cdn.WebRTC-Experiment.com/getScreenId.js"></script>

<!-- or -->
<script src="https://cdn.rawgit.com/muaz-khan/getScreenId/master/getScreenId.js"></script>
```

# `getScreenId`

This method allows you get chrome-media-source-id; which can be used to capture screens.

```javascript
getScreenId(function (error, sourceId, screen_constraints) {
    // error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
    // sourceId == null || 'string' || 'firefox'

    if(error == 'not-installed') {
      alert('Please install Chrome extension.');
      return;
    }

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(screen_constraints, function (stream) {
        document.querySelector('video').src = URL.createObjectURL(stream);

        // share this "MediaStream" object using RTCPeerConnection API
    }, function (error) {
      console.error('getScreenId error', error);

      alert('Failed to capture your screen. Please check Chrome console logs for further information.');
    });
});
```

Or...

```javascript
getScreenId(function (error, sourceId, screen_constraints) {
    // error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
    // sourceId == null || 'string' || 'firefox'

    if(sourceId && sourceId != 'firefox') {
        screen_constraints = {
            video: {
                mandatory: {
                    chromeMediaSource: 'screen',
                    maxWidth: 1920,
                    maxHeight: 1080,
                    minAspectRatio: 1.77
                }
            }
        };

        if (error === 'permission-denied') return alert('Permission is denied.');
        if (error === 'not-chrome') return alert('Please use chrome.');

        if (!error && sourceId) {
            screen_constraints.video.mandatory.chromeMediaSource = 'desktop';
            screen_constraints.video.mandatory.chromeMediaSourceId = sourceId;
        }
    }

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(screen_constraints, function (stream) {
        document.querySelector('video').src = URL.createObjectURL(stream);

        // share this "MediaStream" object using RTCPeerConnection API
    }, function (error) {
      console.error('getScreenId error', error);

      alert('Failed to capture your screen. Please check Chrome console logs for further information.');
    });
});
```

# `getChromeExtensionStatus`

This method allows you detect whether chrome extension is installed or not:

```javascript
getChromeExtensionStatus(function(status) {
    if (status === 'installed-enabled') alert('installed');
    if (status === 'installed-disabled') alert('installed but disabled');
    // etc.
});
```

# How it works?

* Your script will make a `postMessage` request to `getScreenId.js`
* `getScreenId.js` will connect with chrome-extension using an internal `<iframe>`.
* That `<iframe>` is loaded from domain: `https://www.webrtc-experiment.com/`
* That `<iframe>` can connect with chrome-extension. It can send/receive `postMessage` data.
* Same `postMessage` API are used to pass `screen-id` back to your script.

# Firefox

* https://github.com/muaz-khan/Firefox-Extensions/tree/master/enable-screen-capturing

# Deploy extension yourself?

* https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture

# Alternative?

* https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js

# License

[getScreenId.js](https://github.com/muaz-khan/getScreenId) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
