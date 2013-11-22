// Muaz Khan          - https://github.com/muaz-khan
// MIT License        - https://www.WebRTC-Experiment.com/licence/
// ==============================================================
// webrtc-extension   - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/tabCapture

window.isStopBroadcasting = false;
chrome.browserAction.onClicked.addListener(toggle);

function toggle() {
    if (localStorage['broadcasting'] == undefined) {
        localStorage.setItem('broadcasting', true);
        window.isStopBroadcasting = false;
        captureTab();

        chrome.contextMenus.update('000007', {
            title: 'Stop sharing this tab.'
        });
        console.log('Tab sharing started...');
    } else {
        if(connection) connection.close();
        localStorage.removeItem('broadcasting');
        window.isStopBroadcasting = true;

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
                    chromeMediaSource: 'tab'
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
// RTCMultiConnection - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection
function setupRTCMultiConnection(stream) {
    connection = new RTCMultiConnection('webrtc-tab-sharing');
    connection.bandwidth.video = false;
    connection.session = {
        video: true,
        oneway: true
    };
    connection.openSignalingChannel = openSignalingChannel;
    connection.dontAttachStream = true;
    connection.attachStreams.push(stream);
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
