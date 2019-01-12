function captureDesktop() {
    if (isRecording) {
        stopScreenRecording();
        return;
    }

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
        return;
    }

    chrome.browserAction.setIcon({
        path: 'images/main-icon.png'
    });

    if (enableTabCaptureAPI) {
        captureTabUsingTabCapture();
        return;
    }

    var screenSources = ['screen', 'window', 'audio'];

    if (enableSpeakers === false) {
        screenSources = ['screen', 'window'];
    }

    chrome.desktopCapture.chooseDesktopMedia(screenSources, onAccessApproved);
}

function onAccessApproved(chromeMediaSourceId, opts) {
    if (!chromeMediaSourceId || !chromeMediaSourceId.toString().length) {
        setDefaults();
        chrome.runtime.reload();
        return;
    }

    var constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: chromeMediaSourceId
            },
            optional: []
        }
    };

    if (videoMaxFrameRates && videoMaxFrameRates.toString().length) {
        videoMaxFrameRates = parseInt(videoMaxFrameRates);

        // 30 fps seems max-limit in Chrome?
        if (videoMaxFrameRates /* && videoMaxFrameRates <= 30 */ ) {
            constraints.video.maxFrameRate = videoMaxFrameRates;
        }
    }

    constraints.video.mandatory.maxWidth = 3840;
    constraints.video.mandatory.maxHeight = 2160;

    constraints.video.mandatory.minWidth = 3840;
    constraints.video.mandatory.minHeight = 2160;

    if (opts.canRequestAudioTrack === true) {
        constraints.audio = {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: chromeMediaSourceId,
                echoCancellation: true
            },
            optional: []
        };
    }

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        if(enableSpeakers && !enableScreen) {
            var screenOnly = new MediaStream();
            getTracks(stream, 'video').forEach(function(track) {
                screenOnly.addTrack(track);

                // remove video track, because we are gonna record only speakers
                stream.removeTrack(track);
            });

            initVideoPlayer(screenOnly);
            addStreamStopListener(screenOnly, function() {
                stopScreenRecording();
            });

            // alert('You can stop recording only using extension icon. Whenever you are done, click extension icon to stop the recording.');
        }
        else {
            addStreamStopListener(stream, function() {
                stopScreenRecording();
            });
        }

        initVideoPlayer(stream);
        gotStream(stream);
    }).catch(function(error) {
        alert('Unable to capture screen using:\n' + JSON.stringify(constraints, null, '\t') + '\n\n' + error);
        setDefaults();
        chrome.runtime.reload();
    });
}
