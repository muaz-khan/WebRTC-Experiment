// globals.js

if (typeof cordova !== 'undefined') {
    DetectRTC.isMobileDevice = true;
    DetectRTC.browser.name = 'Chrome';
}

if (navigator && navigator.userAgent && navigator.userAgent.indexOf('Crosswalk') !== -1) {
    DetectRTC.isMobileDevice = true;
    DetectRTC.browser.name = 'Chrome';
}

function fireEvent(obj, eventName, args) {
    if (typeof CustomEvent === 'undefined') {
        return;
    }

    var eventDetail = {
        arguments: args,
        __exposedProps__: args
    };

    var event = new CustomEvent(eventName, eventDetail);
    obj.dispatchEvent(event);
}

function setHarkEvents(connection, streamEvent) {
    if (!streamEvent.stream || !getTracks(streamEvent.stream, 'audio').length) return;

    if (!connection || !streamEvent) {
        throw 'Both arguments are required.';
    }

    if (!connection.onspeaking || !connection.onsilence) {
        return;
    }

    if (typeof hark === 'undefined') {
        throw 'hark.js not found.';
    }

    hark(streamEvent.stream, {
        onspeaking: function() {
            connection.onspeaking(streamEvent);
        },
        onsilence: function() {
            connection.onsilence(streamEvent);
        },
        onvolumechange: function(volume, threshold) {
            if (!connection.onvolumechange) {
                return;
            }
            connection.onvolumechange(merge({
                volume: volume,
                threshold: threshold
            }, streamEvent));
        }
    });
}

function setMuteHandlers(connection, streamEvent) {
    if (!streamEvent.stream || !streamEvent.stream || !streamEvent.stream.addEventListener) return;

    streamEvent.stream.addEventListener('mute', function(event) {
        event = connection.streamEvents[streamEvent.streamid];

        event.session = {
            audio: event.muteType === 'audio',
            video: event.muteType === 'video'
        };

        connection.onmute(event);
    }, false);

    streamEvent.stream.addEventListener('unmute', function(event) {
        event = connection.streamEvents[streamEvent.streamid];

        event.session = {
            audio: event.unmuteType === 'audio',
            video: event.unmuteType === 'video'
        };

        connection.onunmute(event);
    }, false);
}

function getRandomString() {
    if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
        var a = window.crypto.getRandomValues(new Uint32Array(3)),
            token = '';
        for (var i = 0, l = a.length; i < l; i++) {
            token += a[i].toString(36);
        }
        return token;
    } else {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }
}

// Get HTMLAudioElement/HTMLVideoElement accordingly
// todo: add API documentation for connection.autoCreateMediaElement

function getRMCMediaElement(stream, callback, connection) {
    if (!connection.autoCreateMediaElement) {
        callback({});
        return;
    }

    var isAudioOnly = false;
    if (!getTracks(stream, 'video').length && !stream.isVideo && !stream.isScreen) {
        isAudioOnly = true;
    }

    if (DetectRTC.browser.name === 'Firefox') {
        if (connection.session.video || connection.session.screen) {
            isAudioOnly = false;
        }
    }

    var mediaElement = document.createElement(isAudioOnly ? 'audio' : 'video');

    mediaElement.srcObject = stream;

    mediaElement.setAttribute('autoplay', true);
    mediaElement.setAttribute('playsinline', true);
    mediaElement.setAttribute('controls', true);
    mediaElement.setAttribute('muted', false);
    mediaElement.setAttribute('volume', 1);

    // http://goo.gl/WZ5nFl
    // Firefox don't yet support onended for any stream (remote/local)
    if (DetectRTC.browser.name === 'Firefox') {
        var streamEndedEvent = 'ended';

        if ('oninactive' in mediaElement) {
            streamEndedEvent = 'inactive';
        }

        mediaElement.addEventListener(streamEndedEvent, function() {
            // fireEvent(stream, streamEndedEvent, stream);
            currentUserMediaRequest.remove(stream.idInstance);

            if (stream.type === 'local') {
                streamEndedEvent = 'ended';

                if ('oninactive' in stream) {
                    streamEndedEvent = 'inactive';
                }

                StreamsHandler.onSyncNeeded(stream.streamid, streamEndedEvent);

                connection.attachStreams.forEach(function(aStream, idx) {
                    if (stream.streamid === aStream.streamid) {
                        delete connection.attachStreams[idx];
                    }
                });

                var newStreamsArray = [];
                connection.attachStreams.forEach(function(aStream) {
                    if (aStream) {
                        newStreamsArray.push(aStream);
                    }
                });
                connection.attachStreams = newStreamsArray;

                var streamEvent = connection.streamEvents[stream.streamid];

                if (streamEvent) {
                    connection.onstreamended(streamEvent);
                    return;
                }
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            }
        }, false);
    }

    var played = mediaElement.play();
    if (typeof played !== 'undefined') {
        var cbFired = false;
        setTimeout(function() {
            if (!cbFired) {
                cbFired = true;
                callback(mediaElement);
            }
        }, 1000);
        played.then(function() {
            if (cbFired) return;
            cbFired = true;
            callback(mediaElement);
        }).catch(function(error) {
            if (cbFired) return;
            cbFired = true;
            callback(mediaElement);
        });
    } else {
        callback(mediaElement);
    }
}

