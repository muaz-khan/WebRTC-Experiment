// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/blob/master/AudioVideoRecorder

if (!window.MediaRecorder) {
    var throwError = 'Support? Current/Latest Firefox Nightly (ONLY). Understood? Download from: http://nightly.mozilla.org/';
    alert(throwError);
    throw throwError;
}

console.log('<MediaRecorder> current sate:-', 'Only audio-relevant parts are supported in the moment.', 'i.e. No video recording.');

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

            mediaRecorder.stop();
        }
    };

    try {
        // void start(optional long timeSlice)
        mediaRecorder.start(interval);
    } catch(e) {
        console.error(e);
    }

    mediaRecorder.onstop = function() {
        if (mediaRecorder.state == 'inactive') {
            mediaRecorder.start(interval);
            AudioVideoRecorder(config);
        }
    };
}
