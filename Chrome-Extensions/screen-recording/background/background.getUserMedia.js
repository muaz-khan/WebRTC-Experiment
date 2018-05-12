var microphoneDevice = false;
var cameraDevice = false;

function captureCamera(callback) {
    var supported = navigator.mediaDevices.getSupportedConstraints();
    var constraints = {};

    if (enableCamera) {
        constraints.video = {
            width: {
                min: 640,
                ideal: 1920,
                max: 1920
            },
            height: {
                min: 400,
                ideal: 1080
            }
        };

        if (supported.aspectRatio) {
            constraints.video.aspectRatio = 1.777777778;
        }

        if (supported.frameRate) {
            constraints.video.frameRate = {
                ideal: 30
            };
        }

        if (cameraDevice && cameraDevice.length) {
            constraints.video.deviceId = cameraDevice;
        }
    }

    if (enableMicrophone) {
        constraints.audio = {};

        if (microphoneDevice && microphoneDevice.length) {
            constraints.audio.deviceId = microphoneDevice;
        }

        if (supported.echoCancellation) {
            constraints.audio.echoCancellation = true;
        }
    }

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        initVideoPlayer(stream);
        callback(stream);

        if(enableCamera && !enableScreen) {
            var win = window.open("video.html?src=" + URL.createObjectURL(stream),"_blank", "top=20,left=20,width=360,height=240");

            var timer = setInterval(function() {   
                if(win.closed) {  
                    clearInterval(timer);
                    stopScreenRecording();
                }  
            }, 1000); 
        }
    }).catch(function(error) {
        chrome.tabs.create({
            url: 'camera-mic.html'
        });
        setDefaults();
    });
}
