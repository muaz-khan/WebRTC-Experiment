<h1>
    <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js">getScreenId.js</a>: Use <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk">single chrome extension</a> for all domains!
</h1>

Simply use <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js">getScreenId.js</a> and enjoy screen capturing from any domain. You don't need to deploy chrome extension yourself. You can refer your users to install <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk">this chrome extension</a> instead. Also, <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js">getScreenId.js</a> auto-fallbacks to command-line based screen capturing if chrome extension isn't installed or disabled. <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js">getScreenId.js</a> throws clear exceptions which is helpful for end-user experiences.

Demo: https://www.webrtc-experiment.com/getScreenId/

**Firefox?** [Install Firefox Extension](https://www.webrtc-experiment.com/store/firefox-extension/enable-screen-capturing.xpi) / [Source Code](https://github.com/muaz-khan/Firefox-Extensions/tree/master/enable-screen-capturing)

=

### Browser Support: Both Firefox and Chrome

=

<h2>
    How to use <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js" target="_blank">getScreenId.js</a>?
</h2>

```html
<script src="//cdn.WebRTC-Experiment.com/getScreenId.js"></script>
```

```javascript
getScreenId(function (error, sourceId, screen_constraints) {
    // error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
    // sourceId == null || 'string' || 'firefox'

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(screen_constraints, function (stream) {
        document.querySelector('video').src = URL.createObjectURL(stream);
    }, function (error) {
        console.error(error);
    });
});
```

Or...

```javascript
getScreenId(function (error, sourceId, screen_constraints) {
    // error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
    // sourceId == null || 'string' || 'firefox'
    
    if(sourceId && sourceId != 'firefox') {
        screen_constraints = {
            video: {
                mandatory: {
                    chromeMediaSource: 'screen',
                    maxWidth: 1920,
                    maxHeight: 1080,
                    minAspectRatio: 1.77
                }
            }
        };

        if (error === 'permission-denied') return alert('Permission is denied.');
        if (error === 'not-chrome') return alert('Please use chrome.');

        if (!error && sourceId) {
            screen_constraints.video.mandatory.chromeMediaSource = 'desktop';
            screen_constraints.video.mandatory.chromeMediaSourceId = sourceId;
        }
    }

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(screen_constraints, function (stream) {
        document.querySelector('video').src = URL.createObjectURL(stream);
    }, function (error) {
        console.error(error);
    });
});
```

=

##### License

[getScreenId.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
