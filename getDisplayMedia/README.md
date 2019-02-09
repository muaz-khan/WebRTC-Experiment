# getDisplayMedia demo

* https://www.webrtc-experiment.com/getDisplayMedia/

# How to use?

```javascript
var displayMediaStreamConstraints = {
    video: true // currently you need to set {true} on Chrome
};

if (navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia(displayMediaStreamConstraints).then(success).catch(error);
} else {
    navigator.getDisplayMedia(displayMediaStreamConstraints).then(success).catch(error);
}
```

# Edge

```javascript
var displayMediaStreamConstraints = {
    video: {
        width: screen.width,
        height: screen.height,
        displaySurface: 'monitor', // monitor or window or application or browser
        logicalSurface: true,
        frameRate: 30,
        aspectRatio: 1.77,
        cursor: 'always', // always or never or motion
    }
};

if (navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia(displayMediaStreamConstraints).then(success).catch(error);
} else {
    navigator.getDisplayMedia(displayMediaStreamConstraints).then(success).catch(error);
}
```

# cursor

`cursor` accepts three values:

1. always
2. never
3. motion

# displaySurface

`displaySurface` accepts four values:

1. monitor
2. window
3. application
4. browser

# logicalSurface

`logicalSurface` accepts boolean `true` or `false` values.

# Spec

* https://w3c.github.io/mediacapture-screen-share/

# Disclaimer

There is no warranty, expressed or implied, associated with this product. Use at your own risk.

* https://www.webrtc-experiment.com/disclaimer/

# License

All [WebRTC Experiments](https://github.com/muaz-khan/WebRTC-Experiment) are released under [MIT license](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/LICENSE) . Copyright (c) [Muaz Khan](https://muazkhan.com/).

