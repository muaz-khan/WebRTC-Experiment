// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
// ____________
// DetectRTC.js

// DetectRTC.hasWebcam (has webcam device!)
// DetectRTC.hasMicrophone (has microphone device!)
// DetectRTC.isScreenCapturingSupported
// DetectRTC.isSctpDataChannelsSupported
// DetectRTC.isRtpDataChannelsSupported
// DetectRTC.isAudioContextSupported
// DetectRTC.isWebRTCSupported

var DetectRTC = {};

(function () {
    function CheckDeviceSupport() {
        // This method is useful only for Chrome!

        // 1st step: verify "MediaStreamTrack" support.
        if (!window.MediaStreamTrack) return console.warn('You are using older chrome or Firefox!');

        // 2nd step: verify "getSources" supported which is planned to be removed soon!
        // "getSources" will be replaced with "getMediaDevices"
        if (!MediaStreamTrack.getSources) {
            MediaStreamTrack.getSources = MediaStreamTrack.getMediaDevices;
        }

        // if still no "getSources"; it MUST be firefox!
        if (!MediaStreamTrack.getSources) {
            DetectRTC.hasMicrophone = 'unknown';
            DetectRTC.hasWebcam = 'unknown';
            return console.warn('Maybe you are using Firfox which has no support of getSources/getMediaDevices API yet!');
        }

        // loop over all audio/video input/output devices
        MediaStreamTrack.getSources(function (sources) {
            var result = {};

            for (var i = 0; i < sources.length; i++) {
                result[sources[i].kind] = true;
            }

            DetectRTC.hasMicrophone = result.audio;
            DetectRTC.hasWebcam = result.video;
        });
    }

    // detect node-webkit
    var isNodeWebkit = window.process && (typeof window.process == 'object') && window.process.versions && window.process.versions['node-webkit'];

    // is this a chromium browser (opera or chrome)
    var isChrome = !! navigator.webkitGetUserMedia;
    var chromeVersion = !! (!isChrome || navigator.mozGetUserMedia ) ? 0 : parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);

    DetectRTC.isWebRTCSupported = !! window.webkitRTCPeerConnection || !! window.mozRTCPeerConnection;
    DetectRTC.isAudioContextSupported = !! window.AudioContext || !! window.webkitAudioContext;
    DetectRTC.isScreenCapturingSupported = isChrome && chromeVersion >= 26 && (isNodeWebkit ? true : location.protocol == 'https:');
    DetectRTC.isSctpDataChannelsSupported = !! navigator.mozGetUserMedia || (isChrome && chromeVersion >= 25);
    DetectRTC.isRtpDataChannelsSupported = isChrome && chromeVersion >= 31;

    // check for microphone/webcam support!
    CheckDeviceSupport();
})();