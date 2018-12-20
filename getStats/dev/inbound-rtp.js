getStatsParser.inboundrtp = function(result) {
    if (!isSafari) return;
    if (result.type !== 'inbound-rtp') return;

    var mediaType = result.mediaType || 'audio';
    var sendrecvType = result.isRemote ? 'recv' : 'send';

    if (!sendrecvType) return;

    if (!!result.bytesSent) {
        var kilobytes = 0;
        if (!getStatsResult.internal[mediaType][sendrecvType].prevBytesSent) {
            getStatsResult.internal[mediaType][sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal[mediaType][sendrecvType].prevBytesSent;
        getStatsResult.internal[mediaType][sendrecvType].prevBytesSent = result.bytesSent;

        kilobytes = bytes / 1024;

        getStatsResult[mediaType][sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult[mediaType].bytesSent = kilobytes.toFixed(1);
    }

    if (!!result.bytesReceived) {
        var kilobytes = 0;
        if (!getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived) {
            getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived;
        getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived = result.bytesReceived;

        kilobytes = bytes / 1024;
        // getStatsResult[mediaType][sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult[mediaType].bytesReceived = kilobytes.toFixed(1);
    }
};
