var defaultConstraints = true;

/* by @FreCap pull request #41 */
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

    var connection = options.connection;

    var hints = connection.mediaConstraints;

    // connection.mediaConstraints always overrides constraints
    // passed from "captureUserMedia" function.
    // todo: need to verify all possible situations
    log('invoked getUserMedia with constraints:', toStr(hints));

    // easy way to match
    var idInstance = JSON.stringify(hints);

    function streaming(stream, returnBack, streamid) {
        if (!streamid) streamid = getRandomString();

        // localStreams object will store stream
        // until it is removed using native-stop method.
        connection.localStreams[streamid] = stream;

        var video = options.video;
        if (video) {
            video.srcObject = stream;
        }

        options.onsuccess(stream, returnBack, idInstance, streamid);
        currentUserMediaRequest.streams[idInstance] = {
            stream: stream,
            streamid: streamid
        };
        currentUserMediaRequest.mutex = false;
        if (currentUserMediaRequest.queueRequests.length)
            getUserMedia(currentUserMediaRequest.queueRequests.shift());
    }

    if (currentUserMediaRequest.streams[idInstance]) {
        streaming(currentUserMediaRequest.streams[idInstance].stream, true, currentUserMediaRequest.streams[idInstance].streamid);
    } else {
        navigator.mediaDevices.getUserMedia(hints).then(streaming).catch(function(error) {
            options.onerror(error, hints);
        });
    }
}
