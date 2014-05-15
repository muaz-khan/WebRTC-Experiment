## [Google Chrome Extension to capture content of screen](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Chrome-Extensions/desktopCapture) / [Demo](https://www.webrtc-experiment.com/Pluginfree-Screen-Sharing/)

Use your browser to share content of screen in High-Quality (HD) format with one or more users!

Extension files are available here:

* https://www.webrtc-experiment.com/store/capture-screen/

=

### Prerequisites

Install chrome extension. Google Apps Store link will be given shortly. <a href="https://www.webrtc-experiment.com/store/capture-screen/">Temp Link</a>

=

##### How to capture content of screen from chrome extension?

Following any of the following steps:

1. Download [`Capture-Screen.crx`](https://www.webrtc-experiment.com/store/capture-screen/Capture-Screen.crx) and [`Capture-Screen.pem`](https://www.webrtc-experiment.com/store/capture-screen/Capture-Screen.pem) from [this link](https://www.webrtc-experiment.com/store/capture-screen/).
2. Otherwise, open `chrome://extensions/`; enable "Developer Mode"; click "Load unpacked extension..." button and select current directory.

Remember: You must drag&drop `crx` file over `chrome://extensions/` page to install chrome extension.

Second Step you should do is inject following DetectRTC code in your WebRTC application:

```javascript
// todo: need to check exact chrome browser because opera also uses chromium framework
var isChrome = !!navigator.webkitGetUserMedia;

// DetectRTC.js - github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
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

Now, you can capture content of any opened application using follownig code snippet:

```javascript
function captureUserMedia(onStreamApproved) {
    // this statement defines getUserMedia constraints
    // that will be used to capture content of screen
    var screen_constraints = {
        mandatory: {
            chromeMediaSource: DetectRTC.screen.chromeMediaSource,
            maxWidth: window.screen.width > 1280 ? window.screen.width : 1280,
            maxHeight: window.screen.height > 720 ? window.screen.height : 720,
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

#### Browser Support

[Capture Screen Extension](https://www.webrtc-experiment.com/store/capture-screen/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

=

#### License

[Capture Screen Extension](https://www.webrtc-experiment.com/store/capture-screen/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
