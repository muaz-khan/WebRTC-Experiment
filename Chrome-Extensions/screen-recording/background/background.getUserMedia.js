var microphoneDevice = false;
var cameraDevice = false;

function captureCamera(callback, defaultDevices) {
    var supported = navigator.mediaDevices.getSupportedConstraints();
    var constraints = {
        audio: true,
        video: true
    };

    if (enableCamera && !defaultDevices) {
        if(videoResolutions !== 'default' && videoResolutions.length) {
            var width = videoResolutions.split('x')[0];
            var height = videoResolutions.split('x')[1];

            if(width && height) {
                constraints.video = {
                    width: {
                        ideal: width
                    },
                    height: {
                        ideal: height
                    }
                };
            };
        }

        if (supported.aspectRatio) {
            constraints.video.aspectRatio = 1.777777778;
        }

        if (supported.frameRate && videoMaxFrameRates) {
            constraints.video.frameRate = {
                ideal: parseInt(videoMaxFrameRates)
            };
        }

        if (cameraDevice && typeof cameraDevice === 'string') {
            constraints.video.deviceId = cameraDevice;
        }
    }

    if (enableMicrophone && !defaultDevices) {
        constraints.audio = {};

        if (microphoneDevice && typeof microphoneDevice === 'string') {
            constraints.audio.deviceId = microphoneDevice;
        }

        if (supported.echoCancellation) {
            constraints.audio.echoCancellation = true;
        }
    }

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        initVideoPlayer(stream);
        callback(stream);

        if (enableCamera && !enableScreen) {
            var win = window.open("video.html", "_blank", "top=0,left=0,width=" + screen.width + ",height=" + screen.height);

            var timer = setInterval(function() {
                if (win.closed) {
                    clearInterval(timer);
                    stopScreenRecording();
                }
            }, 1000);
        }
    }).catch(function(error) {
        if(!defaultDevices) {
            // retry with default devices
            captureCamera(callback, true);
            return;
        }

        chrome.tabs.create({
            url: 'camera-mic.html'
        });
        setDefaults();
    });
}
