var MediaDevices = [];

// ---------- Media Devices detection
var canEnumerate = false;

/*global MediaStreamTrack:true */
if(typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
    canEnumerate = true;
}

else if(navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
    canEnumerate = true;
}

var hasMicrophone = canEnumerate;
var hasSpeakers = canEnumerate;
var hasWebcam = canEnumerate;

// http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices
// todo: switch to enumerateDevices when landed in canary.
function checkDeviceSupport(callback) {
    // This method is useful only for Chrome!

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
    navigator.enumerateDevices(function(devices) {
        devices.forEach(function(_device) {
            var device = {};
            for (var d in _device) {
                device[d] = _device[d];
            }

            var skip;
            MediaDevices.forEach(function(d) {
                if (d.id === device.id) {
                    skip = true;
                }
            });

            if (skip) {
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
                device.label = 'Please invoke getUserMedia once.';
                if(!isHTTPs) {
                    device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                }
            }

            if (device.kind === 'audioinput' || device.kind === 'audio') {
                hasMicrophone = true;
            }

            if (device.kind === 'audiooutput') {
                hasSpeakers = true;
            }

            if (device.kind === 'videoinput' || device.kind === 'video') {
                hasWebcam = true;
            }

            // there is no 'videoouput' in the spec.

            MediaDevices.push(device);
        });

        if(typeof DetectRTC !== 'undefined') {
            DetectRTC.MediaDevices = MediaDevices;
            DetectRTC.hasMicrophone = hasMicrophone;
            DetectRTC.hasSpeakers = hasSpeakers;
            DetectRTC.hasWebcam = hasWebcam;
        }

        if (callback) {
            callback();
        }
    });
}

// check for microphone/camera support!
checkDeviceSupport();
