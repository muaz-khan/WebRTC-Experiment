# Please use `getDisplayMedia` instead

```javascript
getScreenStream(function(screenStream) {
    video.srcObject = screenStream;
});

function getScreenStream(callback) {
    if (navigator.getDisplayMedia) {
        navigator.getDisplayMedia({
            video: true
        }).then(screenStream => {
            callback(screenStream);
        });
    } else if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({
            video: true
        }).then(screenStream => {
            callback(screenStream);
        });
    } else {
        getScreenId(function(error, sourceId, screen_constraints) {
            navigator.mediaDevices.getUserMedia(screen_constraints).then(function(screenStream) {
                callback(screenStream);
            });
        });
    }
}
```

## Disclaimer

No more maintaining this extension; as of 2019. So please use at your own risk.

* https://www.webrtc-experiment.com/disclaimer/

----

# Screen-Capturing.js / for [desktopCapture extension](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture)

* Demo: https://www.webrtc-experiment.com/Screen-Capturing/

[![npm](https://img.shields.io/npm/v/webrtc-screen-capturing.svg)](https://npmjs.org/package/webrtc-screen-capturing) [![downloads](https://img.shields.io/npm/dm/webrtc-screen-capturing.svg)](https://npmjs.org/package/webrtc-screen-capturing)

```sh
npm instll webrtc-screen-capturing

# node_modules/webrtc-screen-capturing/Screen-Capturing.js
```

# How to Use?

**First Step,** download and modify [desktopCapture extension](https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture)

Download + Modify + Publish desktopCapture extension yourselves. You need to change `matches` line the [manifest.json#L17](https://github.com/muaz-khan/Chrome-Extensions/blob/master/desktopCapture/manifest.json#L17) to refer your own domain.

**Second and last step,** now use `Screen-Capturing.js` script.

CDN link:

```html
<script src="https://cdn.webrtc-experiment.com/Screen-Capturing.js"></script>
<script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
```

```javascript
getScreenStream(function(screenStream) {
    video.srcObject = screenStream;
});

function getScreenStream(callback) {
    if (navigator.getDisplayMedia) {
        navigator.getDisplayMedia({
            video: true
        }).then(screenStream => {
            callback(screenStream);
        });
    } else if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({
            video: true
        }).then(screenStream => {
            callback(screenStream);
        });
    } else {
        getScreenConstraints(function(error, screen_constraints) {
            navigator.mediaDevices.getUserMedia(screen_constraints).then(function(screenStream) {
                callback(screenStream);
            });
        });
    }
}
```

# API

### `getScreenConstraints`

```javascript
getScreenConstraints(function(error, screen_constraints) {
    if (error) {
        return alert(error);
    }

    if(screen_constraints.canRequestAudioTrack) {
        // you can capture speakers
        // getUserMedia({audio:screen_constraints})
    }

    navigator.mediaDevices.getUserMedia({
        video: screen_constraints
    }).then(function(stream) {
        var video = document.querySelector('video');
        video.src = URL.createObjectURL(stream);
        video.play();
    }).catch(function(error) {
        alert(JSON.stringify(error, null, '\t'));
    });
});
```

### `getScreenConstraintsWithAudio`

This method includes system-audio i.e. speakers as well.

```javascript
getScreenConstraintsWithAudio(function(error, screen_constraints) {
    if (error) {
        return alert(error);
    }

    navigator.mediaDevices.getUserMedia({
        video: screen_constraints,
        audio: screen_constraints // ----------- pass this line as well
    }).then(function(stream) {
        var video = document.querySelector('video');
        video.src = URL.createObjectURL(stream);
        video.play();
    }).catch(function(error) {
        alert(JSON.stringify(error, null, '\t'));
    });
});
```

### `getSourceId`

```javascript
getSourceId(function(sourceId, canRequestAudioTrack) {
    if(sourceId != 'PermissionDeniedError') {
        // your code here
    }

    if(canRequestAudioTrack === true) {
        // system audio i.e. speakers are enabled
    }
});
```

### `getCustomSourceId`

Get your own custom source-id according to requested screen formats. Supported formats are:

* `window`
* `screen`
* `tab`
* `audio`

> Note: First parameter must be an array.

```javascript
var our_own_choices = ['tab', 'audio'];
getCustomSourceId(our_own_choices, function(sourceId, canRequestAudioTrack) {
    if(sourceId != 'PermissionDeniedError') {
        // your code here
    }

    if(canRequestAudioTrack === true) {
        // system audio i.e. speakers are enabled
    }
});
```

### `getSourceIdWithAudio`

This method includes system-audio i.e. speakers as well.

```javascript
getSourceIdWithAudio(function(sourceId, canRequestAudioTrack) {
    if(sourceId != 'PermissionDeniedError') {
        // your code here
    }

    if(canRequestAudioTrack === true) {
        // system audio i.e. speakers are enabled
    }
});
```

### `getChromeExtensionStatus`

```javascript
// instead of using "isChromeExtensionAvailable", you can use
// a little bit more reliable method: "getChromeExtensionStatus"
getChromeExtensionStatus('your-extension-id', function(status) {
    if(status == 'installed-enabled') {
        // chrome extension is installed & enabled.
    }
    
    if(status == 'installed-disabled') {
        // chrome extension is installed but disabled.
    }
    
    if(status == 'not-installed') {
        // chrome extension is not installed
    }
    
    if(status == 'not-chrome') {
        // using non-chrome browser
    }
});
```

### `isChromeExtensionAvailable`

```javascript
// if you want to check if chrome extension is installed and enabled
isChromeExtensionAvailable(function(isAvailable) {
    if(!isAvailable) alert('Chrome extension is either not installed or disabled.');
});
```

----

# Unable to capture screen multiple times?

Set `sourceId=null` and now call any method/API above. You will be able to capture screen again & again.

E.g.

```javascript
sourceId = null; // this line is important
getScreenConstraints(function(error, screen_constraints) {
    if (error) {
        return alert(error);
    }

    navigator.mediaDevices.getUserMedia({
        video: screen_constraints
    }).then(function(stream) {
        var video = document.querySelector('video');
        video.src = URL.createObjectURL(stream);
        video.play();
    }).catch(function(error) {
        alert(JSON.stringify(error, null, '\t'));
    });
});
```

----

# Use `getScreenId.js`!

* https://github.com/muaz-khan/getScreenId

> getScreenId | Capture Screen on Any Domain! This script is a hack used to support single chrome extension usage on any HTTPs domain.

First step, install this chrome extension:

* https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

Now use `getScreenId.js` (on any HTTPs page):

```html
<script src="https://cdn.WebRTC-Experiment.com/getScreenId.js"></script>
<script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
<video controls autoplay></video>
<script>
getScreenId(function (error, sourceId, screen_constraints) {
    navigator.mediaDevices.getUserMedia(screen_constraints).then(function (stream) {
        document.querySelector('video').src = URL.createObjectURL(stream);
    }).catch(function (error) {
        console.error(error);
    });
});
</script>
```

## License

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT license](https://github.com/muaz-khan/Chrome-Extensions/blob/master/LICENSE) . Copyright (c) [Muaz Khan](https://MuazKhan.com).
