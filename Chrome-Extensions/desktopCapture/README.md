# Google Chrome [desktopCapture extension](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture)

> This chrome extension simply captures content of your screen. It returns `source-id` to callee; and that `source-id` can be used as `chromeMediaSourceId` in WebRTC applications to capture screen's MediaStream.

| Description        | Download           | Install |
| ------------- |-------------|-------------|
| Access/capture screen from any HTTPs domain. | [Source Code](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture) | [Install from Google Web Store](https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk) |

# How to modify?

1. Download [ZIP](http://webrtcweb.com/desktopCapture.zip) or [TAR](http://webrtcweb.com/desktopCapture.tar.gz)
2. Windows users can use WinZip/WinRAR/7Zip however MacOSX/Linux users can use `tar -zxvf desktopCapture.tar.gz` to extract the archive
3. Add your own domain [here at line #17](https://github.com/muaz-khan/Chrome-Extensions/blob/master/desktopCapture/manifest.json#L17)
4. LocalHost users can test directly by adding `unpacked extension..` via `chrome://extensions/`
5. Otherwise you can make ZIP of the entire directory and upload at [Google dashboard](https://chrome.google.com/webstore/developer/dashboard)

Here is how to modify `allowed-domains` in `manifest.json` file:

```
{
    "content_scripts": [ {
       "js": [ "content-script.js" ],
       "all_frames": true,
       "run_at": "document_end",
       "matches": ["https://www.domain.com/*"]
    }]
}
```

# How to publish?

Learn more about how to publish a chrome extension in Google App Store:

* https://developer.chrome.com/webstore/publish

For additional information, click [this link](https://github.com/muaz-khan/WebRTC-Experiment/blob/7cd04a81b30cdca2db159eb746e2714307640767/Chrome-Extensions/desktopCapture/README.md).

# How to use?

Download and link `Screen-Capturing.js`:

* https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js

Now you can use `getScreenConstraints` method to capture your screen:

```javascript
getScreenConstraints(function(error, screen_constraints) {
    if (error) {
        return alert(error);
    }

    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia({
        video: screen_constraints
    }, function(stream) {
        var video = document.querySelector('video');
        video.src = URL.createObjectURL(stream);
        video.play();
    }, function(error) {
        alert(JSON.stringify(error, null, '\t'));
    });
});
```

For more `Screen-Capturing.js` snippets/help: 

* https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js#how-to-use-screen-capturingjs

# Other Extensions

| Description        | Download           | Install |
| ------------- |-------------|-------------|
| Record full screen, apps' screen, youtube audio, and more. | [Source Code](https://github.com/muaz-khan/Chrome-Extensions/tree/master/screen-recording) | [Install from Google Web Store](https://chrome.google.com/webstore/detail/recordrtc/ndcljioonkecdnaaihodjgiliohngojp) |
| Share full screen, apps' screen, youtube audio, and more. | [Source Code](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture-p2p) | [Install from Google Web Store](https://chrome.google.com/webstore/detail/webrtc-desktop-sharing/nkemblooioekjnpfekmjhpgkackcajhg)  |
| Access/capture screen from any HTTPs domain. | [Source Code](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture) | [Install from Google Web Store](https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk) |
| Share selected tab (peer-to-peer). | [Source Code](https://github.com/muaz-khan/Chrome-Extensions/tree/master/tabCapture) | [Install from Google Web Store](https://chrome.google.com/webstore/detail/tab-capturing-sharing/pcnepejfgcmidedoimegcafiabjnodhk) |
| Share files peer-to-peer. | [Source Code](https://github.com/muaz-khan/Chrome-Extensions/tree/master/file-sharing) | [Install from Google Web Store](https://chrome.google.com/webstore/detail/tab-capturing-sharing/pcnepejfgcmidedoimegcafiabjnodhk) |

### List of applications that are using same extension:

1. [RecordRTC.js](https://github.com/muaz-khan/RecordRTC) - a WebRTC wrapper library for audio+video+screen activity recording
2. [RTCMultiConnection.js](https://github.com/muaz-khan/RTCMultiConnection) - a WebRTC wrapper library for peer-to-peer applications
3. [getScreenId.js](https://github.com/muaz-khan/getScreenId) - a tinny javascript library that be used in any domain, application or WebRTC wrapper library.
4. [Screen.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/screen-sharing) - a screen capturing library along with multi-user p2p screen streaming.
5. [Pluginfree Screen Sharing](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Pluginfree-Screen-Sharing) - a standalone application, providing multi-user p2p screen streaming in HD format.

----

# Do NOT Deploy Chrome Extension YourSelf!!!!

* https://github.com/muaz-khan/getScreenId

> getScreenId | Capture Screen on Any Domain! This script is a hack used to support single chrome extension usage on any HTTPs domain.

First step, install this chrome extension:

* https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

Now use `getScreenId.js` (on any HTTPs page):

```html
<script src="https://cdn.WebRTC-Experiment.com/getScreenId.js"></script>
<video controls autoplay></video>
<script>
getScreenId(function (error, sourceId, screen_constraints) {
    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(screen_constraints, function (stream) {
        document.querySelector('video').src = URL.createObjectURL(stream);
    }, function (error) {
        console.error(error);
    });
});
</script>
```

# License

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
