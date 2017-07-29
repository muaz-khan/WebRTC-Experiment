chrome.storage.sync.set({
    isRecording: 'false' // FALSE
});

chrome.browserAction.setIcon({
    path: 'images/main-icon.png'
});

function gotStream(stream) {
    var options = {
        type: 'video',
        disableLogs: false,
        recorderType: MediaStreamRecorder // StereoAudioRecorder
    };

    if(!videoCodec) {
        videoCodec = 'Default'; // prefer VP9 by default
    }

    if (videoCodec) {
        if (videoCodec === 'Default') {
            options.mimeType = 'video/webm\;codecs=vp9';
        }

        if (videoCodec === 'VP8') {
            options.mimeType = 'video/webm\;codecs=vp8';
        }

        if (videoCodec === 'VP9') {
            options.mimeType = 'video/webm\;codecs=vp9';
        }

        if (videoCodec === 'H264') {
            if (isMimeTypeSupported('video/webm\;codecs=h264')) {
                options.mimeType = 'video/webm\;codecs=h264';
            }
        }

        if (videoCodec === 'MKV') {
            if (isMimeTypeSupported('video/x-matroska;codecs=avc1')) {
                options.mimeType = 'video/x-matroska;codecs=avc1';
            }
        }
    }

    if (bitsPerSecond) {
        bitsPerSecond = parseInt(bitsPerSecond);
        if (!bitsPerSecond || bitsPerSecond < 100) {
            bitsPerSecond = 8000000000; // 1 GB /second
        }
    }

    if (bitsPerSecond) {
        options.bitsPerSecond = bitsPerSecond;
    }

    if (cameraStream && cameraStream.getAudioTracks().length) {
        cameraStream.getAudioTracks().forEach(function(track) {
            cameraStream.removeTrack(track);
            stream.addTrack(track);
        });
    }

    // fix https://github.com/muaz-khan/RecordRTC/issues/281
    options.ignoreMutedMedia = false;

    if (cameraStream && cameraStream.getVideoTracks().length) {
        // adjust video on top over screen

        // on faster systems (i.e. 4MB or higher RAM):
        // screen: 3840x2160 
        // camera: 1280x720
        stream.width = screen.width;
        stream.height = screen.height;
        stream.fullcanvas = true; // screen should be full-width (wider/full-screen)

        // camera positioning + width/height
        cameraStream.width = parseInt((20 / 100) * stream.width);
        cameraStream.height = parseInt((20 / 100) * stream.height);
        cameraStream.top = stream.height - cameraStream.height;
        cameraStream.left = stream.width - cameraStream.width;

        // frame-rates
        options.frameInterval = 1;

        recorder = new MultiStreamRecorder([cameraStream, stream], options);
        recorder.streams = [stream, cameraStream];
    } else {
        recorder = new MediaStreamRecorder(stream, options);
        recorder.streams = [stream];
    }

    recorder.record();

    isRecording = true;
    onRecording();

    recorder.streams[0].onended = function() {
        if (recorder && recorder.streams.length) {
            recorder.streams[0].onended = null;
        }

        stopScreenRecording();
    };

    if(recorder.streams[0].getVideoTracks().length) {
        recorder.streams[0].getVideoTracks().forEach(function(track){
            track.onended = function() {
                if(!recorder) return;
                var stream = recorder.streams[0];
                if(!stream || typeof stream.onended !== 'function') return;

                stream.onended();
            };
        });
    }

    initialTime = Date.now()
    timer = setInterval(checkTime, 100);
}

