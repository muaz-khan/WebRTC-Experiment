# Disclaimer

No more maintaining this extension; as of 2019. So please use at your own risk.

* https://www.webrtc-experiment.com/disclaimer/

----

## Chrome tabCapture extension

This chrome extension not only captures content of the selected tab, but also provides multi-user peer-to-peer tab-streaming.

## Codes to view the shared tab

```
index.html
```

## How to capture stream using tabCapture APIs?

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

## How to publish yourself?

Make ZIP of the directory. Then navigate to [Chrome WebStore Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard) and click **Add New Item** blue button.

To learn more about how to publish a chrome extension in Google App Store:

* https://developer.chrome.com/webstore/publish

## For more information

For additional information, click [this link](https://github.com/muaz-khan/WebRTC-Experiment/blob/7cd04a81b30cdca2db159eb746e2714307640767/Chrome-Extensions/desktopCapture/README.md).

## License

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT license](https://github.com/muaz-khan/Chrome-Extensions/blob/master/LICENSE) . Copyright (c) [Muaz Khan](https://MuazKhan.com).
