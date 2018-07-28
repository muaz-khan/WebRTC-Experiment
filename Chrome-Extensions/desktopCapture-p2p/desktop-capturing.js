// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Source Code   - https://github.com/muaz-khan/Chrome-Extensions

// this page is using desktopCapture API to capture and share desktop
// http://developer.chrome.com/extensions/desktopCapture.html

// chrome.browserAction.onClicked.addListener(captureDesktop);

var runtimePort;

chrome.runtime.onConnect.addListener(function(port) {
    runtimePort = port;

    runtimePort.onMessage.addListener(function(message) {
        if (!message || !message.messageFromContentScript1234) {
            return;
        }

        if (message.startSharing || message.stopSharing) {
            captureDesktop();
            return;
        }
    });
});


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

        connection && connection.attachStreams.forEach(function(stream) {
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        });

        chrome.storage.sync.set({
            enableTabCaptureAPI: 'false',
            enableMicrophone: 'false',
            enableCamera: 'false',
            enableScreen: 'false',
            isSharingOn: 'false',
            enableSpeakers: 'false'
        });
        return;
    }

    chrome.browserAction.setTitle({
        title: 'Capturing Desktop'
    });

    desktop_id = null;
    constraints = null;
    room_password = '';
    room_id = '';
    codecs = 'default';
    bandwidth = null;

    enableTabCaptureAPI = null;
    enableMicrophone = null;
    enableSpeakers = null;
    enableCamera = null;
    enableScreen = null;
    isSharingOn = null;

    room_url_box = true;

    chrome.storage.sync.get(null, function(items) {
        var resolutions = {};

        if (items['room_password']) {
            room_password = items['room_password'];
        }

        if (items['room_id']) {
            room_id = items['room_id'];
        }

        if(items['room_url_box'] === 'false') {
            room_url_box = false;
        }

        if (items['codecs']) {
            codecs = items['codecs'];
        }

        if (items['bandwidth']) {
            bandwidth = items['bandwidth'];
        }

        if (items['enableTabCaptureAPI'] == 'true') {
            enableTabCaptureAPI = items['enableTabCaptureAPI'];
        }

        if (items['enableMicrophone'] == 'true') {
            enableMicrophone = items['enableMicrophone'];
        }

        if (items['enableSpeakers'] == 'true') {
            enableSpeakers = items['enableSpeakers'];
        }

        if (items['enableCamera'] == 'true') {
            enableCamera = items['enableCamera'];
        }

        if (items['enableScreen'] == 'true') {
            enableScreen = items['enableScreen'];
        }

        if (items['enableTabCaptureAPI'] == 'true') {
            enableTabCaptureAPI = items['enableTabCaptureAPI'];
        }

        if (items['isSharingOn'] == 'true') {
            isSharingOn = items['isSharingOn'];
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

        if (_resolutions === '4K') {
            alert('"4K" resolutions is not stable in Chrome. Please try "fit-screen" instead.');
        }

        var sources = ['screen', 'window', 'tab'];

        if (enableSpeakers) {
            sources.push('audio');
        }

        if (enableTabCaptureAPI) {
            captureTabUsingTabCapture(resolutions);
            return;
        }

        if (enableCamera || enableMicrophone) {
            captureCamera(function(stream) {
                if (!enableScreen) {
                    gotStream(stream);
                    return;
                }

                desktop_id = chrome.desktopCapture.chooseDesktopMedia(sources, function(chromeMediaSourceId, opts) {
                    opts = opts || {};
                    opts.resolutions = resolutions;
                    opts.stream = stream;
                    onAccessApproved(chromeMediaSourceId, opts);
                });
            });
            return;
        }

        desktop_id = chrome.desktopCapture.chooseDesktopMedia(sources, function(chromeMediaSourceId, opts) {
            opts = opts || {};
            opts.resolutions = resolutions;
            onAccessApproved(chromeMediaSourceId, opts);
        });
    });
}

function captureTabUsingTabCapture(resolutions) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(arrayOfTabs) {
        var activeTab = arrayOfTabs[0];
        var activeTabId = activeTab.id; // or do whatever you need

        var constraints = {
            video: true,
            videoConstraints: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    maxWidth: resolutions.maxWidth,
                    maxHeight: resolutions.maxHeight,
                    minWidth: resolutions.minWidth,
                    minHeight: resolutions.minHeight,
                    minAspectRatio: getAspectRatio(resolutions.maxWidth, resolutions.maxHeight),
                    maxAspectRatio: getAspectRatio(resolutions.maxWidth, resolutions.maxHeight),
                    minFrameRate: 64,
                    maxFrameRate: 128
                }
            }
        };

        if (!!enableSpeakers) {
            constraints.audio = true;
            constraints.audioConstraints = {
                mandatory: {
                    echoCancellation: true
                },
                optional: [{
                    googDisableLocalEcho: false // https://www.chromestatus.com/feature/5056629556903936
                }]
            };
        }

        // chrome.tabCapture.onStatusChanged.addListener(function(event) { /* event.status */ });

        chrome.tabCapture.capture(constraints, function(stream) {
            gotTabCaptureStream(stream, constraints);
        });
    });
}

