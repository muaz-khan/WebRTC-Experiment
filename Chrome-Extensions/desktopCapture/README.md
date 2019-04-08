# Please use `getDisplayMedia` instead

```javascript
getScreenStream(function(screenStream) {
    video.srcObject = screenStream;
});

function getScreenStream(callback) {
    if (navigator.getDisplayMedia) {
        navigator.getDisplayMedia({
            video: true
        }).then(screenStream => {
            callback(screenStream);
        });
    } else if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({
            video: true
        }).then(screenStream => {
            callback(screenStream);
        });
    } else {
        getScreenId(function(error, sourceId, screen_constraints) {
            navigator.mediaDevices.getUserMedia(screen_constraints).then(function(screenStream) {
                callback(screenStream);
            });
        });
    }
}
```

## Disclaimer

No more maintaining this extension; as of 2019. So please use at your own risk.

* https://www.webrtc-experiment.com/disclaimer/

----


# Google Chrome [desktopCapture extension](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture)

> This chrome extension simply captures content of your screen. It returns `source-id` to callee; and that `source-id` can be used as `chromeMediaSourceId` in WebRTC applications to capture screen's MediaStream.

| Description        | Download           | Install |
| ------------- |-------------|-------------|
| Access/capture screen from any HTTPs domain. | [Source Code](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture) | [Install from Google Web Store](https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk) |

# Demos

Note: Following demos works only if you install chrome extension from [Google WebStore](https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk).

* https://www.webrtc-experiment.com/getScreenId/
* https://www.webrtc-experiment.com/Screen-Capturing/
* https://www.webrtc-experiment.com/Pluginfree-Screen-Sharing/ (peer to peer)


# How to modify this chrome extension?

1. Download ZIP
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

## License

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT license](https://github.com/muaz-khan/Chrome-Extensions/blob/master/LICENSE) . Copyright (c) [Muaz Khan](https://MuazKhan.com).
