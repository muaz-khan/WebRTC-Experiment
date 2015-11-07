# Chrome desktopCapture extension

This chrome extension simply captures content of your screen. It returns `source-id` to callee; and that `source-id` can be used as `chromeMediaSourceId` in WebRTC applications to capture screen's MediaStream.

```
# Step #1:
# Download this entire directory
https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture

# Step #2:
# Change this single line and add your own domain:
https://github.com/muaz-khan/Chrome-Extensions/blob/master/desktopCapture/manifest.json#L17

# E.g.
# "matches": ["*://www.eshop4deal.com/*"]

# Step #3:
# Make ZIP of the entire directory.
# Using Mac, you can right-click to Compress the directory.
# Using windows, you can use either WinRAR or 7Zip tools.

# Step #4:
# Add a "new item" here:
https://chrome.google.com/webstore/developer/dashboard

# Above link will ask you link "ZIP" file.
# Then it will navigate you to publisher page
# Where you can use "Publish" button (bottom of the page) to publish your
# extension to Google App Store.
# Usually it takes 20-to-60 minutes for first deployment

# When extension will be published, you can install the extension
# And reload your page and NOW Screen Capturing will/should work.

# Google guys also explained steps to deploy a chrome extension:
https://developer.chrome.com/webstore/publish
```

List of applications that are using same extension:

1. [getScreenId.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js) - a tinny javascript library that be used in any domain, application or WebRTC wrapper library.
2. [RTCMultiConnection.js](https://github.com/muaz-khan/RTCMultiConnection) - a WebRTC wrapper library providing approximately all possible WebRTC p2p-mesh-based features.
3. [Screen.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/screen-sharing) - a screen capturing library along with multi-user p2p screen streaming.
4. [Pluginfree Screen Sharing](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Pluginfree-Screen-Sharing) - a standalone application, providing multi-user p2p screen streaming in HD format.

## Recommendations?

It is recommended to use `getScreenId.js` to capture screen. In that case, you don't need to publish this chrome extension yourself in Google App Store.

```html
<script src="//cdn.WebRTC-Experiment.com/getScreenId.js"></script>
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

## How to install?

* https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

## How to publish yourself?

First step: modify `allowed-domains` in `manifest.json` file:

```
{
    "content_scripts": [ {
       "js": [ "content-script.js" ],
       "all_frames": true,
       "run_at": "document_start",
       "matches": ["*://www.domain.com/*"]
    }]
}
```

To test locally, you can add `*://localhost:*/*` in the `matches` list.

Second step: make ZIP of the directory.

Third step: navigate to [Chrome WebStore Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard) and click **Add New Item** blue button.

To learn more about how to publish a chrome extension in Google App Store:

* https://developer.chrome.com/webstore/publish

## How to add inline-install button?

**Make sure that you added and verified your webpage/domain using Google WebMaster tools.** Additional instructions available [here](https://support.google.com/webmasters/answer/35179?hl=en).

```html
<!DOCTYPE html>
<html>
    <head>
        <!-- head; this <link> tag MUST be in <head> section -->
        <link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/your-chrome-extension-id">
    </head>
    <body>
        <!-- body; the button element that is used to invoke inline installation -->
        <button onclick="" id="install-button" style="padding: 0;background: none;height: 61px;vertical-align: middle;cursor:pointer;">
            <img src="https://www.webrtc-experiment.com/images/btn-install-chrome-extension.png" alt="Add to Chrome">
        </button>
        
        <script>
            document.querySelector('#inline-install').onclick = function() {
                !!navigator.webkitGetUserMedia 
                    && !!window.chrome 
                    && !!chrome.webstore 
                    && !!chrome.webstore.install && 
                chrome.webstore.install(
                    'https://chrome.google.com/webstore/detail/your-chrome-extension-id', 
                    successCallback, 
                    failureCallback
                );
            };
            
            function successCallback() {
                location.reload();
            }
            
            function failureCallback(error) {
                alert(error);
            }
        </script>
    </body>
</html>
```

## For more information

For additional information, click [this link](https://github.com/muaz-khan/WebRTC-Experiment/blob/7cd04a81b30cdca2db159eb746e2714307640767/Chrome-Extensions/desktopCapture/README.md).

## Credits

[Muaz Khan](https://github.com/muaz-khan):

1. Personal Webpage: http://www.muazkhan.com
2. Email: muazkh@gmail.com
3. Twitter: https://twitter.com/muazkh and https://twitter.com/WebRTCWeb
4. Google+: https://plus.google.com/+WebRTC-Experiment
5. Facebook: https://www.facebook.com/WebRTC

## License

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
