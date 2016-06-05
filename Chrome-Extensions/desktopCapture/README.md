# Chrome desktopCapture extension

This chrome extension simply captures content of your screen. It returns `source-id` to callee; and that `source-id` can be used as `chromeMediaSourceId` in WebRTC applications to capture screen's MediaStream.

| Extension Name        | Source Code           | Google App Store |
| ------------- |-------------|-------------|
| WebRTC Screen Capturing | [ github/desktopCapture ](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture) | [![Install Chrome Extension](https://raw.github.com/GoogleChrome/chrome-app-samples/master/tryitnowbutton_small.png)](https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk) |

## How to use?

1. Download [ZIP](http://dl.webrtc-experiment.com/desktopCapture.zip) or [TAR](http://dl.webrtc-experiment.com/desktopCapture.tar.gz)
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

Learn more about how to publish a chrome extension in Google App Store:

* https://developer.chrome.com/webstore/publish

## For more information

For additional information, click [this link](https://github.com/muaz-khan/WebRTC-Experiment/blob/7cd04a81b30cdca2db159eb746e2714307640767/Chrome-Extensions/desktopCapture/README.md).

## Other Extensions

| Extension Name        | Source Code           | Google App Store |
| ------------- |-------------|-------------|
| WebRTC Desktop Sharing | [github/desktopCapture-p2p](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture-p2p) | [![Install Chrome Extension](https://raw.github.com/GoogleChrome/chrome-app-samples/master/tryitnowbutton_small.png)](https://chrome.google.com/webstore/detail/webrtc-desktop-sharing/nkemblooioekjnpfekmjhpgkackcajhg) |
| Tab Capturing in Chrome | [gitjub/tabCapture](https://github.com/muaz-khan/Chrome-Extensions/tree/master/tabCapture) | [![Install Chrome Extension](https://raw.github.com/GoogleChrome/chrome-app-samples/master/tryitnowbutton_small.png)](https://chrome.google.com/webstore/detail/tab-capturing-sharing/pcnepejfgcmidedoimegcafiabjnodhk) |
| WebRTC File Sharing Chrome Extension | [ github/file-sharing ](https://github.com/muaz-khan/Chrome-Extensions/tree/master/file-sharing) | [![Install Chrome Extension](https://raw.github.com/GoogleChrome/chrome-app-samples/master/tryitnowbutton_small.png)](https://chrome.google.com/webstore/detail/webrtc-file-sharing/nbnncbdkhpmbnkfngmkdbepoemljbnfo) |

### List of applications that are using same extension:

1. [getScreenId.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js) - a tinny javascript library that be used in any domain, application or WebRTC wrapper library.
2. [RTCMultiConnection.js](https://github.com/muaz-khan/RTCMultiConnection) - a WebRTC wrapper library providing approximately all possible WebRTC p2p-mesh-based features.
3. [Screen.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/screen-sharing) - a screen capturing library along with multi-user p2p screen streaming.
4. [Pluginfree Screen Sharing](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Pluginfree-Screen-Sharing) - a standalone application, providing multi-user p2p screen streaming in HD format.

## Recommendations?

It is recommended to use `getScreenId.js` to capture screen. In that case, you don't need to publish this chrome extension yourself in Google App Store.

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

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
