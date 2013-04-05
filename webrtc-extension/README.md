#### Tab Sharing using tabCapture APIs / [Download ZIP](http://code.google.com/p/muazkh/downloads/list)

Sharing tab using chrome **experimental tabCapture APIs**; broadcasting over many peers.

#### [You can view broadcasted tabs here](https://webrtc-experiment.appspot.com/screen-broadcast/)

You can also view broadcasted tab using Firefox nightly, aurora, and 18+stable!

There is a plugin-free screen sharing experiment too! [Try it Now!](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html)

#### How to capture stream using tabCapture APIs?

```javascript
function captureTab() {
    chrome.tabs.getSelected(null, function(tab) {
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
        chrome.tabCapture.capture(constraints, function(stream) {
            // it is a LocalMediaStream object!!
        });
    });
}
```

#### License

[TabCapture Extension](http://code.google.com/p/muazkh/downloads/list) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
