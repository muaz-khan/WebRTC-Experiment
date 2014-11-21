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

    // tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
    var mediaConstraints = options.mediaConstraints || {};
    var videoConstraints = typeof mediaConstraints.video === 'boolean' ? mediaConstraints.video : mediaConstraints.video || mediaConstraints;
    var audioConstraints = typeof mediaConstraints.audio === 'boolean' ? mediaConstraints.audio : mediaConstraints.audio || defaultConstraints;

    var n = navigator;
    var hints = options.constraints || {
        audio: defaultConstraints,
        video: defaultConstraints
    };

    if (hints.video && hints.video.mozMediaSource) {
        // "mozMediaSource" is redundant
        // need to check "mediaSource" instead.
        videoConstraints = {};
    }

    if (hints.video === true) {
        hints.video = defaultConstraints;
    }

    if (hints.audio === true) {
        hints.audio = defaultConstraints;
    }

    // connection.mediaConstraints.audio = false;
    if (typeof audioConstraints === 'boolean' && hints.audio) {
        hints.audio = audioConstraints;
    }

    // connection.mediaConstraints.video = false;
    if (typeof videoConstraints === 'boolean' && hints.video) {
        hints.video = videoConstraints;
    }

    // connection.mediaConstraints.audio.mandatory = {prop:true};
    var audioMandatoryConstraints = audioConstraints.mandatory;
    if (!isEmpty(audioMandatoryConstraints)) {
        hints.audio.mandatory = merge(hints.audio.mandatory, audioMandatoryConstraints);
    }

    if (hints.video !== false) {
        // connection.media.min(320,180);
        // connection.media.max(1920,1080);
        var videoMandatoryConstraints = videoConstraints.mandatory;
        if (videoMandatoryConstraints) {
            var mandatory = {};

            if (videoMandatoryConstraints.minWidth) {
                mandatory.minWidth = videoMandatoryConstraints.minWidth;
            }

            if (videoMandatoryConstraints.minHeight) {
                mandatory.minHeight = videoMandatoryConstraints.minHeight;
            }

            if (videoMandatoryConstraints.maxWidth) {
                mandatory.maxWidth = videoMandatoryConstraints.maxWidth;
            }

            if (videoMandatoryConstraints.maxHeight) {
                mandatory.maxHeight = videoMandatoryConstraints.maxHeight;
            }

            if (videoMandatoryConstraints.minAspectRatio) {
                mandatory.minAspectRatio = videoMandatoryConstraints.minAspectRatio;
            }

            if (videoMandatoryConstraints.maxFrameRate) {
                mandatory.maxFrameRate = videoMandatoryConstraints.maxFrameRate;
            }

            if (videoMandatoryConstraints.minFrameRate) {
                mandatory.minFrameRate = videoMandatoryConstraints.minFrameRate;
            }

            if (mandatory.minWidth && mandatory.minHeight) {
                // http://goo.gl/IZVYsj
                var allowed = ['1920:1080', '1280:720', '960:720', '640:360', '640:480', '320:240', '320:180'];

                if (allowed.indexOf(mandatory.minWidth + ':' + mandatory.minHeight) === -1 ||
                    allowed.indexOf(mandatory.maxWidth + ':' + mandatory.maxHeight) === -1) {
                    error('The min/max width/height constraints you passed "seems" NOT supported.', toStr(mandatory));
                }

                if (mandatory.minWidth > mandatory.maxWidth || mandatory.minHeight > mandatory.maxHeight) {
                    error('Minimum value must not exceed maximum value.', toStr(mandatory));
                }

                if (mandatory.minWidth >= 1280 && mandatory.minHeight >= 720) {
                    warn('Enjoy HD video! min/' + mandatory.minWidth + ':' + mandatory.minHeight + ', max/' + mandatory.maxWidth + ':' + mandatory.maxHeight);
                }
            }

            hints.video.mandatory = merge(hints.video.mandatory, mandatory);
        }

        if (videoMandatoryConstraints) {
            hints.video.mandatory = merge(hints.video.mandatory, videoMandatoryConstraints);
        }

        // videoConstraints.optional = [{prop:true}];
        if (videoConstraints.optional && videoConstraints.optional instanceof Array && videoConstraints.optional.length) {
            hints.video.optional = hints.video.optional ? hints.video.optional.concat(videoConstraints.optional) : videoConstraints.optional;
        }

        if (hints.video.mandatory && !isEmpty(hints.video.mandatory) && connection._mediaSources.video) {
            hints.video.optional.forEach(function(video, index) {
                if (video.sourceId === connection._mediaSources.video) {
                    delete hints.video.optional[index];
                }
            });

            hints.video.optional = swap(hints.video.optional);

            hints.video.optional.push({
                sourceId: connection._mediaSources.video
            });
        }

        if (hints.video && !hints.video.mozMediaSource && hints.video.optional && hints.video.mandatory) {
            if (!hints.video.optional.length && isEmpty(hints.video.mandatory)) {
                hints.video = true;
            }
        }
    }

    // audioConstraints.optional = [{prop:true}];
    if (audioConstraints.optional && audioConstraints.optional instanceof Array && audioConstraints.optional.length) {
        hints.audio.optional = hints.audio.optional ? hints.audio.optional.concat(audioConstraints.optional) : audioConstraints.optional;
    }

    if (hints.audio.mandatory && !isEmpty(hints.audio.mandatory) && connection._mediaSources.audio) {
        hints.audio.optional.forEach(function(audio, index) {
            if (audio.sourceId === connection._mediaSources.audio) {
                delete hints.audio.optional[index];
            }
        });

        hints.audio.optional = swap(hints.audio.optional);

        hints.audio.optional.push({
            sourceId: connection._mediaSources.audio
        });
    }

    if (isMobileDevice) {
        // Android fails for some constraints
        // so need to force {audio:true,video:true}
        hints = {
            audio: !!hints.audio,
            video: !!hints.video
        };
    }

    // connection.mediaConstraints always overrides constraints
    // passed from "captureUserMedia" function.
    // todo: need to verify all possible situations
    log('invoked getUserMedia with constraints:', toStr(hints));

    // easy way to match 
    var idInstance = JSON.stringify(hints);

    function streaming(stream, returnBack, streamid) {
        if (!streamid) {
            streamid = getRandomString();
        }

        // localStreams object will store stream
        // until it is removed using native-stop method.
        connection.localStreams[streamid] = stream;

        var video = options.video;
        if (video) {
            video[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
            video.play();
        }

        options.onsuccess(stream, returnBack, idInstance, streamid);
        currentUserMediaRequest.streams[idInstance] = {
            stream: stream,
            streamid: streamid
        };
        currentUserMediaRequest.mutex = false;

        if (currentUserMediaRequest.queueRequests.length) {
            getUserMedia(currentUserMediaRequest.queueRequests.shift());
        }
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
