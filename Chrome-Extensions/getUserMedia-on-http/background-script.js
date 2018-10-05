var port, rtc;

chrome.runtime.onConnect.addListener(function(p) {
    if (p.sender.url.indexOf('http:') === 0) {
        port = p;
    }

    p.onMessage.addListener(portOnMessageHanlder);
});

// this one is called for each message from "content-script.js"
function portOnMessageHanlder(hints) {
    if (hints['stream-stop']) {
        if (!rtc || !rtc.peer) return;
        rtc.peer.getLocalStreams().forEach(function(stream) {
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        });
        rtc.peer.close();
        rtc.peer = null;
        rtc = null;
        return;
    }

    if(hints.error) {
        port.postMessage(hints.error);
        return;
    }

    if (hints.sdp) {
        if (!rtc || !rtc.peer) return;
        rtc.setRemoteDescription(hints.sdp);
        return;
    }

    if(hints.video && hints.video.mediaSource) {
        var mediaSourceTypes = hints.video.mediaSourceTypes || ['screen', 'window', 'audio', 'tab'];
        
        if(hints.audio && mediaSourceTypes.indexOf('audio') === -1) {
            mediaSourceTypes.push('audio');
        }

        chrome.desktopCapture.chooseDesktopMedia(mediaSourceTypes, function(chromeMediaSourceId, opts) {
            if(!chromeMediaSourceId) {
                port.postMessage({
                    error: {
                        message: 'User denied to access screen.',
                        name: 'PermissionDeniedError',
                        constraints: null
                    }
                });
                return;
            }
            opts = opts || {};

            var minWidth = screen.width;
            var minHeight = screen.height;
            var maxWidth = screen.width;
            var maxHeight = screen.height;

            var minFrameRate = 64;
            var maxFrameRate = 128;

            if(hints.video.width) {
                if(hints.video.width.min) {
                    minWidth = hints.video.width.min;
                }

                if(hints.video.width.max) {
                    maxWidth = hints.video.width.max;
                }

                if(hints.video.width.exact) {
                    minWidth = hints.video.width.exact;
                    maxWidth = hints.video.width.exact;
                }

                if(isNumeric(hints.video.width)) {
                    minWidth = hints.video.width;
                    maxWidth = hints.video.width;
                }
            }

            if(hints.video.height) {
                if(hints.video.height.min) {
                    minHeight = hints.video.height.min;
                }

                if(hints.video.height.max) {
                    maxHeight = hints.video.height.max;
                }

                if(hints.video.height.exact) {
                    minHeight = hints.video.height.exact;
                    maxHeight = hints.video.height.exact;
                }

                if(isNumeric(hints.video.height)) {
                    minHeight = hints.video.height;
                    maxHeight = hints.video.height;
                }
            }

            var minAspectRatio = getAspectRatio(maxWidth, maxHeight);
            var maxAspectRatio = getAspectRatio(maxWidth, maxHeight);

            if(hints.video.aspectRatio) {
                if(hints.video.aspectRatio.min) {
                    minAspectRatio = hints.video.aspectRatio.min;
                }

                if(hints.video.aspectRatio.max) {
                    maxAspectRatio = hints.video.aspectRatio.max;
                }

                if(hints.video.aspectRatio.exact) {
                    minAspectRatio = hints.video.aspectRatio.exact;
                    maxAspectRatio = hints.video.aspectRatio.exact;
                }

                if(isNumeric(hints.video.aspectRatio)) {
                    minAspectRatio = hints.video.aspectRatio;
                    maxAspectRatio = hints.video.aspectRatio;
                }
            }

            if(hints.video.frameRate) {
                if(hints.video.frameRate.min) {
                    minFrameRate = hints.video.frameRate.min;
                }

                if(hints.video.frameRate.max) {
                    maxFrameRate = hints.video.frameRate.max;
                }

                if(hints.video.frameRate.exact) {
                    minFrameRate = hints.video.frameRate.exact;
                    maxFrameRate = hints.video.frameRate.exact;
                }

                if(isNumeric(hints.video.frameRate)) {
                    minFrameRate = hints.video.frameRate;
                    maxFrameRate = hints.video.frameRate;
                }
            }

            var constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: chromeMediaSourceId,
                        maxWidth: maxWidth,
                        maxHeight: maxHeight,
                        minWidth: minWidth,
                        minHeight:minHeight,
                        minAspectRatio: minAspectRatio,
                        maxAspectRatio: maxAspectRatio,
                        minFrameRate: minFrameRate,
                        maxFrameRate: maxFrameRate
                    },
                    optional: []
                }
            };

            if (opts.canRequestAudioTrack === true && hints.audio) {
                constraints.audio = {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: chromeMediaSourceId,
                        echoCancellation: true
                    },
                    optional: [{
                        googDisableLocalEcho: false
                    }]
                };
            }

            navigator.mediaDevices.getUserMedia(constraints).then(onGettingLocalStream).catch(function(error) {
                port.postMessage({
                    error: {
                        message: error.message || 'Unable to invoke getUserMedia using provided constraints.',
                        name: 'ConstraintsError',
                        constraints: constraints
                    }
                });
            });
        });
        return;
    }

    var popup_width = screen.width - parseInt(screen.width / 3);
    var popup_height = screen.height - parseInt(screen.height / 3);
    navigator.mediaDevices.getUserMedia(hints).then(onGettingLocalStream).catch(function(e) {
        chrome.windows.create({
            url: 'camera-mic.html?hints' + JSON.stringify(hints),
            type: 'popup',
            width: popup_width,
            height: popup_height,
            top: parseInt((screen.height / 2) - (popup_height / 2)),
            left: parseInt((screen.width / 2) - (popup_width / 2)),
            focused: true
        });
    });
}

function getAspectRatio(w, h) {
    function gcd(a, b) {
        return (b == 0) ? a : gcd(b, a % b);
    }
    var r = gcd(w, h);
    return (w / r) / (h / r);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// on getting sourceId
function onGettingLocalStream(stream) {
    var temp = document.createElement('video');
    temp.muted = true;
    temp.srcObject = stream;

    rtc = new webrtcHandler();
    rtc.createOffer(stream, function(offer) {
        port.postMessage({
            sdp: offer
        });
    });
}
