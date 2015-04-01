// getUserMedia
var currentUserMediaRequest = {
    streams: [],
    mutex: false,
    queueRequests: []
};

function getUserMedia(options) {
    if (currentUserMediaRequest.mutex === true) {
        currentUserMediaRequest.queueRequests.push(options);
        return;
    }
    currentUserMediaRequest.mutex = true;

    // easy way to match 
    var idInstance = JSON.stringify(options.localMediaConstraints);

    function streaming(stream, returnBack) {
        options.onGettingLocalMedia(stream, returnBack);

        stream.addEventListener('ended', function() {
            delete currentUserMediaRequest.streams[idInstance];
            
            currentUserMediaRequest.mutex = false;
            if(currentUserMediaRequest.queueRequests.indexOf(options)) {
                delete currentUserMediaRequest.queueRequests[currentUserMediaRequest.queueRequests.indexOf(options)];
                currentUserMediaRequest.queueRequests = removeNullEntries(currentUserMediaRequest.queueRequests);
            }
        }, false);

        currentUserMediaRequest.streams[idInstance] = {
            stream: stream
        };
        currentUserMediaRequest.mutex = false;

        if (currentUserMediaRequest.queueRequests.length) {
            getUserMedia(currentUserMediaRequest.queueRequests.shift());
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
        
        if(!DetectRTC.hasMicrophone) {
            options.localMediaConstraints.audio = false;
        }
        
        if(!DetectRTC.hasWebcam) {
            options.localMediaConstraints.video = false;
        }
        
        navigator.getMedia(options.localMediaConstraints, function(stream) {
            stream.streamid = stream.id || getRandomString();
            if(!stream.stop) {
                stream.stop = function() {};
            }
            streaming(stream);
        }, function(error) {
            options.onLocalMediaError(error, options.localMediaConstraints);
        });
    }
}
