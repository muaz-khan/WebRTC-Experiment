### [Tab Sharing](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/screen-broadcast) using tabCapture APIs / [Demo](https://webrtc-experiment.appspot.com/screen-broadcast/)

Using the chrome.tabCapture API to interact with tab media streams.

Sharing realtime screenshots of the selected tab over many users using WebRTC peer-to-peer model.

=

## Links

You can install chrome tab capturing extension from Google App Store:

https://chrome.google.com/webstore/detail/tab-capturing-sharing/pcnepejfgcmidedoimegcafiabjnodhk

Source code of the chrome extension is available here:

https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Chrome-Extensions/tabCapture

Official resource: tabCaputure documentation: https://developer.chrome.com/extensions/tabCapture

=

#### How to capture stream using tabCapture APIs?

```javascript
chrome.tabs.getSelected(null, function (tab) {
    var video_constraints = {
        mandatory: {
            chromeMediaSource: 'tab'
        }
    };
    var constraints = {
        audio: false,
        video: true,
        videoConstraints: video_constraints
    };
    chrome.tabCapture.capture(constraints, function (stream) {
        // it is a LocalMediaStream object!!
    });
});
```

=

#### Browser support

You can share tab, only from chrome.

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Opera | [Stable](http://www.opera.com/) / [NEXT](http://www.opera.com/computer/next)  |
| Android | [Chrome](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) / [Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox) / [Opera](https://play.google.com/store/apps/details?id=com.opera.browser) |

=

#### License

[TabCapture Extension](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Chrome-Extensions/tabCapture) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
