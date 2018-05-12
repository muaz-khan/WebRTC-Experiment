var MediaDevices = [];

var audioInputDevices = [];
var audioOutputDevices = [];
var videoInputDevices = [];

if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    // Firefox 38+ seems having support of enumerateDevices
    // Thanks @xdumaine/enumerateDevices
    navigator.enumerateDevices = function(callback) {
        var enumerateDevices = navigator.mediaDevices.enumerateDevices();
        if (enumerateDevices && enumerateDevices.then) {
            navigator.mediaDevices.enumerateDevices().then(callback).catch(function() {
                callback([]);
            });
        } else {
            callback([]);
        }
    };
}

// Media Devices detection
var canEnumerate = false;

/*global MediaStreamTrack:true */
if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
    canEnumerate = true;
} else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
    canEnumerate = true;
}

var hasMicrophone = false;
var hasSpeakers = false;
var hasWebcam = false;

var isWebsiteHasMicrophonePermissions = false;
var isWebsiteHasWebcamPermissions = false;

// http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices
function checkDeviceSupport(callback) {
    if (!canEnumerate) {
        if (callback) {
            callback();
        }
        return;
    }

    if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
        navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
    }

    if (!navigator.enumerateDevices && navigator.enumerateDevices) {
        navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
    }

    if (!navigator.enumerateDevices) {
        if (callback) {
            callback();
        }
        return;
    }

    MediaDevices = [];

    audioInputDevices = [];
    audioOutputDevices = [];
    videoInputDevices = [];

    hasMicrophone = false;
    hasSpeakers = false;
    hasWebcam = false;

    isWebsiteHasMicrophonePermissions = false;
    isWebsiteHasWebcamPermissions = false;

    // to prevent duplication
    var alreadyUsedDevices = {};

    navigator.enumerateDevices(function(devices) {
        devices.forEach(function(_device) {
            var device = {};
            for (var d in _device) {
                try {
                    if (typeof _device[d] !== 'function') {
                        device[d] = _device[d];
                    }
                } catch (e) {}
            }

            if (alreadyUsedDevices[device.deviceId + device.label + device.kind]) {
                return;
            }

            // if it is MediaStreamTrack.getSources
            if (device.kind === 'audio') {
                device.kind = 'audioinput';
            }

            if (device.kind === 'video') {
                device.kind = 'videoinput';
            }

            if (!device.deviceId) {
                device.deviceId = device.id;
            }

            if (!device.id) {
                device.id = device.deviceId;
            }

            if (!device.label) {
                device.isCustomLabel = true;

                if (device.kind === 'videoinput') {
                    device.label = 'Camera ' + (videoInputDevices.length + 1);
                } else if (device.kind === 'audioinput') {
                    device.label = 'Microphone ' + (audioInputDevices.length + 1);
                } else if (device.kind === 'audiooutput') {
                    device.label = 'Speaker ' + (audioOutputDevices.length + 1);
                } else {
                    device.label = 'Please invoke getUserMedia once.';
                }

                if (typeof DetectRTC !== 'undefined' && DetectRTC.browser.isChrome && DetectRTC.browser.version >= 46 && !/^(https:|chrome-extension:)$/g.test(location.protocol || '')) {
                    if (typeof document !== 'undefined' && typeof document.domain === 'string' && document.domain.search && document.domain.search(/localhost|127.0./g) === -1) {
                        device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                    }
                }
            } else {
                // Firefox on Android still returns empty label
                if (device.kind === 'videoinput' && !isWebsiteHasWebcamPermissions) {
                    isWebsiteHasWebcamPermissions = true;
                }

                if (device.kind === 'audioinput' && !isWebsiteHasMicrophonePermissions) {
                    isWebsiteHasMicrophonePermissions = true;
                }
            }

            if (device.kind === 'audioinput') {
                hasMicrophone = true;

                if (audioInputDevices.indexOf(device) === -1) {
                    audioInputDevices.push(device);
                }
            }

            if (device.kind === 'audiooutput') {
                hasSpeakers = true;

                if (audioOutputDevices.indexOf(device) === -1) {
                    audioOutputDevices.push(device);
                }
            }

            if (device.kind === 'videoinput') {
                hasWebcam = true;

                if (videoInputDevices.indexOf(device) === -1) {
                    videoInputDevices.push(device);
                }
            }

            // there is no 'videoouput' in the spec.
            MediaDevices.push(device);

            alreadyUsedDevices[device.deviceId + device.label + device.kind] = device;
        });

        if (typeof DetectRTC !== 'undefined') {
            // to sync latest outputs
            DetectRTC.MediaDevices = MediaDevices;
            DetectRTC.hasMicrophone = hasMicrophone;
            DetectRTC.hasSpeakers = hasSpeakers;
            DetectRTC.hasWebcam = hasWebcam;

            DetectRTC.isWebsiteHasWebcamPermissions = isWebsiteHasWebcamPermissions;
            DetectRTC.isWebsiteHasMicrophonePermissions = isWebsiteHasMicrophonePermissions;

            DetectRTC.audioInputDevices = audioInputDevices;
            DetectRTC.audioOutputDevices = audioOutputDevices;
            DetectRTC.videoInputDevices = videoInputDevices;
        }

        if (callback) {
            callback();
        }
    });
}
