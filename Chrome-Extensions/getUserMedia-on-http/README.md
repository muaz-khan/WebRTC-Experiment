# DO NOT USE THIS

# PLEASE USE HTTPS

# NOT RECOMMENDED

# YOUR CHOICE; at YOUR own RISK

----

# Call getUserMedia on any HTTP website

This chrome extension allows you invoke getUserMedia on any HTTP domain. You can invoke getUserMedia for camera+microphone or screen or tabs.

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

## Disclaimer

No more maintaining this extension; as of 2019. So please use at your own risk.

* https://www.webrtc-experiment.com/disclaimer/

## License

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT license](https://github.com/muaz-khan/Chrome-Extensions/blob/master/LICENSE) . Copyright (c) [Muaz Khan](https://MuazKhan.com).
