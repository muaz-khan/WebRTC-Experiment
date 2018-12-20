var microphoneDevice = false;
var cameraDevice = false;

function captureCamera(callback, defaultDevices) {
    var supported = navigator.mediaDevices.getSupportedConstraints();
    var constraints = {
        audio: !!enableMicrophone,
        video: !!enableCamera
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

    if(!constraints.audio && !constraints.video) {
        // todo: should we display alert?
        constraints = {
            audio: true,
            video: true
        };
    }

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        initVideoPlayer(stream);
        callback(stream);

        if (enableCamera && !enableScreen && openCameraPreviewDuringRecording) {
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

        false && chrome.tabs.create({
            url: 'camera-mic.html'
        });

        var popup_width = screen.width - parseInt(screen.width / 3);
        var popup_height = screen.height - parseInt(screen.height / 3);
        chrome.windows.create({
            url: 'camera-mic.html',
            type: 'popup',
            width: popup_width,
            height: popup_height,
            top: parseInt((screen.height / 2) - (popup_height / 2)),
            left: parseInt((screen.width / 2) - (popup_width / 2)),
            focused: true
        });

        // setDefaults();
    });
}
