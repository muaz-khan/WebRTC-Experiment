// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Source Code   - https://github.com/muaz-khan/Chrome-Extensions

// this page is using desktopCapture API to capture and share desktop
// http://developer.chrome.com/extensions/desktopCapture.html

chrome.browserAction.onClicked.addListener(captureDesktop);

window.addEventListener('offline', function() {
    if (!connection || !connection.attachStreams.length) return;

    setDefaults();
    chrome.runtime.reload();
}, false);

window.addEventListener('online', function() {
    if (!connection) return;

    setDefaults();
    chrome.runtime.reload();
}, false);

function captureDesktop() {
    if (connection && connection.attachStreams[0]) {
        setDefaults();
        connection.attachStreams[0].stop();
        return;
    }

    chrome.browserAction.setTitle({
        title: 'Capturing Desktop'
    });

    chrome.storage.sync.get(null, function(items) {
        var sources = ['window', 'screen'];
        var desktop_id = chrome.desktopCapture.chooseDesktopMedia(sources, onAccessApproved);
    });
}

var constraints;
var room_password = '';
var room_id = '';

function getAspectRatio(w, h) {
    function gcd (a, b) {
        return (b == 0) ? a : gcd (b, a%b);
    }
    var r = gcd (w, h);
    return (w/r) / (h/r);
}

function onAccessApproved(chromeMediaSourceId) {
    if (!chromeMediaSourceId) {
        setDefaults();
        chrome.windows.create({
            url: "data:text/html,<h1>User denied to share his screen.</h1>",
            type: 'popup',
            width: screen.width / 2,
            height: 170
        });
        return;
    }

    chrome.storage.sync.get(null, function(items) {
        var resolutions = {};

        if (items['room_password']) {
            room_password = items['room_password'];
        }

        if (items['room_id']) {
            room_id = items['room_id'];
        }

        var _resolutions = items['resolutions'];
        if (!_resolutions) {
            _resolutions = 'fit-screen';
            chrome.storage.sync.set({
                resolutions: 'fit-screen'
            }, function() {});
        }

        if (_resolutions === 'fit-screen') {
            // resolutions.maxWidth = screen.availWidth;
            // resolutions.maxHeight = screen.availHeight;

            resolutions.maxWidth = screen.width;
            resolutions.maxHeight = screen.height;
        }

        if (_resolutions === '4K') {
            resolutions.maxWidth = 3840;
            resolutions.maxHeight = 2160;
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

        if(_resolutions === '4K') {
            alert('"4K" resolutions is not stable in Chrome. Please try "fit-screen" instead.');
        }

        constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: chromeMediaSourceId,
                    maxWidth: resolutions.maxWidth,
                    maxHeight: resolutions.maxHeight,
                    minWidth: resolutions.minWidth,
                    minHeight: resolutions.minHeight,
                    minAspectRatio: getAspectRatio(resolutions.maxWidth, resolutions.maxHeight),
                    maxAspectRatio: getAspectRatio(resolutions.maxWidth, resolutions.maxHeight),
                    minFrameRate: 64,
                    maxFrameRate: 128
                },
                optional: []
            }
        };

        navigator.webkitGetUserMedia(constraints, gotStream, getUserMediaError);
    });
}

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

    stream.onended = function() {
        setDefaults();
        chrome.runtime.reload();
    };

    stream.getVideoTracks()[0].onended = stream.onended;

    function isMediaStreamActive() {
        if ('active' in stream) {
            if (!stream.active) {
                return false;
            }
        } else if ('ended' in stream) { // old hack
            if (stream.ended) {
                return false;
            }
        }
        return true;
    }

    // this method checks if media stream is stopped
    // or any track is ended.
    (function looper() {
        if (isMediaStreamActive() === false) {
            stream.onended();
            return;
        }

        setTimeout(looper, 1000); // check every second
    })();

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
            chrome.windows.remove(background_page_id);
        }, 3000);
    });

    setupRTCMultiConnection(stream);

    chrome.browserAction.setIcon({
        path: 'images/pause22.png'
    });
}

function getUserMediaError(e) {
    setDefaults();
    chrome.windows.create({
        url: "data:text/html,<h1>getUserMediaError: " + JSON.stringify(e, null, '<br>') + "</h1><br>Constraints used:<br><pre>" + JSON.stringify(constraints, null, '<br>') + '</pre>',
        type: 'popup',
        width: screen.width / 2,
        height: 170
    });
}

// RTCMultiConnection - www.RTCMultiConnection.org
var connection;
var popup_id;

function setBadgeText(text) {
    chrome.browserAction.setBadgeBackgroundColor({
        color: [255, 0, 0, 255]
    });

    chrome.browserAction.setBadgeText({
        text: text + ''
    });

    chrome.browserAction.setTitle({
        title: text + ' users are viewing your screen!'
    });
}

