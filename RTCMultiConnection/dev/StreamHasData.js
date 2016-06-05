// StreamHasData.js

var StreamHasData = (function() {
    function checkIfStreamHasData(mediaElement, successCallback) {
        // chrome for android may have some features missing
        if (DetectRTC.isMobileDevice) {
            return successCallback('success');
        }

        if (!mediaElement.numberOfTimes) {
            mediaElement.numberOfTimes = 0;
        }

        mediaElement.numberOfTimes++;

        if (!(mediaElement.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || mediaElement.paused || mediaElement.currentTime <= 0)) {
            return successCallback('success');
        }

        if (mediaElement.numberOfTimes >= 60) { // wait 60 seconds while video is delivered!
            return successCallback(false);
        }

        setTimeout(function() {
            checkIfStreamHasData(mediaElement, successCallback);
        }, 900);
    }

    return {
        check: function(stream, callback) {
            if (stream instanceof HTMLMediaElement) {
                checkIfStreamHasData(stream, callback);
                return;
            }

            if (stream instanceof MediaStream) {
                var mediaElement = document.createElement('video');
                mediaElement.muted = true;
                mediaElement.src = URL.createObjectURL(stream);
                mediaElement.style.display = 'none';
                document.body.appendChild(mediaElement);

                checkIfStreamHasData(mediaElement, callback);
            }
        }
    };
})();
