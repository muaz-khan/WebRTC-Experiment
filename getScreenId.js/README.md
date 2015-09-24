# `getScreenId.js` / [LIVE Demo](https://www.webrtc-experiment.com/getScreenId/)

## Hacking to use single chrome-extension on any domain!

```html
<!--
* This script is a hack used to support single chrome extension usage on any domain.

* This script has issues, though.
* It uses "postMessage" mechanism which fails to work if someone is using it from inside an <iframe>.
* The only solution for such cases is, use WebSockets or external servers to pass "source-ids".
-->
```

> You don't need to PUBLISH/deploy your own chrome-extension when using this script!

# Chrome Extension

* [https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk](https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk)

# How it works?

* Your script will make a `postMessage` request to `getScreenId.js`
* `getScreenId.js` will connect with chrome-extension using an internal `<iframe>`.
* That `<iframe>` is loaded from domain: `https://www.webrtc-experiment.com/`
* That `<iframe>` can connect with chrome-extension. It can send/receive `postMessage` data.
* Same `postMessage` API are used to pass `screen-id` back to your script.

# Firefox

* [https://github.com/muaz-khan/Firefox-Extensions/tree/master/enable-screen-capturing](https://github.com/muaz-khan/Firefox-Extensions/tree/master/enable-screen-capturing)

# How to use?

```html
<script src="https://cdn.WebRTC-Experiment.com/getScreenId.js"></script>

<!-- or -->
<script src="https://cdn.rawgit.com/muaz-khan/RecordRTC/master/RecordRTC.js"></script>
```

```javascript
getScreenId(function (error, sourceId, screen_constraints) {
    // error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
    // sourceId == null || 'string' || 'firefox'

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(screen_constraints, function (stream) {
        document.querySelector('video').src = URL.createObjectURL(stream);
    }, function (error) {
        console.error(error);
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
    }, function (error) {
        console.error(error);
    });
});
```

# Deploy extension yourself?

* [https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture)

# License

[getScreenId.js](https://github.com/muaz-khan/getScreenId) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
