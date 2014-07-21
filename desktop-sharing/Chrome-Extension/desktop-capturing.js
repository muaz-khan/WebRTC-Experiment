// Muaz Khan          - https://github.com/muaz-khan
// MIT License        - https://www.WebRTC-Experiment.com/licence/
// ==============================================================
// webrtc-extension   - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/desktop-sharing

// this page is using desktopCapture API to capture and share desktop
// http://developer.chrome.com/extensions/desktopCapture.html

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
                chrome.desktopCapture.cancelChooseDesktopMedia(parseInt(localStorage['desktop-media-request-id']));
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
    
    function captureDesktop() {
        var desktop_id = chrome.desktopCapture.chooseDesktopMedia(
            ["screen", "window"], onAccessApproved);
            
        localStorage.setItem('desktop-media-request-id', desktop_id);
    }

    function onAccessApproved(chromeMediaSourceId) {
        if (!chromeMediaSourceId) {
            alert('Desktop Capture access is rejected.');
            return;
        }

        navigator.webkitGetUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: chromeMediaSourceId,
                    minWidth: 1280,
                    minHeight: 720,
                    
                    maxWidth: 1920,
                    maxHeight: 1080,
                    
                    minAspectRatio: 1.77
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
        }

        function getUserMediaError(e) {
            alert('getUserMediaError: ' + JSON.stringify(e, null, '---'));
        }
    }

    // RTCMultiConnection - www.RTCMultiConnection.org
    var connection;

    function setupRTCMultiConnection(stream) {
        // #174, thanks @alberttsai for pointing out this issue!
        // chrome.tabs.create({ url: chrome.extension.getURL('_generated_background_page.html') });

        // www.RTCMultiConnection.org/docs/
        connection = new RTCMultiConnection();
        
        connection.channel = connection.token();
        
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

        // www.rtcmulticonnection.org/docs/sdpConstraints/
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        };

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

        var domain = 'https://www.webrtc-experiment.com';
        var resultingURL = domain + '/desktop-sharing/?userid=' + connection.userid + '&sessionid=' + connection.channel;
        chrome.tabs.create({
            url: resultingURL
        });
    }

    // using websockets for signaling

    var webSocketURI = 'wss://wsnodejs.nodejitsu.com:443';
    function openSignalingChannel(config) {
        config.channel = config.channel || this.channel;
        var websocket = new WebSocket(webSocketURI);
        websocket.onopen = function() {
            websocket.push(JSON.stringify({
                open: true,
                channel: config.channel
            }));
            if (config.callback) config.callback(websocket);
            console.log('WebSocket connection is opened!');
        };
        websocket.onerror = function() {
            console.error('Unable to connect to ' + webSocketURI);
            if(connection.stats.numberOfConnectedUsers == 0) {
                chrome.runtime.reload();
            }
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
