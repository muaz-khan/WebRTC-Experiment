var MediaStreamTrack = window.MediaStreamTrack;

// http://goo.gl/6ScAV9
var DetectRTC = {};

(function() {

    DetectRTC.hasMicrophone = false;
    DetectRTC.hasSpeakers = false;
    DetectRTC.hasWebcam = false;

    DetectRTC.MediaDevices = [];

    // http://goo.gl/UVQRKk
    // todo: switch to enumerateDevices when landed in canary.
    function CheckDeviceSupport(callback) {
        // This method is useful only for Chrome!

        // Firefox seems having no support of enumerateDevices feature yet.
        if (isPluginRTC || isFirefox) {
            callback && callback();
            return;
        }

        // if "getSources" is available; prefer it over "getMediaDevices"
        if (MediaStreamTrack && MediaStreamTrack.getSources) {
            navigator.getMediaDevices = MediaStreamTrack.getSources.bind(MediaStreamTrack);
        }

        // if still no "getMediaDevices"; it MUST be Firefox!
        if (!navigator.getMediaDevices) {
            log('navigator.getMediaDevices is undefined.');
            // assuming that it is older chrome or chromium implementation
            if (isChrome) {
                DetectRTC.hasMicrophone = true;
                DetectRTC.hasSpeakers = true;
                DetectRTC.hasWebcam = true;
            }

            callback && callback();
            return;
        }

        navigator.getMediaDevices(function(devices) {
            DetectRTC.MediaDevices = [];
            devices.forEach(function(device) {
                // if it is MediaStreamTrack.getSources
                if (device.kind == 'audio') {
                    device.kind = 'audioinput';
                }

                if (device.kind == 'video') {
                    device.kind = 'videoinput';
                }

                if (!device.deviceId) {
                    device.deviceId = device.id;
                }

                if (!device.id) {
                    device.id = device.deviceId;
                }

                DetectRTC.MediaDevices.push(device);

                if (device.kind == 'audioinput' || device.kind == 'audio') {
                    DetectRTC.hasMicrophone = true;
                }

                if (device.kind == 'audiooutput') {
                    DetectRTC.hasSpeakers = true;
                }

                if (device.kind == 'videoinput' || device.kind == 'video') {
                    DetectRTC.hasWebcam = true;
                }

                // there is no "videoouput" in the spec.
            });

            if (callback) callback();
        });
    }

    DetectRTC.isWebRTCSupported = !!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection;
    DetectRTC.isAudioContextSupported = (!!window.AudioContext || !!window.webkitAudioContext) && !!AudioContext.prototype.createMediaStreamSource;
    DetectRTC.isScreenCapturingSupported = isChrome && chromeVersion >= 26 && (isNodeWebkit ? true : location.protocol == 'https:');
    DetectRTC.isSctpDataChannelsSupported = !!navigator.mozGetUserMedia || (isChrome && chromeVersion >= 25);
    DetectRTC.isRtpDataChannelsSupported = isChrome && chromeVersion >= 31;

    // check for microphone/camera support!
    CheckDeviceSupport();
    DetectRTC.load = CheckDeviceSupport;

    var screenCallback;

    DetectRTC.screen = {
        chromeMediaSource: 'screen',
        extensionid: ReservedExtensionID,
        getSourceId: function(callback) {
            if (!callback) throw '"callback" parameter is mandatory.';

            // make sure that chrome extension is installed.
            if (!!DetectRTC.screen.status) {
                onstatus(DetectRTC.screen.status);
            } else DetectRTC.screen.getChromeExtensionStatus(onstatus);

            function onstatus(status) {
                if (status == 'installed-enabled') {
                    screenCallback = callback;
                    window.postMessage('get-sourceId', '*');
                    return;
                }

                DetectRTC.screen.chromeMediaSource = 'screen';
                callback('No-Response'); // chrome extension isn't available
            }
        },
        onMessageCallback: function(data) {
            if (!(isString(data) || !!data.sourceId)) return;

            log('chrome message', data);

            // "cancel" button is clicked
            if (data == 'PermissionDeniedError') {
                DetectRTC.screen.chromeMediaSource = 'PermissionDeniedError';
                if (screenCallback) return screenCallback('PermissionDeniedError');
                else throw new Error('PermissionDeniedError');
            }

            // extension notified his presence
            if (data == 'rtcmulticonnection-extension-loaded') {
                DetectRTC.screen.chromeMediaSource = 'desktop';
                if (DetectRTC.screen.onScreenCapturingExtensionAvailable) {
                    DetectRTC.screen.onScreenCapturingExtensionAvailable();

                    // make sure that this event isn't fired multiple times
                    DetectRTC.screen.onScreenCapturingExtensionAvailable = null;
                }
            }

            // extension shared temp sourceId
            if (data.sourceId) {
                DetectRTC.screen.sourceId = data.sourceId;
                if (screenCallback) screenCallback(DetectRTC.screen.sourceId);
            }
        },
        getChromeExtensionStatus: function(extensionid, callback) {
            function _callback(status) {
                DetectRTC.screen.status = status;
                callback(status);
            }

            if (isFirefox) return _callback('not-chrome');

            if (arguments.length != 2) {
                callback = extensionid;
                extensionid = this.extensionid;
            }

            var image = document.createElement('img');
            image.src = 'chrome-extension://' + extensionid + '/icon.png';
            image.onload = function() {
                DetectRTC.screen.chromeMediaSource = 'screen';
                window.postMessage('are-you-there', '*');
                setTimeout(function() {
                    if (DetectRTC.screen.chromeMediaSource == 'screen') {
                        _callback(
                            DetectRTC.screen.chromeMediaSource == 'desktop' ? 'installed-enabled' : 'installed-disabled' /* if chrome extension isn't permitted for current domain, then it will be installed-disabled all the time even if extension is enabled. */
                        );
                    } else _callback('installed-enabled');
                }, 2000);
            };
            image.onerror = function() {
                _callback('not-installed');
            };
        }
    };
})();

// if IE
if (!window.addEventListener) {
    window.addEventListener = function(el, eventName, eventHandler) {
        if (!el.attachEvent) return;
        el.attachEvent('on' + eventName, eventHandler);
    };
}

function listenEventHandler(eventName, eventHandler) {
    window.removeEventListener(eventName, eventHandler);
    window.addEventListener(eventName, eventHandler, false);
}

window.addEventListener('message', function(event) {
    if (event.origin != window.location.origin) {
        return;
    }

    DetectRTC.screen.onMessageCallback(event.data);
});
