var defaultConstraints = {
    mandatory: {},
    optional: []
};

/* by @FreCap pull request #41 */
var currentUserMediaRequest = {
    streams: [],
    mutex: false,
    queueRequests: []
};

function getUserMedia(options) {
    if (isPluginRTC) {
        if (!Plugin.getUserMedia) {
            setTimeout(function() {
                getUserMedia(options);
            }, 1000);
            return;
        }

        return Plugin.getUserMedia(options.constraints || {
            audio: true,
            video: true
        }, options.onsuccess, options.onerror);
    }

    if (currentUserMediaRequest.mutex === true) {
        currentUserMediaRequest.queueRequests.push(options);
        return;
    }
    currentUserMediaRequest.mutex = true;

    var connection = options.connection;

    var n = navigator;
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
            video[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : (window.URL || window.webkitURL).createObjectURL(stream);
            video.play();
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
        n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;

        // http://goo.gl/eETIK4
        n.getMedia(hints, streaming, function(error) {
            options.onerror(error, hints);
        });
    }
}
