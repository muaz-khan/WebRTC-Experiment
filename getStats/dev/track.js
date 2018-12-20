getStatsParser.track = function(result) {
    if (!isSafari) return;
    if (result.type !== 'track') return;

    var sendrecvType = result.remoteSource === true ? 'send' : 'recv';

    if (result.frameWidth && result.frameHeight) {
        getStatsResult.resolutions[sendrecvType].width = result.frameWidth;
        getStatsResult.resolutions[sendrecvType].height = result.frameHeight;
    }

    // framesSent, framesReceived
};
