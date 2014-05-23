<h1>
    <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Chrome-Extensions/desktopCapture">
        Google Chrome Extension
        <br />to capture content of screen!
    </a>
</h2>

> Use your browser to share content of screen in High-Quality (HD-1080p) format with one or more users!

**Download the extension; edit `manifest.json` then publish on Google App Store and enjoy HD screen capturing!**

=

You can install extension directly from Google App Store:

* https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

You can test following demo after installation:

* https://www.webrtc-experiment.com/Pluginfree-Screen-Sharing/

=

## Remember

**This chrome extension has no dependency!**

**This chrome extension simply gets sourceId for the content of the screen you wanted to be shared. It doesn't invoke getUserMedia API itself; also it doesn't use PeerConnection API to do anything P2P!**

i.e. **This chrome extension is totally stateless extension which is useful only to get sourceId of the content of screen!**

1. You can upload/publish/use this chrome extension within any WebRTC application
2. You simply need to edit `manifest.json` file to link content-script to your webpage (its mandatory part, though)
3. You can directly load extension in developer mode or make crx file and drop over `chrome://extensions` page or publish to Google App Store
4. The extension that is already [published over Google App Store](https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk) is useful only for **WebRTC Experiments** webpage; you can't use it because extension is hard-coded to link https://www.webrtc-experiment.com/

Fourth point is important to understand because usually developers try to install [Google App Store extension](https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk) and they're unable to use it in their own webpages.

=

## How to publish on Google App Store?

It is very easy to publish this extension to Google App Store. 

<ol>
    <li>
        Make sure that you edited <code>manifest.json</code> file:
        
        <pre>
{
    "content_scripts": [ {
       "js": [ "content-script.js" ],
       "matches": ["*://www.your-domain.com/*"]
    }],
    "externally_connectable": {
      "matches": ["*://www.your-domain.com/*"]
    }
}
</pre>
    </li>
    
    <li>
        Open <a href="https://chrome.google.com/webstore/developer/dashboard">Chrome WebStore Developer Dashboard</a> and click <strong>Add New Item</strong> blue button.
    </li>
</ol>

Learn more about how to publish a chrome extension on Google WebStore [here](https://developer.chrome.com/webstore/publish).

=

## How to add inline-install button?

> Make sure that you added and verified your webpage/domain using Google WebMaster tools.

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

=

##### How to use chrome extension in your own webpage?

Simply inject following DetectRTC code in your WebRTC application:

```javascript
// todo: need to check exact chrome browser because opera also uses chromium framework
var isChrome = !!navigator.webkitGetUserMedia;

// DetectRTC.js - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
// Below code is taken from RTCMultiConnection-v1.8.js (http://www.rtcmulticonnection.org/changes-log/#v1.8)
var DetectRTC = {};

(function () {
    var screenCallback;

    DetectRTC.screen = {
        chromeMediaSource: 'screen',
        getSourceId: function (callback) {
            if (!callback) throw '"callback" parameter is mandatory.';
            screenCallback = callback;
            window.postMessage('get-sourceId', '*');
        },
        isChromeExtensionAvailable: function (callback) {
            if (!callback) return;

            if (DetectRTC.screen.chromeMediaSource == 'desktop') callback(true);

            // ask extension if it is available
            window.postMessage('are-you-there', '*');

            setTimeout(function () {
                if (DetectRTC.screen.chromeMediaSource == 'screen') {
                    callback(false);
                } else callback(true);
            }, 2000);
        },
        onMessageCallback: function (data) {
            console.log('chrome message', data);

            // "cancel" button is clicked
            if (data == 'PermissionDeniedError') {
                DetectRTC.screen.chromeMediaSource = 'PermissionDeniedError';
                if (screenCallback) return screenCallback('PermissionDeniedError');
                else throw new Error('PermissionDeniedError');
            }

            // extension notified his presence
            if (data == 'rtcmulticonnection-extension-loaded') {
                DetectRTC.screen.chromeMediaSource = 'desktop';
            }

            // extension shared temp sourceId
            if (data.sourceId) {
                DetectRTC.screen.sourceId = data.sourceId;
                if (screenCallback) screenCallback(DetectRTC.screen.sourceId);
            }
        }
    };

    // check if desktop-capture extension installed.
    if (window.postMessage && isChrome) {
        DetectRTC.screen.isChromeExtensionAvailable();
    }
})();

window.addEventListener('message', function (event) {
    if (event.origin != window.location.origin) {
        return;
    }

    DetectRTC.screen.onMessageCallback(event.data);
});
```

Now, you can capture content of any opened application using following code snippet:

```javascript
function captureUserMedia(onStreamApproved) {
    // this statement defines getUserMedia constraints
    // that will be used to capture content of screen
    var screen_constraints = {
        mandatory: {
            chromeMediaSource: DetectRTC.screen.chromeMediaSource,
            maxWidth: 1920,
            maxHeight: 1080,
            minAspectRatio: 1.77
        },
        optional: []
    };

    // this statement verifies chrome extension availability
    // if installed and available then it will invoke extension API
    // otherwise it will fallback to command-line based screen capturing API
    if (DetectRTC.screen.chromeMediaSource == 'desktop' && !DetectRTC.screen.sourceId) {
        DetectRTC.screen.getSourceId(function (error) {
            // if exception occurred or access denied
            if (error && error == 'PermissionDeniedError') {
                alert('PermissionDeniedError: User denied to share content of his screen.');
            }

            captureUserMedia(onStreamApproved);
        });
        return;
    }

    // this statement sets gets 'sourceId" and sets "chromeMediaSourceId" 
    if (DetectRTC.screen.chromeMediaSource == 'desktop') {
        screen_constraints.mandatory.chromeMediaSourceId = DetectRTC.screen.sourceId;
    }

    // it is the session that we want to be captured
    // audio must be false
    var session = {
        audio: false,
        video: screen_constraints
    };

    // now invoking native getUserMedia API
    navigator.webkitGetUserMedia(session, onStreamApproved, OnStreamDenied);

});
```

=

## How to test on HTTP?

Enable a command-line switch on chrome canary:

```
--allow-http-screen-capture
```

Ref: http://kurtextrem.github.io/ChromiumFlags/#allow-http-screen-capture

=

## Browser Support

[Capture Screen Extension](https://www.webrtc-experiment.com/store/capture-screen/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

=

#### License

[Capture Screen Extension](https://www.webrtc-experiment.com/store/capture-screen/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
