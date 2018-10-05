# Call getUserMedia on any HTTP website

This chrome extension allows you invoke getUserMedia on any HTTP domain. You can invoke getUserMedia for camera+microphone or screen or tabs.

# If disabled by chrome? Then please install using `chrome://extensions`

<a target="_blank" href="https://chrome.google.com/webstore/detail/getusermedia/nbnpcmljmiinldficickhdoaiblgkggc">![Try it now in CWS](https://raw.github.com/GoogleChrome/chrome-app-samples/master/tryitnowbutton.png "Click here to install this extension from the Chrome Web Store")</a>

* https://chrome.google.com/webstore/detail/getusermedia/nbnpcmljmiinldficickhdoaiblgkggc

<a target="_blank" href="https://chrome.google.com/webstore/detail/getusermedia/nbnpcmljmiinldficickhdoaiblgkggc"><img alt="Install getUserMedia Extension" src="https://webrtcweb.com/getUserMedia-Extension.png" title="Click here to install this sample from the Chrome Web Store" /></a>

### Try Following Demo After Installation

* http://webrtc.getforge.io/

Source code is available in the `./example/` directory.

### First Step, Check If Extension Installed

```javascript
if (typeof getUserMediaHttp === 'function') {
    alert('Yes. getUserMedia extension is installed & enabled.');
}
```

### Capture Camera+Microphone

```javascript
if (typeof getUserMediaHttp === 'function') {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    }).then(function(stream) {
        console.log('got stream', stream);
    }).catch(function(e) {
        console.error(e);
    });
}
```

### Capture Screen

```javascript
if (typeof getUserMediaHttp === 'function') {
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            mediaSource: 'screen',
            mdiaSourceTypes: ['screen']
        }
    }).then(function(stream) {
        console.log('got stream', stream);
    }).catch(function(e) {
        console.error(e);
    });
}
```

### Supported Constraints

All getUserMedia constraints are supported. E.g.

```javascript
if (typeof getUserMediaHttp === 'function') {
    navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: true
        },
        video: {
            width: {
                exact: 1920
            },
            height: {
                exact: 1080
            },
            frameRate: 32
        }
    }).then(function(stream) {
        console.log('got stream', stream);
    }).catch(function(e) {
        console.error(e);
    });
}
```

For screen capturing:

```javascript
if (typeof getUserMediaHttp === 'function') {
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            mediaSource: 'screen',
            mdiaSourceTypes: ['screen'],
            width: screen.width,
            height: screen.height,
            aspectRatio: 1.77,
            frameRate: 64
        }
    }).then(function(stream) {
        console.log('got stream', stream);
    }).catch(function(e) {
        console.error(e);
    });
}
```

### Special Constraints

These are custom constraints that are available only in this extension.

```javascript
mdiaSourceTypes: ['screen', 'window', 'tab', 'audio']
```

`mdiaSourceTypes` allows you choose between what type of screen you want to capture. E.g.

```javascript
var constraints = {
    mdiaSourceTypes: ['screen', 'audio'],
    mdiaSourceTypes: ['tab', 'audio'],
    mdiaSourceTypes: ['window', 'audio'],
    mdiaSourceTypes: ['screen'],
    mdiaSourceTypes: ['window'],
    mdiaSourceTypes: ['tab'],
}
```

# License

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