function gotTabCaptureStream(stream, constraints) {
    if (!stream) {
        if (constraints.audio === true) {
            enableSpeakers = false;
            captureTabUsingTabCapture(resolutions);
            return;
        }
        return alert('still no tabCapture stream');
        chrome.runtime.reload();
        return;
    }

    var newStream = new MediaStream();

    stream.getTracks().forEach(function(track) {
        newStream.addTrack(track);
    });

    initVideoPlayer(newStream);

    gotStream(newStream);
}

var desktop_id;
var constraints;
var room_password = '';
var room_id = '';
var codecs = 'default';
var bandwidth;

var enableTabCaptureAPI;
var enableMicrophone;
var enableSpeakers;
var enableCamera;
var enableScreen;
var isSharingOn;

var room_url_box = true;

function getAspectRatio(w, h) {
    function gcd(a, b) {
        return (b == 0) ? a : gcd(b, a % b);
    }
    var r = gcd(w, h);
    return (w / r) / (h / r);
}

function onAccessApproved(chromeMediaSourceId, opts) {
    if (!chromeMediaSourceId) {
        setDefaults();
        return;
    }

    var resolutions = opts.resolutions;

    chrome.storage.sync.get(null, function(items) {
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

        if (opts.canRequestAudioTrack === true) {
            constraints.audio = {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: chromeMediaSourceId,
                    echoCancellation: true
                },
                optional: [{
                    googDisableLocalEcho: false // https://www.chromestatus.com/feature/5056629556903936
                }]
            };
        }

        navigator.webkitGetUserMedia(constraints, function(screenStream) {
            var win;
            addStreamStopListener(screenStream, function() {
                if (win && !win.closed) {
                    win.close();
                } else {
                    captureDesktop();
                }
            });

            if (opts.stream) {
                if (enableCamera && opts.stream.getVideoTracks().length) {
                    var cameraStream = opts.stream;

                    screenStream.fullcanvas = true;
                    screenStream.width = screen.width; // or 3840
                    screenStream.height = screen.height; // or 2160 

                    cameraStream.width = parseInt((15 / 100) * screenStream.width);
                    cameraStream.height = parseInt((15 / 100) * screenStream.height);
                    cameraStream.top = screenStream.height - cameraStream.height - 20;
                    cameraStream.left = screenStream.width - cameraStream.width - 20;

                    var mixer = new MultiStreamsMixer([screenStream, cameraStream]);

                    mixer.frameInterval = 1;
                    mixer.startDrawingFrames();

                    screenStream = mixer.getMixedStream();
                    // win = openVideoPreview(screenStream);
                } else if (enableMicrophone && opts.stream.getAudioTracks().length) {
                    var speakers = new MediaStream();
                    screenStream.getAudioTracks().forEach(function(track) {
                        speakers.addTrack(track);
                        screenStream.removeTrack(track);
                    });

                    var mixer = new MultiStreamsMixer([speakers, opts.stream]);
                    mixer.getMixedStream().getAudioTracks().forEach(function(track) {
                        screenStream.addTrack(track);
                    });

                    screenStream.getVideoTracks().forEach(function(track) {
                        track.onended = function() {
                            if (win && !win.closed) {
                                win.close();
                            } else {
                                captureDesktop();
                            }
                        };
                    })
                }
            }

            gotStream(screenStream);
        }, getUserMediaError);
    });
}

function openVideoPreview(stream) {
    // var win = window.open("video.html?src=" + URL.createObjectURL(stream), "_blank", "top=0,left=0");
    var win = window.open("video.html", "_blank", "top=0,left=0");
    var timer = setInterval(function() {
        if (win.closed) {
            clearInterval(timer);
            captureDesktop();
        }
    }, 1000);
    return win;
}

