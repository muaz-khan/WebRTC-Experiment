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

// allow users to manage this object (to support re-capturing of screen/etc.)
window.currentUserMediaRequest = {
    streams: [],
    mutex: false,
    queueRequests: [],
    remove: function(idInstance) {
        this.mutex = false;

        var stream = this.streams[idInstance];
        if (!stream) {
            return;
        }

        stream = stream.stream;

        var options = stream.currentUserMediaRequestOptions;

        if (this.queueRequests.indexOf(options)) {
            delete this.queueRequests[this.queueRequests.indexOf(options)];
            this.queueRequests = removeNullEntries(this.queueRequests);
        }

        this.streams[idInstance].stream = null;
        delete this.streams[idInstance];
    }
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

        var streamEndedEvent = 'ended';

        if ('oninactive' in stream) {
            streamEndedEvent = 'inactive';
        }
        stream.addEventListener(streamEndedEvent, function() {
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

        // callback
        options.onGettingLocalMedia(stream, returnBack);
    }

    if (currentUserMediaRequest.streams[idInstance]) {
        streaming(currentUserMediaRequest.streams[idInstance].stream, true);
    } else {
        var isBlackBerry = !!(/BB10|BlackBerry/i.test(navigator.userAgent || ''));
        if (isBlackBerry || typeof navigator.mediaDevices === 'undefined' || typeof navigator.mediaDevices.getUserMedia !== 'function') {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            navigator.getUserMedia(options.localMediaConstraints, function(stream) {
                stream.streamid = stream.streamid || stream.id || getRandomString();
                stream.idInstance = idInstance;
                streaming(stream);
            }, function(error) {
                options.onLocalMediaError(error, options.localMediaConstraints);
            });
            return;
        }

        if (typeof navigator.mediaDevices === 'undefined') {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            var getUserMediaSuccess = function() {};
            var getUserMediaFailure = function() {};

            var getUserMediaStream, getUserMediaError;
            navigator.mediaDevices = {
                getUserMedia: function(hints) {
                    navigator.getUserMedia(hints, function(getUserMediaSuccess) {
                        getUserMediaSuccess(stream);
                        getUserMediaStream = stream;
                    }, function(error) {
                        getUserMediaFailure(error);
                        getUserMediaError = error;
                    });

                    return {
                        then: function(successCB) {
                            if (getUserMediaStream) {
                                successCB(getUserMediaStream);
                                return;
                            }

                            getUserMediaSuccess = successCB;

                            return {
                                then: function(failureCB) {
                                    if (getUserMediaError) {
                                        failureCB(getUserMediaError);
                                        return;
                                    }

                                    getUserMediaFailure = failureCB;
                                }
                            }
                        }
                    }
                }
            };
        }

        if (options.localMediaConstraints.isScreen === true) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia(options.localMediaConstraints).then(function(stream) {
                    stream.streamid = stream.streamid || stream.id || getRandomString();
                    stream.idInstance = idInstance;

                    streaming(stream);
                }).catch(function(error) {
                    options.onLocalMediaError(error, options.localMediaConstraints);
                });
            } else if (navigator.getDisplayMedia) {
                navigator.getDisplayMedia(options.localMediaConstraints).then(function(stream) {
                    stream.streamid = stream.streamid || stream.id || getRandomString();
                    stream.idInstance = idInstance;

                    streaming(stream);
                }).catch(function(error) {
                    options.onLocalMediaError(error, options.localMediaConstraints);
                });
            } else {
                throw new Error('getDisplayMedia API is not availabe in this browser.');
            }
            return;
        }

        navigator.mediaDevices.getUserMedia(options.localMediaConstraints).then(function(stream) {
            stream.streamid = stream.streamid || stream.id || getRandomString();
            stream.idInstance = idInstance;

            streaming(stream);
        }).catch(function(error) {
            options.onLocalMediaError(error, options.localMediaConstraints);
        });
    }
}