// if IE
if (!window.addEventListener) {
    window.addEventListener = function(el, eventName, eventHandler) {
        if (!el.attachEvent) {
            return;
        }
        el.attachEvent('on' + eventName, eventHandler);
    };
}

function listenEventHandler(eventName, eventHandler) {
    window.removeEventListener(eventName, eventHandler);
    window.addEventListener(eventName, eventHandler, false);
}

window.attachEventListener = function(video, type, listener, useCapture) {
    video.addEventListener(type, listener, useCapture);
};

function removeNullEntries(array) {
    var newArray = [];
    array.forEach(function(item) {
        if (item) {
            newArray.push(item);
        }
    });
    return newArray;
}


function isData(session) {
    return !session.audio && !session.video && !session.screen && session.data;
}

function isNull(obj) {
    return typeof obj === 'undefined';
}

function isString(obj) {
    return typeof obj === 'string';
}

var MediaStream = window.MediaStream;

if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
    MediaStream = webkitMediaStream;
}

/*global MediaStream:true */
if (typeof MediaStream !== 'undefined') {
    if (!('stop' in MediaStream.prototype)) {
        MediaStream.prototype.stop = function() {
            this.getTracks().forEach(function(track) {
                track.stop();
            });
        };
    }
}

function isAudioPlusTab(connection, audioPlusTab) {
    if (connection.session.audio && connection.session.audio === 'two-way') {
        return false;
    }

    if (DetectRTC.browser.name === 'Firefox' && audioPlusTab !== false) {
        return true;
    }

    if (DetectRTC.browser.name !== 'Chrome' || DetectRTC.browser.version < 50) return false;

    if (typeof audioPlusTab === true) {
        return true;
    }

    if (typeof audioPlusTab === 'undefined' && connection.session.audio && connection.session.screen && !connection.session.video) {
        audioPlusTab = true;
        return true;
    }

    return false;
}

function getAudioScreenConstraints(screen_constraints) {
    if (DetectRTC.browser.name === 'Firefox') {
        return true;
    }

    if (DetectRTC.browser.name !== 'Chrome') return false;

    return {
        mandatory: {
            chromeMediaSource: screen_constraints.mandatory.chromeMediaSource,
            chromeMediaSourceId: screen_constraints.mandatory.chromeMediaSourceId
        }
    };
}

window.iOSDefaultAudioOutputDevice = window.iOSDefaultAudioOutputDevice || 'speaker'; // earpiece or speaker

function getTracks(stream, kind) {
    if (!stream || !stream.getTracks) {
        return [];
    }

    return stream.getTracks().filter(function(t) {
        return t.kind === (kind || 'audio');
    });
}

function isUnifiedPlanSupportedDefault() {
    var canAddTransceiver = false;

    try {
        if (typeof RTCRtpTransceiver === 'undefined') return false;
        if (!('currentDirection' in RTCRtpTransceiver.prototype)) return false;

        var tempPc = new RTCPeerConnection();

        try {
            tempPc.addTransceiver('audio');
            canAddTransceiver = true;
        } catch (e) {}

        tempPc.close();
    } catch (e) {
        canAddTransceiver = false;
    }

    return canAddTransceiver && isUnifiedPlanSuppored();
}

function isUnifiedPlanSuppored() {
    var isUnifiedPlanSupported = false;

    try {
        var pc = new RTCPeerConnection({
            sdpSemantics: 'unified-plan'
        });

        try {
            var config = pc.getConfiguration();
            if (config.sdpSemantics == 'unified-plan')
                isUnifiedPlanSupported = true;
            else if (config.sdpSemantics == 'plan-b')
                isUnifiedPlanSupported = false;
            else
                isUnifiedPlanSupported = false;
        } catch (e) {
            isUnifiedPlanSupported = false;
        }
    } catch (e) {
        isUnifiedPlanSupported = false;
    }

    return isUnifiedPlanSupported;
}
