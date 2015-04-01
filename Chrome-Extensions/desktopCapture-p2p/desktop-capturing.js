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
            //connection.attachStreams[0].onended = function() {};
            connection.attachStreams[0].stop();
            // setDefaults();
        }

        var desktop_id = chrome.desktopCapture.chooseDesktopMedia(
            ['screen', 'window'],
            function(chromeMediaSourceId) {
                onAccessApproved(chromeMediaSourceId);

                chrome.contextMenus.update(contextMenuID, {
                    title: 'Stop sharing Desktop'
                });

                console.log('Desktop sharing started...');
            });
    }

    function onAccessApproved(chromeMediaSourceId) {
        if (!chromeMediaSourceId) {
            setDefaults();
            chrome.windows.create({
                url: "data:text/html,<h1>Desktop Capture access is rejected.</h1>",
                type: 'popup',
                width: screen.width / 2,
                height: 170
            });
            return;
        }

        navigator.webkitGetUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: chromeMediaSourceId,
                    maxWidth: screen.width > 1920 ? screen.width : 1920,
                    maxHeight: screen.height > 1080 ? screen.height : 1080,
                    minFrameRate: 30,
                    maxFrameRate: 64,
                    minAspectRatio: 1.77,
                    googLeakyBucket: true,
                    googTemporalLayeredScreencast: true
                },
                optional: []
            }
        }, gotStream, getUserMediaError);

        function gotStream(stream) {
            if (!stream) {
                setDefaults();
                chrome.windows.create({
                    url: "data:text/html,<h1>Unable to capture Desktop. Note that Chrome internal pages cannot be captured.</h1>",
                    type: 'popup',
                    width: screen.width / 2,
                    height: 170
                });
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
            setDefaults();
            chrome.windows.create({
                    url: "data:text/html,<h1>getUserMediaError: " + JSON.stringify(e, null, '---') + "</h1>",
                    type: 'popup',
                    width: screen.width / 2,
                    height: 170
                });
        }
    }

    // RTCMultiConnection - www.RTCMultiConnection.org
    var connection;

    var background_page_id;

    var popup_id;

    function setupRTCMultiConnection(stream) {
        // www.RTCMultiConnection.org/docs/
        connection = new RTCMultiConnection();

        connection.optionalArgument = {
            optional: [{
                DtlsSrtpKeyAgreement: true
            }, {
                googImprovedWifiBwe: true
            }, {
                googScreencastMinBitrate: 300
            }, {
                googIPv6: true
            }, {
                googDscp: true
            }, {
                googCpuUnderuseThreshold: 55
            }, {
                googCpuOveruseThreshold: 85
            }, {
                googSuspendBelowMinBitrate: true
            }, {
                googCpuOveruseDetection: true
            }],
            mandatory: {}
        };

        connection.channel = connection.sessionid = connection.userid;

        connection.autoReDialOnFailure = true;
        connection.getExternalIceServers = false;

        setBandwidth(connection);

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

        // var resultingURL = 'http://localhost:1111/Chrome-Extensions/desktopCapture-p2p/viewer.html?sessionid=' + connection.sessionid;

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

    function openSignalingChannel(config) {
        config.channel = config.channel || this.channel;

        var pub = 'pub-c-3c0fc243-9892-4858-aa38-1445e58b4ecb';
        var sub = 'sub-c-d0c386c6-7263-11e2-8b02-12313f022c90';
        
        WebSocket  = PUBNUB.ws;

        var websocket = new WebSocket('wss://pubsub.pubnub.com/' + pub + '/' + sub + '/' + config.channel);

        websocket.channel = config.channel;

        websocket.onopen = function() {
            if (config.callback) {
                config.callback(websocket);
            }
        };

        websocket.onerror = function() {
            setDefaults();
            chrome.windows.create({
                url: "data:text/html,<h1>Unable to connect to pubsub.pubnub.com.</h1>",
                type: 'popup',
                width: screen.width / 2,
                height: 170
            });
            chrome.runtime.reload();
        };
        
        websocket.onclose = function() {
            setDefaults();
            chrome.windows.create({
                url: "data:text/html,<h1>WebSocket connection is closed.</h1>",
                type: 'popup',
                width: screen.width / 2,
                height: 170
            });
            chrome.runtime.reload();
        };
        
        websocket.onmessage = function(event) {
            config.onmessage(JSON.parse(event.data));
        };
        
        websocket.push = websocket.send;
        websocket.send = function(data) {
            websocket.push(JSON.stringify(data));
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

function setBandwidth(connection) {
    // www.RTCMultiConnection.org/docs/bandwidth/
    connection.bandwidth = {
        screen: 300 // 300kbps
    };

    connection.processSdp = function(sdp) {
        sdp = setSendBandwidth(sdp);
        return sdp;
    };

    function setSendBandwidth(sdp) {
        var sdpLines = sdp.split('\r\n');

        // VP8
        var vp8Index = findLine(sdpLines, 'a=rtpmap', 'VP8/90000');
        var vp8Payload;
        if (vp8Index) {
            vp8Payload = getCodecPayloadType(sdpLines[vp8Index]);
        }

        var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
        var rtxPayload;
        if (rtxIndex) {
            rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
        }

        var rtxFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
        if (rtxFmtpLineIndex !== null) {
            var appendrtxNext = '\r\n';
            appendrtxNext += 'a=fmtp:' + vp8Payload + ' x-google-min-bitrate=300; x-google-max-bitrate=300';
            sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
            sdp = sdpLines.join('\r\n');
        }
        return sdp;
    }

    function findLine(sdpLines, prefix, substr) {
        return findLineInRange(sdpLines, 0, -1, prefix, substr);
    }

    function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
        var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
        for (var i = startLine; i < realEndLine; ++i) {
            if (sdpLines[i].indexOf(prefix) === 0) {
                if (!substr ||
                    sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                    return i;
                }
            }
        }
        return null;
    }

    function getCodecPayloadType(sdpLine) {
        var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
        var result = sdpLine.match(pattern);
        return (result && result.length === 2) ? result[1] : null;
    }
}
