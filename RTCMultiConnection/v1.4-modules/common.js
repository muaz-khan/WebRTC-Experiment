// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

function swap(arr) {
    var swapped = [],
        length = arr.length;
    for (var i = 0; i < length; i++)
        if (arr[i] && arr[i] !== true)
            swapped[swapped.length] = arr[i];
    return swapped;
}

function merge(mergein, mergeto) {
    for (var item in mergeto) {
        mergein[item] = mergeto[item];
    }
    return mergein;
}

function getLength(obj) {
	var length = 0;
	for(var o in obj) length++;
	return length;
}

// is data-only session

function isData(session) {
    return !session.audio && !session.video && !session.screen && session.data;
}

// Get HTMLAudioElement/HTMLVideoElement accordingly

function getMediaElement(stream, session) {
    var mediaElement = document.createElement(session.audio && !session.video ? 'audio' : 'video');
    mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
    mediaElement.autoplay = true;
    mediaElement.controls = true;
    mediaElement.play();
    return mediaElement;
}

function mediaError(e) {
    var error = 'Either Microphone/Webcam access is denied.\r\n\r\n';
    error += 'For screen sharing; <HTTPS> is <temporarily> mandatory.\r\n\r\n';
    error += 'Also, make sure that you are not making multiple screen capturing requests and you have enabled the appropriate flag.';

    console.error(error, e);
}

// help mute/unmute streams individually

function getStream(stream) {
    return {
        stream: stream,
        stop: function() {
            var stream = this.stream;
            if (stream && stream.stop)
                stream.stop();
        },
        mute: function(session) {
            this._private(session, true);
        },
        unmute: function(session) {
            this._private(session, false);
        },
        _private: function(session, enabled) {
            var stream = this.stream;

            session = session || {
                audio: true,
                video: true
            };

            if (session.audio) {
                var audioTracks = stream.getAudioTracks()[0];
                if (audioTracks)
                    audioTracks.enabled = !enabled;
            }

            if (session.video) {
                var videoTracks = stream.getVideoTracks()[0];
                if (videoTracks)
                    videoTracks.enabled = !enabled;
            }
        }
    };
}
