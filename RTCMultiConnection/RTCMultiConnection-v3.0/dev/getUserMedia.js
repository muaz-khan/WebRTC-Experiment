// getUserMediaHandler.js

function setStreamType(constraints, stream) {
    if (constraints.mandatory && constraints.mandatory.chromeMediaSource) {
        stream.isScreen = true;
    } else if (constraints.mozMediaSource || constraints.mediaSource) {
        stream.isScreen = true;
    } else if (constraints.video) {
        stream.isVideo = true;
    } else if (constraints.audio) {
        stream.isAudio = true;
    }
}
var currentUserMediaRequest = {
    streams: [],
    mutex: false,
    queueRequests: []
};

function getUserMediaHandler(options) {
    if (currentUserMediaRequest.mutex === true) {
        currentUserMediaRequest.queueRequests.push(options);
        return;
    }
    currentUserMediaRequest.mutex = true;

    // easy way to match 
    var idInstance = JSON.stringify(options.localMediaConstraints);

    function streaming(stream, returnBack) {
        setStreamType(options.localMediaConstraints, stream);
        options.onGettingLocalMedia(stream, returnBack);

        stream.addEventListener('ended', function() {
            delete currentUserMediaRequest.streams[idInstance];

            currentUserMediaRequest.mutex = false;
            if (currentUserMediaRequest.queueRequests.indexOf(options)) {
                delete currentUserMediaRequest.queueRequests[currentUserMediaRequest.queueRequests.indexOf(options)];
                currentUserMediaRequest.queueRequests = removeNullEntries(currentUserMediaRequest.queueRequests);
            }
        }, false);

        currentUserMediaRequest.streams[idInstance] = {
            stream: stream
        };
        currentUserMediaRequest.mutex = false;

        if (currentUserMediaRequest.queueRequests.length) {
            getUserMediaHandler(currentUserMediaRequest.queueRequests.shift());
        }
    }

    if (currentUserMediaRequest.streams[idInstance]) {
        streaming(currentUserMediaRequest.streams[idInstance].stream, true);
    } else {
        if (isPluginRTC) {
            var mediaElement = document.createElement('video');
            Plugin.getUserMedia({
                audio: true,
                video: true
            }, function(stream) {
                stream.streamid = stream.id || getRandomString();
                streaming(stream);
            }, function(error) {});

            return;
        }

        navigator.getMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        if (typeof DetectRTC !== 'undefined') {
            if (!DetectRTC.hasMicrophone) {
                options.localMediaConstraints.audio = false;
            }

            if (!DetectRTC.hasWebcam) {
                options.localMediaConstraints.video = false;
            }
        }

        navigator.getMedia(options.localMediaConstraints, function(stream) {
            stream.streamid = stream.id || getRandomString();
            if (!stream.stop) {
                stream.stop = function() {
                    fireEvent(stream, 'ended');
                };
            }
            streaming(stream);
        }, function(error) {
            options.onLocalMediaError(error, options.localMediaConstraints);
        });
    }
}
