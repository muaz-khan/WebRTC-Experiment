# Demo: https://www.webrtc-experiment.com/Screen-Capturing/

> Use this script to capture screen on your own domains.

# First Step, download and modify "desktopCapture" extension

* https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture

> Download + Modify + Publish desktopCapture extension yourselves.

# Second and Last Step, use `Screen-Capturing.js`

CDN link:

```html
<script src="https://cdn.webrtc-experiment.com/Screen-Capturing.js"></script>
```

Now call `getScreenConstraints` method:

```javascript
// otherwise, you can use a helper method
getScreenConstraints(function(error, screen_constraints) {
    if (error) {
        return alert(error);
    }

    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia({
        video: screen_constraints
    }, function(stream) {
        var video = document.querySelector('video');
        video.src = URL.createObjectURL(stream);
        video.play();
    }, function(error) {
        alert(JSON.stringify(error, null, '\t'));
    });
});
```

Otherwise call `getSourceId` method:

```javascript
// advance users can directly use "getSourceId" method
getSourceId(function(sourceId) {
    if(sourceId != 'PermissionDeniedError') {
        // your code here
    }
});
```

You can also use `isChromeExtensionAvailable` method:

```javascript
// if you want to check if chrome extension is installed and enabled
isChromeExtensionAvailable(function(isAvailable) {
    if(!isAvailable) alert('Chrome extension is either not installed or disabled.');
});
```

You can also use `getChromeExtensionStatus` method:

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

# How to Install/Deploy Chrome Extension?

You can download chrome extension's full source-code from <a href="https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture">this link</a> and then you need to modify "manifest.json" to add your domain name (DNS) and last step is  simply <a href="https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture#how-to-publish-yourself">make ZIP</a> which should be <a href="https://developer.chrome.com/webstore/publish">deployed to Google AppStore</a>.<br><br> Though, you always having options to make CRX file or directly link the directory in developer mode however Google AppStore is preferred option.<br><br>
Then you can use <a href="https://cdn.webrtc-experiment.com/Screen-Capturing.js">this JavaScript file</a>  in your own  project/demo/library and enjoy fast/direct capturing of the selected content's frames.<br><br>

1. <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk">Google AppStore deployed extension</a>
2. <a href="https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture">Source code of the extension</a>
3. <a href="https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js">Source code of Screen-Capturing.js</a>

----

# Do NOT Deploy Chrome Extension YourSelf!!!!

* https://github.com/muaz-khan/getScreenId

> getScreenId | Capture Screen on Any Domain! This script is a hack used to support single chrome extension usage on any HTTPs domain.

First step, install this chrome extension:

* https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

Now use `getScreenId.js` (on any HTTPs page):

```html
<script src="https://cdn.WebRTC-Experiment.com/getScreenId.js"></script>
<video controls autoplay></video>
<script>
getScreenId(function (error, sourceId, screen_constraints) {
    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(screen_constraints, function (stream) {
        document.querySelector('video').src = URL.createObjectURL(stream);
    }, function (error) {
        console.error(error);
    });
});
</script>
```

# License

[Screen-Capturing.js](https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
