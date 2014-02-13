// Muaz Khan          - https://github.com/muaz-khan
// MIT License        - https://www.WebRTC-Experiment.com/licence/
// ==============================================================
// webrtc-extension   - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/tabCapture

window.isSharingTab = false;
chrome.browserAction.onClicked.addListener(toggle);

chrome.tabCapture.onStatusChanged.addListener(function(arg) {
    console.log(JSON.stringify(arg, null, '\t'));
});

function toggle() {
    if (localStorage['broadcasting'] == undefined) {
        localStorage.setItem('broadcasting', true);
        window.isSharingTab = false;
        captureTab();

        chrome.contextMenus.update('000007', {
            title: 'Stop sharing this tab.'
        });
        console.log('Tab sharing started...');
    } else {
        // http://www.rtcmulticonnection.org/docs/close/
        if(connection) connection.close();
        
        localStorage.removeItem('broadcasting');
        window.isSharingTab = true;

        chrome.browserAction.setIcon({ path: 'images/tabCapture22.png' });

        chrome.contextMenus.update('000007', {
            title: 'Share this tab!'
        });

        console.log('Tab sharing stopped...');
        return;
    }
}

// this method captures tab stream

function captureTab() {
    chrome.tabs.getSelected(null, function(tab) {
        var MediaStreamConstraint = {
            audio: false,
            video: true,
            videoConstraints: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    minWidth: 1920,
                    maxWidth: 1920,
                    minHeight: 1080,
                    maxHeight: 1080
                }
            }
        };

        function callback(stream) {
            if (!stream) {
                console.error('Unable to capture the tab. Note that Chrome internal pages cannot be captured.');
                return;
            }

            setupRTCMultiConnection(stream);
        }

        chrome.tabCapture.capture(MediaStreamConstraint, callback);
    });
    chrome.browserAction.setIcon({ path: 'images/pause22.png' });
}

chrome.contextMenus.create({
    title: 'Share this tab!',
    id: '000007'
});
chrome.contextMenus.onClicked.addListener(toggle);

var connection;
// RTCMultiConnection - http://www.rtcmulticonnection.org/docs/
function setupRTCMultiConnection(stream) {
    // http://www.rtcmulticonnection.org/docs/constructor/
    connection = new RTCMultiConnection('webrtc-tab-sharing');
    
    // http://www.rtcmulticonnection.org/docs/bandwidth/
    connection.bandwidth = {};
    
    // http://www.rtcmulticonnection.org/docs/session/
    connection.session = {
        video: true,
        oneway: true
    };
    
    // http://www.rtcmulticonnection.org/docs/openSignalingChannel/
    connection.openSignalingChannel = openSignalingChannel;
    
    // http://www.rtcmulticonnection.org/docs/dontAttachStream/
    connection.dontAttachStream = true;
    
    // http://www.rtcmulticonnection.org/docs/attachStreams/
    connection.attachStreams.push(stream);
    
    // http://www.rtcmulticonnection.org/docs/open/
    connection.open();
}

// using websockets for signaling

function openSignalingChannel(config) {
    config.channel = config.channel || this.channel;
    var websocket = new WebSocket('wss://www.webrtc-experiment.com:8563');
    websocket.onopen = function() {
        websocket.push(JSON.stringify({
            open: true,
            channel: config.channel
        }));
        if (config.callback) config.callback(websocket);
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
