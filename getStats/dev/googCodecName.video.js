getStatsParser.checkVideoTracks = function(result) {
    if (result.mediaType !== 'video') return;

    var sendrecvType = result.id.split('_').pop();
    if (result.isRemote === true) {
        sendrecvType = 'recv';
    }
    if (result.isRemote === false) {
        sendrecvType = 'send';
    }

    if (!sendrecvType) return;

    if (getStatsResult.video[sendrecvType].codecs.indexOf(result.googCodecName || 'VP8') === -1) {
        getStatsResult.video[sendrecvType].codecs.push(result.googCodecName || 'VP8');
    }

    if (!!result.bytesSent) {
        var kilobytes = 0;
        if (!getStatsResult.internal.video[sendrecvType].prevBytesSent) {
            getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBytesSent;
        getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;

        kilobytes = bytes / 1024;

        getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult.video.bytesSent = kilobytes.toFixed(1);
    }

    if (!!result.bytesReceived) {
        var kilobytes = 0;
        if (!getStatsResult.internal.video[sendrecvType].prevBytesReceived) {
            getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal.video[sendrecvType].prevBytesReceived;
        getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;

        kilobytes = bytes / 1024;
        // getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult.video.bytesReceived = kilobytes.toFixed(1);
    }

    if (result.googFrameHeightReceived && result.googFrameWidthReceived) {
        getStatsResult.resolutions[sendrecvType].width = result.googFrameWidthReceived;
        getStatsResult.resolutions[sendrecvType].height = result.googFrameHeightReceived;
    }

    if (result.googFrameHeightSent && result.googFrameWidthSent) {
        getStatsResult.resolutions[sendrecvType].width = result.googFrameWidthSent;
        getStatsResult.resolutions[sendrecvType].height = result.googFrameHeightSent;
    }

    if (result.googTrackId && getStatsResult.video[sendrecvType].tracks.indexOf(result.googTrackId) === -1) {
        getStatsResult.video[sendrecvType].tracks.push(result.googTrackId);
    }

    if (result.framerateMean) {
        getStatsResult.bandwidth.framerateMean = result.framerateMean;
        var kilobytes = 0;
        if (!getStatsResult.internal.video[sendrecvType].prevFramerateMean) {
            getStatsResult.internal.video[sendrecvType].prevFramerateMean = result.bitrateMean;
        }

        var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevFramerateMean;
        getStatsResult.internal.video[sendrecvType].prevFramerateMean = result.framerateMean;

        kilobytes = bytes / 1024;
        getStatsResult.video[sendrecvType].framerateMean = bytes.toFixed(1);
    }

    if (result.bitrateMean) {
        getStatsResult.bandwidth.bitrateMean = result.bitrateMean;
        var kilobytes = 0;
        if (!getStatsResult.internal.video[sendrecvType].prevBitrateMean) {
            getStatsResult.internal.video[sendrecvType].prevBitrateMean = result.bitrateMean;
        }

        var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBitrateMean;
        getStatsResult.internal.video[sendrecvType].prevBitrateMean = result.bitrateMean;

        kilobytes = bytes / 1024;
        getStatsResult.video[sendrecvType].bitrateMean = bytes.toFixed(1);
    }

    // calculate latency
    if (!!result.googCurrentDelayMs) {
        var kilobytes = 0;
        if (!getStatsResult.internal.video.prevGoogCurrentDelayMs) {
            getStatsResult.internal.video.prevGoogCurrentDelayMs = result.googCurrentDelayMs;
        }

        var bytes = result.googCurrentDelayMs - getStatsResult.internal.video.prevGoogCurrentDelayMs;
        getStatsResult.internal.video.prevGoogCurrentDelayMs = result.googCurrentDelayMs;

        getStatsResult.video.latency = bytes.toFixed(1);

        if (getStatsResult.video.latency < 0) {
            getStatsResult.video.latency = 0;
        }
    }

    // calculate packetsLost
    if (!!result.packetsLost) {
        var kilobytes = 0;
        if (!getStatsResult.internal.video.prevPacketsLost) {
            getStatsResult.internal.video.prevPacketsLost = result.packetsLost;
        }

        var bytes = result.packetsLost - getStatsResult.internal.video.prevPacketsLost;
        getStatsResult.internal.video.prevPacketsLost = result.packetsLost;

        getStatsResult.video.packetsLost = bytes.toFixed(1);

        if (getStatsResult.video.packetsLost < 0) {
            getStatsResult.video.packetsLost = 0;
        }
    }
};
