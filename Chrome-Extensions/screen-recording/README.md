# Record Screen Activity, Camera, Tab, Speakers and Microphone in 4K HD video (H264, VP8, VP9, MKV)

<a target="_blank" href="https://chrome.google.com/webstore/detail/recordrtc/ndcljioonkecdnaaihodjgiliohngojp">![Try it now in CWS](https://raw.github.com/GoogleChrome/chrome-app-samples/master/tryitnowbutton.png "Click here to install this extension from the Chrome Web Store")</a>

* https://chrome.google.com/webstore/detail/recordrtc/ndcljioonkecdnaaihodjgiliohngojp

<a target="_blank" href="https://chrome.google.com/webstore/detail/recordrtc/ndcljioonkecdnaaihodjgiliohngojp"><img alt="Install RecordRTC Extension" src="https://www.webrtc-experiment.com/images/recordrtc-icon.png" title="Click here to install this sample from the Chrome Web Store" /></a>

## Call From Your Own WebSite

**Live Demo:** [simple-demos/RecordRTC_Extension.html](https://www.webrtc-experiment.com/RecordRTC/simple-demos/RecordRTC_Extension.html)

You can call this chrome extension directly from your own website as well!

```javascript
if(typeof RecordRTC_Extension === 'undefined') {
    alert('RecordRTC chrome extension is either disabled or not installed.');
}

var recorder = new RecordRTC_Extension();
recorder.startRecording(recorder.getSupoortedFormats()[7], function() {
    setTimeout(function() {
        recorder.stopRecording(function(blob) {
            console.log(blob.size, blob);
            var url = URL.createObjectURL(blob);
            video.src = url;
        });
    }, 3000);
});
```

For simple code:

```javascript
var recorder = new RecordRTC_Extension();

recorder.startRecording({
    enableScreen: true,
    enableMicrophone: true,
    enableSpeakers: true
});

btnStopRecording.onclick = function() {
    recorder.stopRecording(function(blob) {
        console.log(blob.size, blob);
        var url = URL.createObjectURL(blob);
        video.src = url;
    });
};
```

### `getSupoortedFormats`

You can pass any of the following on `startRecording` method:

```javascript
const getSupoortedFormats = [{
    enableScreen: true
}, {
    enableScreen: true,
    enableMicrophone: true
}, {
    enableScreen: true,
    enableSpeakers: true
}, {
    enableScreen: true,
    enableMicrophone: true,
    enableSpeakers: true
}, {
    enableTabCaptureAPI: true
}, {
    enableTabCaptureAPI: true,
    enableTabCaptureAPIAudioOnly: true
}, {
    enableScreen: true,
    enableCamera: true
}, {
    enableMicrophone: true,
    enableCamera: true
}, {
    enableMicrophone: true,
    enableSpeakers: true
}, {
    enableMicrophone: true
}, {
    enableSpeakers: true
}];
```

### API Explanation

1. First step is to initialize the constructor `new RecordRTC_Extension()`.
2. Second step is, pass two parameters on `startRecording`. First paramter is named as `recording-formats` and last parameter is named as `recording-start-callback`.
3. Manually stop the recording using `stopRecording` method. Callback contains two arguments. First argument is `Blob` object and second argument is `error` string.

## License

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT license](https://github.com/muaz-khan/Chrome-Extensions/blob/master/LICENSE) . Copyright (c) [Muaz Khan](https://MuazKhan.com).
