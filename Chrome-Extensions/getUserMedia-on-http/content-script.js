var port = chrome.runtime.connect();
port.onMessage.addListener(function(message) {
    window.postMessage({
        'get-user-media-http': message,
        'from-background': true
    }, '*');
});

window.addEventListener('message', function(event) {
    if (event.source != window || !event.data['from-webpage'] || !event.data['get-user-media-http']) return;
    port.postMessage(event.data['get-user-media-http']);
});

function getUserMediaHttp() {
    if(location.protocol === 'https:' || location.protocol === 'chrome:' || document.domain === 'localhost' || document.domain === '127.0.0.1') {
        // ignore HTTPs and localhost and chrome
        return;
    }

    if(!navigator.mediaDevices) {
        navigator.mediaDevices = {};
    }

    var hints = {
        audio: true,
        video: true
    };
    
    var errorCallback = function(error) {
        console.error('getUserMediaHttp error', error);
    };

    var successCallback = function(stream) {
        stream.getTracks().forEach(function(track) {
            console.log('getUserMediaHttp stream', track.kind, track.readyState);
        });
    };
    
    navigator.mediaDevices.getUserMedia = function(_hints) {
        if (!_hints || (!_hints.audio && !_hints.video && !_hints.screen && !_hints.tab)) {
            _hints = {
                audio: true,
                video: true
            };
        }

        hints = _hints;

        getUserMedia();

        return {
            then: function(callback) {
                if(typeof callback !== 'function') {
                    throw new Error('"callback" must be a function.');
                }

                successCallback = callback;

                return {
                    catch: function(callback) {
                        if(typeof callback !== 'function') {
                            throw new Error('"callback" must be a function.');
                        }

                        errorCallback = callback;
                    }
                }
            }
        }
    };

    function getUserMedia() {
        window.postMessage({
            'get-user-media-http': hints,
            'from-webpage': true
        }, '*');
    }

    window.addEventListener('message', function(event) {
        if (event.source != window || !event.data['from-background']) return;

        var hints = event.data['get-user-media-http'];
        if (!hints) return;

        if(hints.error) {
            errorCallback(hints.error);
            return;
        }

        if (hints.sdp && hints.sdp.type === 'offer') {
            var rtc = new webrtcHandler();
            rtc.createAnswer(hints.sdp, function(answer) {
                if (answer.sdp) {
                    window.postMessage({
                        'get-user-media-http': {
                            sdp: answer
                        },
                        'from-webpage': true
                    }, '*');
                }

                if (answer.stream) {
                    answer.stream.oninactive = function() {
                        window.postMessage({
                            'get-user-media-http': {
                                'stream-stop': answer.stream.id
                            },
                            'from-webpage': true
                        }, '*');
                        rtc.peer.close();
                        rtc.peer = null;
                    };
                    successCallback(answer.stream);

                    window.addEventListener('beforeunload', function() {
                        answer.stream.getTracks().forEach(function(track) {
                            track.stop();
                        });
                    }, false);
                }
            });
        }
    });
}

var script = document.createElement('script');
(document.head || document.body || document.documentElement).appendChild(script).text = getUserMediaHttp.toString() + ';' + webrtcHandler.toString() + ';getUserMediaHttp();';
script.remove();
