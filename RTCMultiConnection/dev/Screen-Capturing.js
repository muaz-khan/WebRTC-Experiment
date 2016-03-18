// Last time updated at Dec 01, 2015, 08:32:23

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

    if (isFirefox) return isFirefoxExtensionAvailable(callback);

    if (chromeMediaSource == 'desktop') return callback(true);

    // ask extension if it is available
    window.postMessage('are-you-there', '*');

    setTimeout(function() {
        if (chromeMediaSource == 'screen') {
            callback(false);
        } else callback(true);
    }, 2000);
}

function isFirefoxExtensionAvailable(callback) {
    if (!callback) return;

    if (!isFirefox) return isChromeExtensionAvailable(callback);

    var isFirefoxAddonResponded = false;

    function messageCallback(event) {
        var addonMessage = event.data;

        if (!addonMessage || typeof addonMessage.isScreenCapturingEnabled === 'undefined') return;

        isFirefoxAddonResponded = true;

        if (addonMessage.isScreenCapturingEnabled === true) {
            callback(true);
        } else {
            callback(false);
        }

        window.removeEventListener("message", messageCallback, false);
    }

    window.addEventListener("message", messageCallback, false);

    window.postMessage({
        checkIfScreenCapturingEnabled: true,
        domains: [document.domain]
    }, "*");

    setTimeout(function() {
        if (!isFirefoxAddonResponded) {
            callback(true); // can be old firefox extension
        }
    }, 2000); // wait 2-seconds-- todo: is this enough limit?
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
    if (arguments.length != 2) {
        callback = extensionid;
        extensionid = 'ajhifddimkapgcifgcodmmfdlknahffk'; // default extension-id
    }

    if (isFirefox) return callback('not-chrome');

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
        mediaSource: 'window',
        width: 29999,
        height: 8640
    };

    if (isFirefox) return callback(null, firefoxScreenConstraints);

    getChromeExtensionStatus(function(status) {
        isChromeExtensionAvailable(function(isAvailable) {
            // this statement defines getUserMedia constraints
            // that will be used to capture content of screen
            var screen_constraints = {
                mandatory: {
                    chromeMediaSource: chromeMediaSource,
                    maxWidth: 29999,
                    maxHeight: 8640,
                    minFrameRate: 30,
                    maxFrameRate: 128,
                    minAspectRatio: 1.77, // 2.39
                    googLeakyBucket: true
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
        })
    });
}