function setupRTCMultiConnection(stream) {
    // www.RTCMultiConnection.org/docs/
    connection = new RTCMultiConnection();

    connection.optionalArgument = {
        optional: [],
        mandatory: {}
    };

    connection.channel = connection.sessionid = connection.userid;

    if (room_id && room_id.length) {
        connection.channel = connection.sessionid = connection.userid = room_id;
    }

    connection.autoReDialOnFailure = true;
    connection.getExternalIceServers = false;

    connection.iceServers = IceServersHandler.getIceServers();

    function setBandwidth(sdp) {
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
        sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:10000\r\n');
        return sdp;
    }

    connection.processSdp = function(sdp) {
        return sdp;

        sdp = setBandwidth(sdp);
        sdp = BandwidthHandler.setVideoBitrates(sdp, {
            min: 300,
            max: 10000
        });
        // sdp = CodecsHandler.preferVP9(sdp);
        return sdp;
    };

    // www.RTCMultiConnection.org/docs/session/
    connection.session = {
        video: true,
        oneway: true
    };

    // www.rtcmulticonnection.org/docs/sdpConstraints/
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false,
        voiceActivityDetection: false,
        iceRestart: false
    };

    connection.onstream = connection.onstreamended = function(event) {
        try {
            event.mediaElement.pause();
            delete event.mediaElement;
        } catch (e) {}
    };

    // www.RTCMultiConnection.org/docs/dontCaptureUserMedia/
    connection.dontCaptureUserMedia = true;

    // www.RTCMultiConnection.org/docs/attachStreams/
    connection.attachStreams.push(stream);

    if (room_password && room_password.length) {
        connection.onRequest = function(request) {
            if (request.extra.password !== room_password) {
                connection.reject(request);
                chrome.windows.create({
                    url: "data:text/html,<h1>A user tried to join your room with invalid password. His request is rejected. He tried password: " + request.extra.password + " </h2>",
                    type: 'popup',
                    width: screen.width / 2,
                    height: 170
                });
                return;
            }

            connection.accept(request);
        };
    }

    // www.RTCMultiConnection.org/docs/openSignalingChannel/
    var onMessageCallbacks = {};
    var pub = 'pub-c-3c0fc243-9892-4858-aa38-1445e58b4ecb';
    var sub = 'sub-c-d0c386c6-7263-11e2-8b02-12313f022c90';

    WebSocket = PUBNUB.ws;
    var websocket = new WebSocket('wss://pubsub.pubnub.com/' + pub + '/' + sub + '/' + connection.channel);

    var text = '-';
    (function looper() {
        if (!connection) {
            setBadgeText('');
            return;
        }

        if (connection.isInitiator) {
            setBadgeText('0');
            return;
        }

        text += ' -';
        if (text.length > 6) {
            text = '-';
        }

        setBadgeText(text);
        setTimeout(looper, 500);
    })();

    var connectedUsers = 0;
    connection.ondisconnected = function() {
        connectedUsers--;
        setBadgeText(connectedUsers);
    };

    websocket.onmessage = function(e) {
        data = JSON.parse(e.data);

        if (data === 'received-your-screen') {
            connectedUsers++;
            setBadgeText(connectedUsers);
        }

        if (data.sender == connection.userid) return;

        if (onMessageCallbacks[data.channel]) {
            onMessageCallbacks[data.channel](data.message);
        };
    };

    websocket.push = websocket.send;
    websocket.send = function(data) {
        data.sender = connection.userid;
        websocket.push(JSON.stringify(data));
    };

    // overriding "openSignalingChannel" method
    connection.openSignalingChannel = function(config) {
        var channel = config.channel || this.channel;
        onMessageCallbacks[channel] = config.onmessage;

        if (config.onopen) setTimeout(config.onopen, 1000);

        // directly returning socket object using "return" statement
        return {
            send: function(message) {
                websocket.send({
                    sender: connection.userid,
                    channel: channel,
                    message: message
                });
            },
            channel: channel
        };
    };

    websocket.onerror = function() {
        if (!!connection && connection.attachStreams.length) {
            chrome.windows.create({
                url: "data:text/html,<h1>Failed connecting the WebSockets server. Please click screen icon to try again.</h1>",
                type: 'popup',
                width: screen.width / 2,
                height: 170
            });
        }

        setDefaults();
        chrome.runtime.reload();
    };

    websocket.onclose = function() {
        if (!!connection && connection.attachStreams.length) {
            chrome.windows.create({
                url: "data:text/html,<p style='font-size:25px;'><span style='color:red;'>Unable to reach the WebSockets server</span>. WebSockets is required/used to help opening media ports between your system and target users' systems (for p2p-streaming).<br><br>Please <span style='color:green;'>click screen icon</span> to share again.</p>",
                type: 'popup',
                width: screen.width / 2,
                height: 200
            });
        }

        setDefaults();
        chrome.runtime.reload();
    };

    websocket.onopen = function() {
        chrome.browserAction.enable();

        setBadgeText(0);

        console.info('WebSockets connection is opened.');

        // www.RTCMultiConnection.org/docs/open/
        var sessionDescription = connection.open({
            dontTransmit: true
        });

        var resultingURL = 'https://webrtcweb.com/screen?s=' + connection.sessionid;

        // resultingURL = 'http://localhost:9001/?s=' + connection.sessionid;

        if (room_password && room_password.length) {
            resultingURL += '&p=' + room_password;
        }

        var popup_width = 600;
        var popup_height = 170;

        chrome.windows.create({
            url: "data:text/html,<title>Unique Room URL</title><h1 style='text-align:center'>Copy following private URL:</h1><input type='text' value='" + resultingURL + "' style='text-align:center;width:100%;font-size:1.2em;'><p style='text-align:center'>You can share this private-session URI with fellows using email or social networks.</p>",
            type: 'popup',
            width: popup_width,
            height: popup_height,
            top: parseInt((screen.height / 2) - (popup_height / 2)),
            left: parseInt((screen.width / 2) - (popup_width / 2)),
            focused: true
        }, function(win) {
            popup_id = win.id;
        });
    };
}

function setDefaults() {
    if (connection) {
        connection.close();
        connection.attachStreams = [];
    }

    chrome.browserAction.setIcon({
        path: 'images/desktopCapture22.png'
    });

    if (popup_id) {
        try {
            chrome.windows.remove(popup_id);
        } catch (e) {}

        popup_id = null;
    }

    chrome.browserAction.setTitle({
        title: 'Share Desktop'
    });

    chrome.browserAction.setBadgeText({
        text: ''
    });
}

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == 'install') {
        chrome.tabs.create({
            url: 'chrome://extensions/?options=' + chrome.runtime.id
        });
    }
});
