// 2013, Muaz Khan  - https://github.com/muaz-khan
// MIT License      - https://www.webrtc-experiment.com/licence/
// Documentation    - https://github.com/muaz-khan/WebRTC-Experiment/blob/master/AudioVideoRecorder

if (!window.MediaRecorder) {
    var throwError = 'Support? Current/Latest Firefox Nightly (ONLY). Understood? Download from: http://nightly.mozilla.org/';
    alert(throwError);
    throw throwError;
}

console.log('<MediaRecorder> current sate:-', 'Only audio-relevant parts are supported in the moment.', 'i.e. No video recording.');
console.info('It is recommended to try RecordRTC!');

function AudioVideoRecorder(config) {
    var stream = config.stream;
    var interval = config.interval || 3000;
    var mimeType = config.mimeType || 'audio/ogg';
    var callback = config.onRecordedMedia;

    // https://wiki.mozilla.org/Gecko:MediaRecorder
    var mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorder.ondataavailable = function(e) {
        if (mediaRecorder.state == 'recording') {
            var blob = new window.Blob([e.data], {
                type: mimeType
            });

            if (callback) callback(blob);

            setTimeout(function() {
                mediaRecorder.requestData();
            }, interval);
        }
    };


    mediaRecorder.start(0);
    setTimeout(function() {
        mediaRecorder.requestData();
    }, interval);

    mediaRecorder.onstop = function() {
    };
    mediaRecorder.onerror = function(e) {
        console.error(e);
    };
}
