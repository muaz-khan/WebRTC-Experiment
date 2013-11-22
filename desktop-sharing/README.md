#### Desktop Sharing using desktopCapture APIs / [Download ZIP](http://code.google.com/p/muazkh/downloads/list)

Sharing desktop using chrome **experimental desktopCapture APIs**; broadcasting over many peers.

=

#### [You can view broadcasted desktops here](https://webrtc-experiment.appspot.com/desktop-sharing/)

You can also view broadcasted desktops using Firefox nightly, aurora, and 18+stable! It is cross-browser!

=

#### How to capture stream using tabCapture APIs?

```javascript
// this page is using desktopCapture API to capture and share desktop
// http://developer.chrome.com/extensions/desktopCapture.html
// Availability:	Beta and dev channels only.

window.isStopBroadcasting = false;
chrome.browserAction.onClicked.addListener(toggle);

function toggle() {
    if (localStorage['broadcasting'] == undefined) {
        localStorage.setItem('broadcasting', true);
        window.isStopBroadcasting = false;
        captureDesktop();

        chrome.contextMenus.update('1234567890', {
            title: 'Stop sharing Desktop.'
        });
        console.log('Desktop sharing started...');
    } else {
        if (connection) connection.close();
        localStorage.removeItem('broadcasting');
        window.isStopBroadcasting = true;

        chrome.browserAction.setIcon({
            path: 'images/desktopCapture22.png'
        });

        chrome.contextMenus.update('1234567890', {
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
    title: 'Share this Desktop!',
    id: '1234567890'
});
chrome.contextMenus.onClicked.addListener(toggle);

// RTCMultiConnection - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection
var connection;

function setupRTCMultiConnection(stream) {
    connection = new RTCMultiConnection('webrtc-desktop-sharing');
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
    websocket.onopen = function () {
        websocket.push(JSON.stringify({
            open: true,
            channel: config.channel
        }));
        if (config.callback) config.callback(websocket);
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

```

=

#### Browser support of desktopCapture APIs

From Nov, 2013:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

=

#### List of browsers that can view broadcasted desktops

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

=

#### License

[DesktopCapture Extension](http://code.google.com/p/muazkh/downloads/list) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
