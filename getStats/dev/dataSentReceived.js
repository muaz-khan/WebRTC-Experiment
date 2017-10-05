getStatsParser.dataSentReceived = function(result) {
    if (!result.googCodecName || (result.mediaType !== 'video' && result.mediaType !== 'audio')) return;

    if (!!result.bytesSent) {
        getStatsResult[result.mediaType].bytesSent = parseInt(result.bytesSent);
    }

    if (!!result.bytesReceived) {
        getStatsResult[result.mediaType].bytesReceived = parseInt(result.bytesReceived);
    }
};
