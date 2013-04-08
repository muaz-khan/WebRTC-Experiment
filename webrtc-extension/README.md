#### Tab Sharing using tabCapture APIs / [Download ZIP](http://code.google.com/p/muazkh/downloads/list)

Sharing tab using chrome **experimental tabCapture APIs**; broadcasting over many peers.

#### [You can view broadcasted tabs here](https://webrtc-experiment.appspot.com/screen-broadcast/)

You can also view broadcasted tab using Firefox nightly, aurora, and 18+stable! It is cross-browser!

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

#### How to use your own socket.io implementation?

This tab sharing experiment is using socket.io implementation over pubnub.

1. broadcast.js — see in [tabCapture extension](http://code.google.com/p/muazkh/downloads/list)
2. screen-viewer.js — see in [screen-broadcast](https://webrtc-experiment.appspot.com/screen-broadcast/)

##### broadcast.js — Line 181

At line `181`, you can see `openSocket` method:

```javascript
openSocket: function(config) {
    var socket = io.connect('https://pubsub.pubnub.com/webrtc-rtcweb', {
        publish_key: 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0',
        subscribe_key: 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a',
        channel: config.channel || 'webrtc-tab-sharing',
        ssl: true
    });
    config.onopen && socket.on('connect', config.onopen);
    config.onmessage && socket.on('message', config.onmessage);
    return socket;
}
```

##### screen-viewer.js — Line 185

At line `185`, you can see **same** `openSocket` method:

```javascript
openSocket: function(config) {
    var socket = io.connect('https://pubsub.pubnub.com/webrtc-rtcweb', {
        publish_key: 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0',
        subscribe_key: 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a',
        channel: config.channel || 'webrtc-tab-sharing',
        ssl: true
    });
    config.onopen && socket.on('connect', config.onopen);
    config.onmessage && socket.on('message', config.onmessage);
    return socket;
}
```

##### To use your own socket.io implementation...

Replace `openSocket` method's code in **both files** with:

```javascript
openSocket: function (config) {
    var socket = io.connect('http://your-site:8888');
    socket.channel = config.channel || 'webrtc-tab-sharing';
    socket.on('message', config.onmessage);
		
    socket.send = function (data) {
        socket.emit('message', data);
    };

    if (config.onopen) setTimeout(config.onopen, 1);
    return socket;
}
```

Now, **your own socket.io will be used for signaling!**

##### Keep in mind....

Keep in mind that you **must** link appropriate `socket.io.js` file.

#### Is it possible to share full screen using tabCapture APIs?

Maybe. It seems that [CaptureInfo](http://developer.chrome.com/dev/extensions/tabCapture.html#type-CaptureInfo) object has `fullscreen` boolean parameter which let us know whether **an element in the tab being captured is in fullscreen mode**.

We can pass four properties as [CaptureOptions](http://developer.chrome.com/dev/extensions/tabCapture.html#type-CaptureOptions) object:

1. `audio` — boolean
2. `video` — boolean
3. `audioConstraints` — [MediaStreamConstraint](http://developer.chrome.com/dev/extensions/tabCapture.html#type-MediaStreamConstraint)
4. `videoConstraints` — [MediaStreamConstraint](http://developer.chrome.com/dev/extensions/tabCapture.html#type-MediaStreamConstraint)

`videoConstraints` is used to capture tab in this experiment:

```javascript
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
```

Well, it is suggested to try **fullscreen mode** yourself. Maybe it work!

#### Browser support of tabCapture APIs

From April, 2013:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

#### List of browsers that can view broadcasted tab

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

#### Plugin-free screen sharing

There is a plugin-free screen sharing experiment too! [Try it Now!](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html)

#### License

[TabCapture Extension](http://code.google.com/p/muazkh/downloads/list) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
