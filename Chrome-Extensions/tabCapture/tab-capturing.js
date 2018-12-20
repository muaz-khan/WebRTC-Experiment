// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Source Code   - https://github.com/muaz-khan/Chrome-Extensions

chrome.browserAction.onClicked.addListener(function() {
    if (connection && connection.attachStreams[0]) {
        setDefaults();
        return;
    }

    chrome.browserAction.setTitle({
        title: 'Capturing Tab'
    });

    chrome.tabs.getSelected(null, function(tab) {
        captureTab();
    });
});

chrome.browserAction.setIcon({
    path: 'images/tabCapture22.png'
});

chrome.browserAction.setTitle({
    title: 'Share this tab!'
});

chrome.browserAction.setBadgeText({
    text: ''
});

var constraints;
var min_bandwidth = 0;
var max_bandwidth = 0;
var room_password = '';
var room_id = '';
var room_url_box = true;
var bandwidth = min_bandwidth;
var codecs = 'default'; // h264, vp8, vp9

function captureTab() {
    chrome.storage.sync.get(null, function(items) {
        var resolutions = {};

        if (items['min_bandwidth']) {
            // min_bandwidth = parseInt(items['min_bandwidth']);
            // bandwidth = min_bandwidth;
        }

        if (items['max_bandwidth']) {
            // max_bandwidth = parseInt(items['max_bandwidth']);
        }

        if (items['room_password']) {
            room_password = items['room_password'];
        }

        if (items['room_id']) {
            room_id = items['room_id'];
        }

        var _resolutions = items['resolutions'];
        if (!_resolutions) {
            resolutions = {
                maxWidth: innerWidth,
                maxHeight: innerHeight
            }

            chrome.storage.sync.set({
                resolutions: 'fit-screen'
            }, function() {});
        }

        if (_resolutions === 'fit-screen') {
            resolutions.maxWidth = innerWidth;
            resolutions.maxHeight = innerHeight;
        }

        if (_resolutions === '1080p') {
            resolutions.maxWidth = 1920;
            resolutions.maxHeight = 1080;
        }

        if (_resolutions === '720p') {
            resolutions.maxWidth = 1280;
            resolutions.maxHeight = 720;
        }

        if (_resolutions === '360p') {
            resolutions.maxWidth = 640;
            resolutions.maxHeight = 360;
        }

        constraints = {
            audio: true,
            video: true,
            audioConstraints: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    echoCancellation: true
                }
            },
            videoConstraints: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    maxWidth: resolutions.maxWidth,
                    maxHeight: resolutions.maxHeight,
                    minFrameRate: 30,
                    minAspectRatio: 1.77
                }
            }
        };

        chrome.tabCapture.capture(constraints, gotStream);
    });

    function gotStream(stream) {
        if (!stream) {
            setDefaults();
            chrome.windows.create({
                url: "data:text/html,<h1>Internal error occurred while capturing the screen.</h1>",
                type: 'popup',
                width: screen.width / 2,
                height: 170
            });
            return;
        }

        chrome.browserAction.setTitle({
            title: 'Connecting to WebSockets server.'
        });

        chrome.browserAction.disable();

        addStreamStopListener(stream, function() {
            setDefaults();
        });

        // as it is reported that if you drag chrome screen's status-bar
        // and scroll up/down the screen-viewer page.
        // chrome auto-stops the screen without firing any 'onended' event.
        // chrome also hides screen status bar.
        chrome.windows.create({
            url: chrome.extension.getURL('_generated_background_page.html'),
            type: 'popup',
            focused: false,
            width: 1,
            height: 1,
            top: parseInt(screen.height),
            left: parseInt(screen.width)
        }, function(win) {
            var background_page_id = win.id;

            setTimeout(function() {
                // chrome.windows.remove(background_page_id);
            }, 3000);
        });

        shareStreamUsingRTCMultiConnection(stream);

        chrome.browserAction.setIcon({
            path: 'images/pause22.png'
        });

        videoPlayer = document.createElement('video');
        videoPlayer.muted = true;
        videoPlayer.volume = 0;
        videoPlayer.autoplay = true;
        videoPlayer.srcObject = stream;
        videoPlayer.play();
    }
}

// RTCMultiConnection - www.RTCMultiConnection.org
var connection;
var popup_id;
var videoPlayer;

function setBadgeText(text) {
    /*
    chrome.browserAction.setBadgeBackgroundColor({
        color: [255, 0, 0, 255]
    });
    */

    chrome.browserAction.setBadgeText({
        text: text + ''
    });

    chrome.browserAction.setTitle({
        title: text + ' users are viewing your screen!'
    });
}

function setDefaults() {
    chrome.browserAction.setIcon({
        path: 'images/tabCapture22.png'
    });

    chrome.browserAction.setTitle({
        title: 'Share this tab!'
    });

    chrome.browserAction.setBadgeText({
        text: ''
    });

    if (connection) {
        try {
            connection.close();
            connection.closeSocket();
            connection.attachStreams.forEach(function(stream) {
                stream.getTracks().forEach(function(track) {
                    track.stop();
                });
            });
            connection.attachStreams = [];
        }
        catch(e) {}

        connection = null;
    }

    if(videoPlayer) {
        videoPlayer.srcObject = null;
        videoPlayer = null;
    }

    chrome.runtime.reload();
}

function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function() {
        callback();
        callback = function() {};
    }, false);
    stream.addEventListener('inactive', function() {
        callback();
        callback = function() {};
    }, false);
    stream.getTracks().forEach(function(track) {
        track.addEventListener('ended', function() {
            callback();
            callback = function() {};
        }, false);
        track.addEventListener('inactive', function() {
            callback();
            callback = function() {};
        }, false);
    });
}
