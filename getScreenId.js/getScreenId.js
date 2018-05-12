// Last time updated on May 04, 2018

// Latest file can be found here: https://cdn.webrtc-experiment.com/getScreenId.js

// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - https://github.com/muaz-khan/getScreenId.

// ______________
// getScreenId.js

/*
getScreenId(function (error, sourceId, screen_constraints) {
    // error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
    // sourceId == null || 'string' || 'firefox'
    
    if(microsoftEdge) {
        navigator.getDisplayMedia(screen_constraints).then(onSuccess, onFailure);
    }
    else {
        navigator.mediaDevices.getUserMedia(screen_constraints).then(onSuccess)catch(onFailure);
    }

}, 'pass second parameter only if you want system audio');
*/

(function() {
    window.getScreenId = function(callback, system_audio) {
        if(navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob)) {
            // microsoft edge => navigator.getDisplayMedia(screen_constraints).then(onSuccess, onFailure);
            callback({
                video: true
            });
            return;
        }

        // for Firefox:
        // sourceId == 'firefox'
        // screen_constraints = {...}
        if (!!navigator.mozGetUserMedia) {
            callback(null, 'firefox', {
                video: {
                    mozMediaSource: 'window',
                    mediaSource: 'window'
                }
            });
            return;
        }

        window.addEventListener('message', onIFrameCallback);

        function onIFrameCallback(event) {
            if (!event.data) return;

            if (event.data.chromeMediaSourceId) {
                if (event.data.chromeMediaSourceId === 'PermissionDeniedError') {
                    callback('permission-denied');
                } else {
                    callback(null, event.data.chromeMediaSourceId, getScreenConstraints(null, event.data.chromeMediaSourceId, event.data.canRequestAudioTrack));
                }

                // this event listener is no more needed
                window.removeEventListener('message', onIFrameCallback);
            }

            if (event.data.chromeExtensionStatus) {
                callback(event.data.chromeExtensionStatus, null, getScreenConstraints(event.data.chromeExtensionStatus));

                // this event listener is no more needed
                window.removeEventListener('message', onIFrameCallback);
            }
        }

        if(!system_audio) {
            setTimeout(postGetSourceIdMessage, 100);
        }
        else {
            setTimeout(function() {
                postGetSourceIdMessage('system_audio');
            }, 100);
        }
    };

    function getScreenConstraints(error, sourceId, canRequestAudioTrack) {
        var screen_constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: error ? 'screen' : 'desktop',
                    maxWidth: window.screen.width > 1920 ? window.screen.width : 1920,
                    maxHeight: window.screen.height > 1080 ? window.screen.height : 1080
                },
                optional: []
            }
        };

        if(!!canRequestAudioTrack) {
            screen_constraints.audio = {
                mandatory: {
                    chromeMediaSource: error ? 'screen' : 'desktop',
                    // echoCancellation: true
                },
                optional: []
            };
        }

        if (sourceId) {
            screen_constraints.video.mandatory.chromeMediaSourceId = sourceId;

            if(screen_constraints.audio && screen_constraints.audio.mandatory) {
                screen_constraints.audio.mandatory.chromeMediaSourceId = sourceId;
            }
        }

        return screen_constraints;
    }

    function postGetSourceIdMessage(system_audio) {
        if (!iframe) {
            loadIFrame(function() {
                postGetSourceIdMessage(system_audio);
            });
            return;
        }

        if (!iframe.isLoaded) {
            setTimeout(function() {
                postGetSourceIdMessage(system_audio);
            }, 100);
            return;
        }

        if(!system_audio) {
            iframe.contentWindow.postMessage({
                captureSourceId: true
            }, '*');
        }
        else {
            iframe.contentWindow.postMessage({
                captureSourceIdWithAudio: true
            }, '*');
        }
    }

    var iframe;

    // this function is used in RTCMultiConnection v3
    window.getScreenConstraints = function(callback) {
        loadIFrame(function() {
            getScreenId(function(error, sourceId, screen_constraints) {
                if(!screen_constraints) {
                    screen_constraints = {
                        video: true
                    };
                }

                callback(error, screen_constraints.video);
            });
        });
    };

    function loadIFrame(loadCallback) {
        if (iframe) {
            loadCallback();
            return;
        }

        iframe = document.createElement('iframe');
        iframe.onload = function() {
            iframe.isLoaded = true;

            loadCallback();
        };
        iframe.src = 'https://www.webrtc-experiment.com/getSourceId/'; // https://wwww.yourdomain.com/getScreenId.html
        iframe.style.display = 'none';
        (document.body || document.documentElement).appendChild(iframe);
    }

    window.getChromeExtensionStatus = function(callback) {
        // for Firefox:
        if (!!navigator.mozGetUserMedia) {
            callback('installed-enabled');
            return;
        }

        window.addEventListener('message', onIFrameCallback);

        function onIFrameCallback(event) {
            if (!event.data) return;

            if (event.data.chromeExtensionStatus) {
                callback(event.data.chromeExtensionStatus);

                // this event listener is no more needed
                window.removeEventListener('message', onIFrameCallback);
            }
        }

        setTimeout(postGetChromeExtensionStatusMessage, 100);
    };

    function postGetChromeExtensionStatusMessage() {
        if (!iframe) {
            loadIFrame(postGetChromeExtensionStatusMessage);
            return;
        }

        if (!iframe.isLoaded) {
            setTimeout(postGetChromeExtensionStatusMessage, 100);
            return;
        }

        iframe.contentWindow.postMessage({
            getChromeExtensionStatus: true
        }, '*');
    }
})();
