var StreamsHandler = (function() {
    function setHandlers(stream, syncAction) {
        stream.mute = function(type) {
            if (typeof type == 'undefined' || type == 'audio') {
                stream.getAudioTracks().forEach(function(track) {
                    track.enabled = false;
                });
            }

            if (typeof type == 'undefined' || type == 'video') {
                stream.getVideoTracks().forEach(function(track) {
                    track.enabled = false;
                });
            }

            if (typeof syncAction == 'undefined' || syncAction == true) {
                StreamsHandler.onSyncNeeded(stream.streamid, 'mute', type);
            }
        };

        stream.unmute = function(type) {
            graduallyIncreaseVolume();
            
            if (typeof type == 'undefined' || type == 'audio') {
                stream.getAudioTracks().forEach(function(track) {
                    track.enabled = true;
                });
            }

            if (typeof type == 'undefined' || type == 'video') {
                stream.getVideoTracks().forEach(function(track) {
                    track.enabled = true;
                });
            }

            if (typeof syncAction == 'undefined' || syncAction == true) {
                StreamsHandler.onSyncNeeded(stream.streamid, 'unmute', type);
            }
        };
        
        function graduallyIncreaseVolume() {
            var mediaElement = stream.mediaElement;
            mediaElement.volume = 0;
            afterEach(200, 5, function() {
                mediaElement.volume += .20;
            });
        }
    }
    
    function afterEach(setTimeoutInteval, numberOfTimes, callback, startedTimes) {
        startedTimes = (startedTimes || 0) + 1;
        if (startedTimes >= numberOfTimes) return;

        setTimeout(function() {
            callback();
            afterEach(setTimeoutInteval, numberOfTimes, callback, startedTimes);
        }, setTimeoutInteval);
    }

    return {
        setHandlers: setHandlers,
        onSyncNeeded: function(streamid, action, type) {}
    };
})();
