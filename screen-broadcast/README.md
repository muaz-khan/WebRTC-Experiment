#### Tab Sharing using tabCapture APIs / [Download ZIP](http://code.google.com/p/muazkh/downloads/list)

Sharing tab using chrome **experimental tabCapture APIs**; broadcasting over many peers.

https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Chrome-Extensions/tabCapture

=

#### [You can view broadcasted tabs here](https://www.webrtc-experiment.com/screen-broadcast/)

You can also view broadcasted tab using Firefox nightly, aurora, and 18+stable! It is cross-browser!

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

#### Browser support of tabCapture APIs

From April, 2013:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

=

#### List of browsers that can view broadcasted tab

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

=

#### Plugin-free screen sharing

There is a plugin-free screen sharing experiment too! [Try it Now!](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html)

=

#### License

[TabCapture Extension](http://code.google.com/p/muazkh/downloads/list) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
