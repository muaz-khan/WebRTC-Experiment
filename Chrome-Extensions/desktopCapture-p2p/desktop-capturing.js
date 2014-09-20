// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Source Code   - https://github.com/muaz-khan/Chrome-Extensions

// this page is using desktopCapture API to capture and share desktop
// http://developer.chrome.com/extensions/desktopCapture.html

var contextMenuID = '4353455656';

chrome.contextMenus.create({
    title: 'Share Desktop!',
    id: contextMenuID
}, contextMenuSuccessCallback);

function contextMenuSuccessCallback() {
    chrome.contextMenus.onClicked.addListener(captureDesktop);
    chrome.browserAction.onClicked.addListener(captureDesktop);

    function captureDesktop() {
        if (connection && connection.attachStreams[0]) {
            connection.attachStreams[0].onended = function() {};
            connection.attachStreams[0].stop();
            setDefaults();
            return;
        }

        var desktop_id = chrome.desktopCapture.chooseDesktopMedia(
            ['screen', 'window'], function(chromeMediaSourceId) {
                onAccessApproved(chromeMediaSourceId);

                chrome.contextMenus.update(contextMenuID, {
                    title: 'Stop sharing Desktop'
                });

                console.log('Desktop sharing started...');
            });
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
                    maxWidth: screen.width > 1920 ? screen.width : 1920,
                    maxHeight: screen.height > 1080 ? screen.height : 1080
                }
            }
        }, gotStream, getUserMediaError);

        function gotStream(stream) {
            if (!stream) {
                alert('Unable to capture Desktop. Note that Chrome internal pages cannot be captured.');
                return;
            }

            stream.onended = function() {
                setDefaults();
                chrome.runtime.reload();
            };

            // as it is reported that if you drag chrome screen's status-bar
            // and scroll up/down the screen-viewer page.
            // chrome auto-stops the screen without firing any 'onended' event.
            // chrome also hides screen status bar.
            chrome.windows.create({
                url: chrome.extension.getURL('_generated_background_page.html'),
                type: 'popup',
                focused: false,
                width: 20,
                height: 20,
                top: screen.height * 2,
                left: screen.width * 2
            }, function(win) {
                background_page_id = win.id;
            });

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

    var background_page_id;

    var popup_id;

    function setupRTCMultiConnection(stream) {
        // www.RTCMultiConnection.org/docs/
        connection = new RTCMultiConnection();

        connection.channel = connection.sessionid = connection.userid;

        connection.autoReDialOnFailure = true;
        connection.getExternalIceServers = false;

        // www.RTCMultiConnection.org/docs/bandwidth/
        connection.bandwidth = {
            screen: 300 // 300kbps
        };

        // www.RTCMultiConnection.org/docs/session/
        connection.session = {
            screen: true,
            oneway: true
        };

        // www.rtcmulticonnection.org/docs/sdpConstraints/
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        };

        // www.RTCMultiConnection.org/docs/openSignalingChannel/
        connection.openSignalingChannel = openSignalingChannel;

        // www.RTCMultiConnection.org/docs/dontCaptureUserMedia/
        connection.dontCaptureUserMedia = true;

        // www.RTCMultiConnection.org/docs/attachStreams/
        connection.attachStreams.push(stream);

        // www.RTCMultiConnection.org/docs/open/
        var sessionDescription = connection.open({
            dontTransmit: true
        });

        var domain = 'https://www.webrtc-experiment.com';
        var resultingURL = domain + '/view/?sessionid=' + connection.sessionid;

        chrome.windows.create({
            url: "data:text/html,<h1>Copy Following Private URL:</h1><input type='text' value='" + resultingURL + "' style='width:100%;font-size:1.2em;'><br>You can share this private-session URI with fellows using email or social networks.",
            type: 'popup',
            width: screen.width / 2,
            height: 170
        }, function(win) {
            popup_id = win.id;
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
        };
        websocket.onerror = function() {
            chrome.runtime.reload();
            chrome.windows.create({
                url: "data:text/html,<h1>Unable to connect to " + webSocketURI + "</h1>",
                type: 'popup',
                width: screen.width / 3,
                height: 100
            });
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
    
    function setDefaults() {
        if (connection) {
            connection.close();
            connection.attachStreams = [];
        }
        
        chrome.browserAction.setIcon({
            path: 'images/desktopCapture22.png'
        });

        chrome.contextMenus.update(contextMenuID, {
            title: 'Share Desktop'
        });

        console.log('Desktop sharing stopped...');

        if (background_page_id) {
            chrome.windows.remove(background_page_id);
            background_page_id = null;
        }

        if (popup_id) {
            try {
                chrome.windows.remove(popup_id);
            } catch (e) {}

            popup_id = null;
        }
    }
}
