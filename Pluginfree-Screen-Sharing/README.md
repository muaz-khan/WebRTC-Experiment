## [WebRTC](https://www.webrtc-experiment.com/) plugin free screen sharing / [Demo](https://www.webrtc-experiment.com/Pluginfree-Screen-Sharing/)

Use your browser to share content of screen in High-Quality (HD) format with one or more users!

=

### Disclaimer

It isn't totally pluginfree (unfortunately)! You'll be asked either to enable command-line flag or install a chrome extension.

=

### Prerequisites

<ol>
    <li>Install chrome extension. Google Apps Store link will be given shortly. <a href="https://www.webrtc-experiment.com/store/capture-screen/">Temp Link</a></li>
    <li>
        Otherwise make sure you are running the chrome with command line flag "<strong><a href="http://peter.sh/experiments/chromium-command-line-switches/#enable-usermedia-screen-capturing">--enable-usermedia-screen-capturing</a></strong>" e.g. on Windows "<strong>Chrome.exe --enable-usermedia-screen-capturing</strong>"
        <div style="text-align:center;">
            <img src="https://www.webrtc-experiment.com/images/--enable-usermedia-screen-capturing.png" style="max-width: 100%;">
        </div>
    </li>
</ol>

=

### Advantages

<ol>
    <li>Share full screen with one or more users in <strong>HD</strong> format!</li>
    <li>Share screen from chrome and view over all WebRTC compatible browsers/plugins.</li>
    <li>
        You can open private rooms and it will be really "totally" private!<br /><br />
        <ol>
            <li>Use hashes to open private rooms: <strong>#private-room</strong></li>
            <li>Use URL parameters to open private rooms: <strong>?private=room</strong></li>
        </ol>
    </li>
</ol>

=

### Common issues & queries

<ol>
    <li>Recursive cascade images or blurred screen experiences occur only when you try to share screen between two tabs on the same system. This NEVER happens when sharing between unique systems or devices.</li>
    <li>Firefox/Opera has no support of screen-capturing yet. However, you can view shared screens on both Firefox and Opera!</li>
    <li>Remember, it is not desktop sharing! It is just a state-less screen sharing. Desktop sharing is possible only through native (C++) applications.</li>
</ol>

=

#### Developers Guide

[Command-Line based API](http://peter.sh/experiments/chromium-command-line-switches/#enable-usermedia-screen-capturing) invocation:

```javascript
var screen_constraints = {
    mandatory: {
        chromeMediaSource: 'screen',
        maxWidth: window.screen.width > 1280 ? window.screen.width : 1280,
        maxHeight: window.screen.height > 720 ? window.screen.height : 720,
        minAspectRatio: 1.77
    },
    optional: []
};

var session = {
    audio: false,
    video: screen_constraints
};

navigator.webkitGetUserMedia(session, onStreamApproved, OnStreamDenied);
```

Simply follow these steps:

1. Use `chromeMediaSource:screen`
2. Set `audio:false`

##### How to capture content of screen from chrome extension?

First step you should do is download [`Capture-Screen.crx`](https://www.webrtc-experiment.com/store/capture-screen/Capture-Screen.crx) and [`Capture-Screen.pem`](https://www.webrtc-experiment.com/store/capture-screen/Capture-Screen.pem) from [this link](https://www.webrtc-experiment.com/store/capture-screen/).

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

There is another experiment: [WebRTC Tab Sharing using experimental tabCapture APIs](https://www.webrtc-experiment.com/screen-broadcast/)

=

#### What about Desktop Sharing?

It is a big wish to share desktop using RTCWeb peer connection APIs but unfortunately currently it is not possible.

Current experiment is using chrome screen sharing APIs (media/constraints) which allows end-users to **view the screen**....nothing else!

=

Test it on HTTPS. Because, screen capturing (currently) only works on SSL domains.

Chrome denies request automatically in the following cases:

1. Screen capturing is not enabled via command line switch.
mandatory: {chromeMediaSource: 'screen'} must be there

2. Audio stream was requested (it's not supported yet).

```javascript
navigator.webkitGetUserMedia({
	audio: false	/* MUST be false because audio capturer not works with screen capturer */
});
```

3. Request from a page that was not loaded from a secure origin.

Here is their C++ code that denies screen capturing:

```c
if (!screen_capture_enabled ||
	request.audio_type != content::MEDIA_NO_SERVICE ||
	!request.security_origin.SchemeIsSecure()) {
		callback.Run(content::MediaStreamDevices());
		return;
	}
```

Personally I don’t know why they deny non-SSL requests. Maybe they’re using iframes in sandbox mode or something else that runs only on HTTPS.

Browsers who don't understand {chromeMediaSource: 'screen'} constraint will simply get video like chrome stable or Firefox.

=

For signaling; please check following page:

https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

Remember, you can use any signaling implementation exists out there without modifying any single line! Just skip below code and open [above link](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md)!

=

#### Browser Support

[WebRTC plugin free screen sharing](https://www.webrtc-experiment.com/Pluginfree-Screen-Sharing/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

=

#### License

[WebRTC plugin free screen sharing](https://www.webrtc-experiment.com/Pluginfree-Screen-Sharing/) experiment is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
