# [Screen-Capturing.js](https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js) / [Demo](https://www.webrtc-experiment.com/Screen-Capturing/)

> Screen-Capturing.js can be used in any demo/project/library.

> It provides simple methods to integrate "Screen-Capturing" extension

> in your own applications.

>
> It means that you don't need to use [iframe-hack](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js).

## How to Install/Deploy Chrome Extension?

You can download chrome extension's full source-code from <a href="https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture">this link</a> and then you need to modify "manifest.json" to add your domain name (DNS) and last step is  simply <a href="https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture#how-to-publish-yourself">make ZIP</a> which should be <a href="https://developer.chrome.com/webstore/publish">deployed to Google AppStore</a>.<br><br> Though, you always having options to make CRX file or directly link the directory in developer mode however Google AppStore is preferred option.<br><br>
Then you can use <a href="https://cdn.webrtc-experiment.com/Screen-Capturing.js">this JavaScript file</a>  in your own  project/demo/library and enjoy fast/direct capturing of the selected content's frames.<br><br>

1. <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk">Google AppStore deployed extension</a>
2. <a href="https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture">Source code of the extension</a>
3. <a href="https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js">Source code of Screen-Capturing.js</a>

## How to use Screen-Capturing.js?

```javascript
// cdn.webrtc-experiment.com/Screen-Capturing.js

// advance users can directly use "getSourceId" method
getSourceId(function(sourceId) {
    if(sourceId != 'PermissionDeniedError') {
        // your code here
    }
});

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

// if you want to check if chrome extension is installed and enabled
isChromeExtensionAvailable(function(isAvailable) {
    if(!isAvailable) alert('Chrome extension is either not installed or disabled.');
});

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

## If I don't want to deploy to Google AppStore?

You can try <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js">getScreenId.js</a> which simply uses an iframe-hack to  fetch "sourceId" from "www.webrtc-experiment.com" domain. Simply link the library, and use it without any single installation!

## Credits

[Muaz Khan](https://github.com/muaz-khan):

1. Personal Webpage: http://www.muazkhan.com
2. Email: muazkh@gmail.com
3. Twitter: https://twitter.com/muazkh and https://twitter.com/WebRTCWeb
4. Google+: https://plus.google.com/+WebRTC-Experiment
5. Facebook: https://www.facebook.com/WebRTC

## License

[Screen-Capturing.js](https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
