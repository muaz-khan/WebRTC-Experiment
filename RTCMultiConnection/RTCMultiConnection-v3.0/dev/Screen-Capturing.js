// Last time updated at Sep 23, 2014, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/Screen-Capturing.js

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js
// Demo          - https://www.webrtc-experiment.com/Screen-Capturing/

// ___________________
// Screen-Capturing.js

// Source code: https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture
// Google AppStore installation path: https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

// This JavaScript file is aimed to explain steps needed to integrate above chrome extension
// in your own webpages

// Usage:
// getScreenConstraints(function(screen_constraints) {
//    navigator.webkitGetUserMedia({ video: screen_constraints }, onSuccess, onFailure );
// });

// First Step: Download the extension, modify "manifest.json" and publish to Google AppStore
//             https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture#how-to-publish-yourself

// Second Step: Listen for postMessage handler
// postMessage is used to exchange "sourceId" between chrome extension and you webpage.
// though, there are tons other options as well, e.g. XHR-signaling, websockets, etc.
window.addEventListener('message', function(event) {
    if (event.origin != window.location.origin) {
        return;
    }

    onMessageCallback(event.data);
});

// and the function that handles received messages

function onMessageCallback(data) {
    // "cancel" button is clicked
    if (data == 'PermissionDeniedError') {
        chromeMediaSource = 'PermissionDeniedError';
        if (screenCallback) return screenCallback('PermissionDeniedError');
        else throw new Error('PermissionDeniedError');
    }

    // extension notified his presence
    if (data == 'rtcmulticonnection-extension-loaded') {
        chromeMediaSource = 'desktop';
    }

    // extension shared temp sourceId
    if (data.sourceId && screenCallback) {
        screenCallback(sourceId = data.sourceId);
    }
}

// global variables
var chromeMediaSource = 'screen';
var sourceId;
var screenCallback;

// this method can be used to check if chrome extension is installed & enabled.
function isChromeExtensionAvailable(callback) {
    if (!callback) return;

    if (chromeMediaSource == 'desktop') return callback(true);

    // ask extension if it is available
    window.postMessage('are-you-there', '*');

    setTimeout(function() {
        if (chromeMediaSource == 'screen') {
            callback(false);
        } else callback(true);
    }, 2000);
}

// this function can be used to get "source-id" from the extension
function getSourceId(callback) {
    if (!callback) throw '"callback" parameter is mandatory.';
    if (sourceId) {
        callback(sourceId);
        sourceId = null;
        return;
    }

    screenCallback = callback;
    window.postMessage('get-sourceId', '*');
}

var isFirefox = typeof window.InstallTrigger !== 'undefined';
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isChrome = !!window.chrome && !isOpera;

function getChromeExtensionStatus(extensionid, callback) {
    if (isFirefox) return callback('not-chrome');

    if (arguments.length != 2) {
        callback = extensionid;
        extensionid = 'ajhifddimkapgcifgcodmmfdlknahffk'; // default extension-id
    }

    var image = document.createElement('img');
    image.src = 'chrome-extension://' + extensionid + '/icon.png';
    image.onload = function() {
        chromeMediaSource = 'screen';
        window.postMessage('are-you-there', '*');
        setTimeout(function() {
            if (chromeMediaSource == 'screen') {
                callback(extensionid == extensionid ? 'installed-enabled' : 'installed-disabled');
            } else callback('installed-enabled');
        }, 2000);
    };
    image.onerror = function() {
        callback('not-installed');
    };
}

// this function explains how to use above methods/objects
function getScreenConstraints(callback) {
    var firefoxScreenConstraints = {
        mozMediaSource: 'window',
        mediaSource: 'window'
    };

    if (isFirefox) return callback(null, firefoxScreenConstraints);

    // this statement defines getUserMedia constraints
    // that will be used to capture content of screen
    var screen_constraints = {
        mandatory: {
            chromeMediaSource: chromeMediaSource,
            maxWidth: screen.width > 1920 ? screen.width : 1920,
            maxHeight: screen.height > 1080 ? screen.height : 1080,
            minFrameRate: 30,
            maxFrameRate: 64,
            minAspectRatio: 1.77,
            googLeakyBucket: true,
            googTemporalLayeredScreencast: true
        },
        optional: []
    };

    // this statement verifies chrome extension availability
    // if installed and available then it will invoke extension API
    // otherwise it will fallback to command-line based screen capturing API
    if (chromeMediaSource == 'desktop' && !sourceId) {
        getSourceId(function() {
            screen_constraints.mandatory.chromeMediaSourceId = sourceId;
            callback(sourceId == 'PermissionDeniedError' ? sourceId : null, screen_constraints);
            sourceId = null;
        });
        return;
    }

    // this statement sets gets 'sourceId" and sets "chromeMediaSourceId" 
    if (chromeMediaSource == 'desktop') {
        screen_constraints.mandatory.chromeMediaSourceId = sourceId;
    }

    // now invoking native getUserMedia API
    callback(null, screen_constraints);
}
