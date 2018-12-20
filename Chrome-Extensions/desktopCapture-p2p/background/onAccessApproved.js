function onAccessApproved(chromeMediaSourceId, opts) {
    if (!chromeMediaSourceId) {
        setDefaults();
        return;
    }

    var resolutions = opts.resolutions;

    chrome.storage.sync.get(null, function(items) {
        constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: chromeMediaSourceId,
                    maxWidth: resolutions.maxWidth,
                    maxHeight: resolutions.maxHeight,
                    minWidth: resolutions.minWidth,
                    minHeight: resolutions.minHeight,
                    minAspectRatio: getAspectRatio(resolutions.maxWidth, resolutions.maxHeight),
                    maxAspectRatio: getAspectRatio(resolutions.maxWidth, resolutions.maxHeight),
                    minFrameRate: 64,
                    maxFrameRate: 128
                },
                optional: []
            }
        };

        if (opts.canRequestAudioTrack === true) {
            constraints.audio = {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: chromeMediaSourceId,
                    echoCancellation: true
                },
                optional: [{
                    googDisableLocalEcho: false // https://www.chromestatus.com/feature/5056629556903936
                }]
            };
        }

        navigator.webkitGetUserMedia(constraints, function(screenStream) {
            var win;
            addStreamStopListener(screenStream, function() {
                if (win && !win.closed) {
                    win.close();
                } else {
                    captureDesktop();
                }
            });

            if (opts.stream) {
                if (enableCamera && opts.stream.getVideoTracks().length) {
                    var cameraStream = opts.stream;

                    screenStream.fullcanvas = true;
                    screenStream.width = screen.width; // or 3840
                    screenStream.height = screen.height; // or 2160 

                    cameraStream.width = parseInt((15 / 100) * screenStream.width);
                    cameraStream.height = parseInt((15 / 100) * screenStream.height);
                    cameraStream.top = screenStream.height - cameraStream.height - 20;
                    cameraStream.left = screenStream.width - cameraStream.width - 20;

                    var mixer = new MultiStreamsMixer([screenStream, cameraStream]);

                    mixer.frameInterval = 1;
                    mixer.startDrawingFrames();

                    screenStream = mixer.getMixedStream();
                    // win = openVideoPreview(screenStream);
                } else if (enableMicrophone && opts.stream.getAudioTracks().length) {
                    var speakers = new MediaStream();
                    screenStream.getAudioTracks().forEach(function(track) {
                        speakers.addTrack(track);
                        screenStream.removeTrack(track);
                    });

                    var mixer = new MultiStreamsMixer([speakers, opts.stream]);
                    mixer.getMixedStream().getAudioTracks().forEach(function(track) {
                        screenStream.addTrack(track);
                    });

                    screenStream.getVideoTracks().forEach(function(track) {
                        track.onended = function() {
                            if (win && !win.closed) {
                                win.close();
                            } else {
                                captureDesktop();
                            }
                        };
                    })
                }
            }

            gotStream(screenStream);
        }, getUserMediaError);
    });
}
