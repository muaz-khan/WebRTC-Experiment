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
                    minWidth: 1280,
                    minHeight: 720,
                    
                    maxWidth: 1920,
                    maxHeight: 1080,
                    
                    minAspectRatio: 1.77
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
    connection = new RTCMultiConnection();
    
    connection.channel = connection.token();
    
    connection.autoReDialOnFailure = true;
    
    // www.RTCMultiConnection.org/docs/bandwidth/
    connection.bandwidth = {
        video: 300 // 300kbps
    };
    
    // http://www.rtcmulticonnection.org/docs/session/
    connection.session = {
        video: true,
        oneway: true
    };
    
    connection.sdpConstraints.OfferToReceiveAudio = false;
    connection.sdpConstraints.OfferToReceiveVideo = false;
    
    connection.onRequest = function(request) {
        connection.accept(request);
        
        // #174, thanks @alberttsai for pointing out this issue!
        // chrome.tabs.create({url: chrome.extension.getURL('_generated_background_page.html')});
    };
    
    // http://www.rtcmulticonnection.org/docs/openSignalingChannel/
    connection.openSignalingChannel = openSignalingChannel;
    
    // http://www.rtcmulticonnection.org/docs/dontAttachStream/
    connection.dontAttachStream = true;
    
    // http://www.rtcmulticonnection.org/docs/attachStreams/
    connection.attachStreams.push(stream);
    
    // http://www.rtcmulticonnection.org/docs/open/
    connection.open({
        dontTransmit: true
    });
    
    var domain = 'https://www.webrtc-experiment.com';
    var resultingURL = domain + '/screen-broadcast/?userid=' + connection.userid + '&sessionid=' + connection.channel;
    chrome.tabs.create({
        url: resultingURL,
        active: false
    });
    alert('The tab, that is just opened, is your private room URL. You can share the URL with friends so that, they can view your privately shared tab. Make sure that the tab that you are sharing is active whilst your friends are joining you. For inactive-shared-tabs, connection may fail.');
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
        console.log('connected to websocket at: ' + webSocketURI);
    };
    websocket.onmessage = function(event) {
        config.onmessage(JSON.parse(event.data));
    };
    websocket.onerror = function() {
        console.error('Unable to connect to ' + webSocketURI);
        if(connection.stats.numberOfConnectedUsers == 0) {
            chrome.runtime.reload();
        }
    };
    websocket.push = websocket.send;
    websocket.send = function(data) {
        websocket.push(JSON.stringify({
            data: data,
            channel: config.channel
        }));
    };
}
