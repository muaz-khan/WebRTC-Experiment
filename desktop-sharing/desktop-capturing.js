// Muaz Khan          - https://github.com/muaz-khan
// MIT License        - https://www.WebRTC-Experiment.com/licence/
// ==============================================================
// webrtc-extension   - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/desktop-sharing

// this page is using desktopCapture API to capture and share desktop
// http://developer.chrome.com/extensions/desktopCapture.html
// Availability:	Beta and dev channels only.

console.log('View your shared screens here: https://www.webrtc-experiment.com/desktop-sharing/');

window.isStopBroadcasting = false;
chrome.browserAction.onClicked.addListener(toggle);

function toggle() {
    if (localStorage['broadcasting'] == undefined) {
        localStorage.setItem('broadcasting', true);
        window.isStopBroadcasting = false;
        captureDesktop();

        chrome.contextMenus.update('454656567', {
            title: 'Stop sharing Desktop.'
        });
        console.log('Desktop sharing started...');
    } else {
        if (connection) {
            // www.RTCMultiConnection.org/docs/close/
            connection.close();
        }
        
        localStorage.removeItem('broadcasting');
        window.isStopBroadcasting = true;

        chrome.browserAction.setIcon({
            path: 'images/desktopCapture22.png'
        });

        chrome.contextMenus.update('454656567', {
            title: 'Share Desktop!'
        });

        console.log('Desktop sharing stopped...');
        return;
    }
}

// this method captures Desktop stream

var pre_desktop_id;

function captureDesktop() {
    pre_desktop_id = chrome.desktopCapture.chooseDesktopMedia(
        ["screen", "window"], onAccessApproved);
}

function onAccessApproved(desktop_id) {
    if (!desktop_id) {
        console.error('Desktop Capture access rejected.');
        return;
    }

    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id
            }
        }
    }, gotStream, getUserMediaError);

    function gotStream(stream) {
        if (!stream) {
            console.error('Unable to capture Desktop. Note that Chrome internal pages cannot be captured.');
            return;
        }

        setupRTCMultiConnection(stream);
        chrome.browserAction.setIcon({
            path: 'images/pause22.png'
        });
    }

    function getUserMediaError(e) {
        console.error('getUserMediaError:', JSON.stringify(e, null, '---'));
    }
}

chrome.contextMenus.create({
    title: 'Share Desktop!',
    id: '454656567'
});
chrome.contextMenus.onClicked.addListener(toggle);

// RTCMultiConnection - www.RTCMultiConnection.org
var connection;

function setupRTCMultiConnection(stream) {
    // www.RTCMultiConnection.org/docs/
    connection = new RTCMultiConnection('webrtc-desktop-sharing');
    
    // www.RTCMultiConnection.org/docs/bandwidth/
    connection.bandwidth.video = false;
    
    // www.RTCMultiConnection.org/docs/session/
    connection.session = {
        video: true,
        oneway: true
    };
    
    // www.RTCMultiConnection.org/docs/openSignalingChannel/
    connection.openSignalingChannel = openSignalingChannel;
    
    // www.RTCMultiConnection.org/docs/dontAttachStream/
    connection.dontAttachStream = true;
    
    // www.RTCMultiConnection.org/docs/attachStreams/
    connection.attachStreams.push(stream);
    
    // www.RTCMultiConnection.org/docs/open/
    connection.open();
}

// using websockets for signaling

function openSignalingChannel(config) {
    config.channel = config.channel || this.channel;
    var websocket = new WebSocket('wss://www.webrtc-experiment.com:8563');
    websocket.onopen = function () {
        websocket.push(JSON.stringify({
            open: true,
            channel: config.channel
        }));
        if (config.callback) config.callback(websocket);
        console.log('WebSocket connection is opened!');
    };
    websocket.onerror = function() {
        console.error('Unable to connect to wss://www.webrtc-experiment.com:8563');
    };
    websocket.onmessage = function (event) {
        config.onmessage(JSON.parse(event.data));
    };
    websocket.push = websocket.send;
    websocket.send = function (data) {
        websocket.push(JSON.stringify({
            data: data,
            channel: config.channel
        }));
    };
}