function addStreamStopListener(stream, callback) {
    var streamEndedEvent = 'ended';
    if ('oninactive' in stream) {
        streamEndedEvent = 'inactive';
    }
    stream.addEventListener(streamEndedEvent, function() {
        callback();
        callback = function() {};
    }, false);
    stream.getAudioTracks().forEach(function(track) {
        track.addEventListener(streamEndedEvent, function() {
            callback();
            callback = function() {};
        }, false);
    });
    stream.getVideoTracks().forEach(function(track) {
        track.addEventListener(streamEndedEvent, function() {
            callback();
            callback = function() {};
        }, false);
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

    addStreamStopListener(stream, function() {
        setDefaults();
        chrome.runtime.reload();
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
    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    connection.autoCloseEntireSession = true;

    connection.enableLogs = true;
    connection.session = {
        audio: true,
        video: true,
        oneway: true
    };

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

    function setBandwidth(sdp, value) {
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
        sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + value + '\r\n');
        return sdp;
    }

    connection.processSdp = function(sdp) {
        if (bandwidth) {
            try {
                bandwidth = parseInt(bandwidth);
            } catch (e) {
                bandwidth = null;
            }

            if (bandwidth && bandwidth != NaN && bandwidth != 'NaN' && typeof bandwidth == 'number') {
                sdp = setBandwidth(sdp, bandwidth);
                sdp = BandwidthHandler.setVideoBitrates(sdp, {
                    min: bandwidth,
                    max: bandwidth
                });
            }
        }

        if (!!codecs && codecs !== 'default') {
            sdp = CodecsHandler.preferCodec(sdp, codecs);
        }
        return sdp;
    };

    // www.rtcmulticonnection.org/docs/sdpConstraints/
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
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

    // www.RTCMultiConnection.org/docs/open/
    connection.socketCustomEvent = connection.sessionid;

    function roomOpenCallback() {
        chrome.browserAction.enable();
        setBadgeText(0);

        if(room_url_box === true) {
            var resultingURL = 'https://webrtcweb.com/screen?s=' + connection.sessionid;

            // resultingURL = 'http://localhost:9001/?s=' + connection.sessionid;

            if (room_password && room_password.length) {
                resultingURL += '&p=' + room_password;
            }

            if(bandwidth) {
                resultingURL += '&bandwidth=' + bandwidth;
            }
            if (!!codecs && codecs !== 'default') {
                resultingURL += '&codecs=' + codecs;
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
        }

        connection.socket.on(connection.socketCustomEvent, function(message) {
            if(message.receivedYourScreen) {
                setBadgeText(connection.isInitiator ? connection.getAllParticipants().length : '');
            }
        });
    }

    connection.password = null;
    if (room_password && room_password.length) {
        connection.password = room_password;
    }
    
    connection.open(connection.sessionid, roomOpenCallback);

    connection.onleave = connection.onPeerStateChanged = function() {
        setBadgeText(connection.isInitiator ? connection.getAllParticipants().length : '');
    };
}

function setDefaults() {
    if (connection) {
        connection.attachStreams.forEach(function(stream) {
            try {
                stream.getTracks().forEach(function(track){
                     try {
                        track.stop();
                     }
                     catch(e) {}
                });
            }
            catch(e) {}
        });

        try {
            connection.close();
        }
        catch(e) {}

        try {
            connection.closeSocket();
        }
        catch(e) {}

        connection = null;

        chrome.storage.sync.set({
            enableTabCaptureAPI: 'false',
            enableMicrophone: 'false',
            enableCamera: 'false',
            enableScreen: 'false',
            isSharingOn: 'false',
            enableSpeakers: 'false'
        });
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

var videoPlayers = [];

function initVideoPlayer(stream) {
    var videoPlayer = document.createElement('video');
    videoPlayer.muted = !enableTabCaptureAPI;
    videoPlayer.volume = !!enableTabCaptureAPI;
    videoPlayer.autoplay = true;
    videoPlayer.srcObject = stream;
    videoPlayers.push(videoPlayer);
}

var microphoneDevice = false;
var cameraDevice = false;

function captureCamera(callback) {
    var supported = navigator.mediaDevices.getSupportedConstraints();
    var constraints = {};

    if (enableCamera) {
        constraints.video = {
            width: {
                min: 640,
                ideal: 1920,
                max: 1920
            },
            height: {
                min: 400,
                ideal: 1080
            }
        };

        if (supported.aspectRatio) {
            constraints.video.aspectRatio = 1.777777778;
        }

        if (supported.frameRate) {
            constraints.video.frameRate = {
                ideal: 30
            };
        }

        if (cameraDevice && cameraDevice.length) {
            constraints.video.deviceId = cameraDevice;
        }
    }

    if (enableMicrophone) {
        constraints.audio = {};

        if (microphoneDevice && microphoneDevice.length) {
            constraints.audio.deviceId = microphoneDevice;
        }

        if (supported.echoCancellation) {
            constraints.audio.echoCancellation = true;
        }
    }

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        initVideoPlayer(stream);
        callback(stream);

        if (enableCamera && !enableScreen) {
            openVideoPreview(stream);
        }
    }).catch(function(error) {
        setDefaults();

        chrome.tabs.create({
            url: 'camera-mic.html'
        });
    });
}