function stopScreenRecording() {
    isRecording = false;

    recorder.stop(function() {
        var mimeType = 'video/webm';
        var fileExtension = 'webm';

        if (videoCodec === 'H264') {
            if (isMimeTypeSupported('video/webm\;codecs=h264')) {
                mimeType = 'video/mp4';
                fileExtension = 'mp4';
            }
        }

        if (videoCodec === 'MKV') {
            if (isMimeTypeSupported('video/x-matroska;codecs=avc1')) {
                mimeType = 'video/mkv';
                fileExtension = 'mkv';
            }
        }

        var file = new File([recorder ? recorder.blob : ''], getFileName(fileExtension), {
            type: mimeType
        });

        // initialTime = initialTime || Date.now();
        // var timeDifference = Date.now() - initialTime;
        // var formatted = convertTime(timeDifference);
        // file.duration = formatted;

        DiskStorage.Store({
            key: 'latest-file',
            value: file
        }, function(success) {
            if(success) {
                chrome.tabs.create({
                    url: 'preview.html'
                });
            }
        });

        // invokeSaveAsDialog(file, file.name);

        setTimeout(function() {
            setDefaults();
            // chrome.runtime.reload();            
        }, 1000);

        try {
            videoPlayers.forEach(function(player) {
                player.src = null;
            });
            videoPlayers = [];
        } catch (e) {}

        // for dropdown.js
        chrome.storage.sync.set({
            isRecording: 'false' // FALSE
        });
    });

    if (timer) {
        clearTimeout(timer);
    }
    setBadgeText('');

    chrome.browserAction.setTitle({
        title: 'Record Your Screen, Tab or Camera'
    });
}

function setDefaults() {
    chrome.browserAction.setIcon({
        path: 'images/main-icon.png'
    });

    if (recorder && recorder.streams) {
        recorder.streams.forEach(function(stream, idx) {
            stream.getTracks().forEach(function(track) {
                track.stop();
            });

            if (idx == 0 && typeof stream.onended === 'function') {
                stream.onended();
            }
        });

        recorder.streams = null;
    }

    recorder = null;
    isRecording = false;
    imgIndex = 0;

    bitsPerSecond = 0;
    enableTabCaptureAPI = false;
    enableScreen = true;
    enableMicrophone = false;
    enableCamera = false;
    cameraStream = false;
    enableSpeakers = true;
    videoCodec = 'Default';
    videoMaxFrameRates = '';
    isRecordingVOD = false;
    startedVODRecordedAt = (new Date).getTime();

    // for dropdown.js
    chrome.storage.sync.set({
        isRecording: 'false' // FALSE
    });
}

function getUserConfigs() {
    chrome.storage.sync.get(null, function(items) {
        if (items['bitsPerSecond'] && items['bitsPerSecond'].toString().length && items['bitsPerSecond'] !== 'default') {
            bitsPerSecond = parseInt(items['bitsPerSecond']);
        }

        if (items['enableTabCaptureAPI']) {
            enableTabCaptureAPI = items['enableTabCaptureAPI'] == 'true';
        }

        if (items['enableCamera']) {
            enableCamera = items['enableCamera'] == 'true';
        }

        if (items['enableSpeakers']) {
            enableSpeakers = items['enableSpeakers'] == 'true';
        }

        if (items['enableScreen']) {
            enableScreen = items['enableScreen'] == 'true';
        }

        if (items['enableMicrophone']) {
            enableMicrophone = items['enableMicrophone'] == 'true';
        }

        if (items['videoCodec']) {
            videoCodec = items['videoCodec'];
        }

        if (items['videoMaxFrameRates'] && items['videoMaxFrameRates'].toString().length) {
            videoMaxFrameRates = parseInt(items['videoMaxFrameRates']);
        }

        if (items['microphone']) {
            microphoneDevice = items['microphone'];
        }

        if (items['camera']) {
            cameraDevice = items['camera'];
        }

        if (enableMicrophone || enableCamera) {
            if (!enableScreen) {
                captureCamera(function(stream) {
                    gotStream(stream);
                });
                return;
            }

            captureCamera(function(stream) {
                cameraStream = stream;
                captureDesktop();
            });
            return;
        }

        captureDesktop();
    });
}

function stopVODRecording() {
    isRecordingVOD = false;
}
