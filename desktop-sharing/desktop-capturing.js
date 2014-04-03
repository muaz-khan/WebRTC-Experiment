// Muaz Khan          - https://github.com/muaz-khan
// MIT License        - https://www.WebRTC-Experiment.com/licence/
// ==============================================================
// webrtc-extension   - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/desktop-sharing

// this page is using desktopCapture API to capture and share desktop
// http://developer.chrome.com/extensions/desktopCapture.html
// Availability:	Beta/Dev and Canary channels only.

console.log('WebRTC Experiments: https://www.webrtc-experiment.com/');

var contextMenuID = '4353455656';

chrome.contextMenus.create({
    title: 'Share Desktop!',
    id: contextMenuID
}, contextMenuSuccessCallback);

function contextMenuSuccessCallback() {
    chrome.contextMenus.onClicked.addListener(toggle);
    chrome.browserAction.onClicked.addListener(toggle);

    function toggle() {
        if (!localStorage.getItem('desktop-sharing') && !localStorage.getItem('desktop-media-request-id')) {
            localStorage.setItem('desktop-sharing', true);
            captureDesktop();

            chrome.contextMenus.update(contextMenuID, {
                title: 'Stop sharing Desktop.'
            });

            console.log('Desktop sharing started...');
        } else {
            if (connection) {
                // www.RTCMultiConnection.org/docs/close/
                connection.close();
            }

            if (localStorage['desktop-media-request-id']) {
                // chrome.desktopCapture.cancelChooseDesktopMedia(parseInt(localStorage['desktop-media-request-id']));
            }

            localStorage.removeItem('desktop-sharing');
            localStorage.removeItem('desktop-media-request-id');

            chrome.browserAction.setIcon({
                path: 'images/desktopCapture22.png'
            });

            chrome.contextMenus.update(contextMenuID, {
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
            alert('Desktop Capture access rejected.');
            return;
        }

        localStorage.setItem('desktop-media-request-id', pre_desktop_id);

        navigator.webkitGetUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: desktop_id,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        }, gotStream, getUserMediaError);

        function gotStream(stream) {
            if (!stream) {
                alert('Unable to capture Desktop. Note that Chrome internal pages cannot be captured.');
                return;
            }

            setupRTCMultiConnection(stream);
            chrome.browserAction.setIcon({
                path: 'images/pause22.png'
            });

            stream.onended = function() {
                if (!localStorage.getItem('desktop-sharing')) {
                    toggle();
                }
            };
        }

        function getUserMediaError(e) {
            alert('getUserMediaError: ' + JSON.stringify(e, null, '---'));
        }
    }

    // RTCMultiConnection - www.RTCMultiConnection.org
    var connection;

    function setupRTCMultiConnection(stream) {
        // #174, thanks @alberttsai for pointing out this issue!
        chrome.tabs.create({ url: chrome.extension.getURL('_generated_background_page.html') });

        var token = new RTCMultiConnection().token();

        // www.RTCMultiConnection.org/docs/
        connection = new RTCMultiConnection(token);
        
        connection.autoReDialOnFailure = true;

        // www.RTCMultiConnection.org/docs/bandwidth/
        connection.bandwidth = {
            video: 300 // 300kbps
        };

        // www.RTCMultiConnection.org/docs/session/
        connection.session = {
            video: true,
            oneway: true
        };

        connection.sdpConstraints.OfferToReceiveAudio = false;

        // www.RTCMultiConnection.org/docs/openSignalingChannel/
        connection.openSignalingChannel = openSignalingChannel;

        // www.RTCMultiConnection.org/docs/dontAttachStream/
        connection.dontAttachStream = true;

        // www.RTCMultiConnection.org/docs/attachStreams/
        connection.attachStreams.push(stream);

        // www.RTCMultiConnection.org/docs/open/
        var sessionDescription = connection.open({
            dontTransmit: true
        });

        var url = 'https://www.webrtc-experiment.com/desktop-sharing/shared-desktops-viewer.html?sessionDescription=' + encodeURIComponent(JSON.stringify(sessionDescription));
        chrome.tabs.create({ url: url });
    }

    // using websockets for signaling

    function openSignalingChannel(config) {
        config.channel = config.channel || this.channel;
        var websocket = new WebSocket('wss://wsnodejs.nodejitsu.com:443');
        websocket.onopen = function() {
            websocket.push(JSON.stringify({
                open: true,
                channel: config.channel
            }));
            if (config.callback) config.callback(websocket);
            console.log('WebSocket connection is opened!');
        };
        websocket.onerror = function() {
            alert('Unable to connect to wss://wsnodejs.nodejitsu.com:443');
        };
        websocket.onmessage = function(event) {
            config.onmessage(JSON.parse(event.data));
        };
        websocket.push = websocket.send;
        websocket.send = function(data) {
            websocket.push(JSON.stringify({
                data: data,
                channel: config.channel
            }));
        };
    }
}
