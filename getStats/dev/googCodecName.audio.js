getStatsParser.checkAudioTracks = function(result) {
    if (result.mediaType !== 'audio') return;

    var sendrecvType = result.id.split('_').pop();
    if (result.isRemote === true) {
        sendrecvType = 'recv';
    }
    if (result.isRemote === false) {
        sendrecvType = 'send';
    }

    if (!sendrecvType) return;

    if (getStatsResult.audio[sendrecvType].codecs.indexOf(result.googCodecName || 'opus') === -1) {
        getStatsResult.audio[sendrecvType].codecs.push(result.googCodecName || 'opus');
    }

    if (!!result.bytesSent) {
        var kilobytes = 0;
        if (!getStatsResult.internal.audio[sendrecvType].prevBytesSent) {
            getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal.audio[sendrecvType].prevBytesSent;
        getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent;

        kilobytes = bytes / 1024;
        getStatsResult.audio[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult.video.bytesSent = kilobytes.toFixed(1);
    }

    if (!!result.bytesReceived) {
        var kilobytes = 0;
        if (!getStatsResult.internal.audio[sendrecvType].prevBytesReceived) {
            getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal.audio[sendrecvType].prevBytesReceived;
        getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived;

        kilobytes = bytes / 1024;

        // getStatsResult.audio[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult.video.bytesReceived = kilobytes.toFixed(1);
    }

    if (result.googTrackId && getStatsResult.audio[sendrecvType].tracks.indexOf(result.googTrackId) === -1) {
        getStatsResult.audio[sendrecvType].tracks.push(result.googTrackId);
    }
};
