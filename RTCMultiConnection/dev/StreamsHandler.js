// StreamsHandler.js

var StreamsHandler = (function() {
    function handleType(type) {
        if (!type) {
            return;
        }

        if (typeof type === 'string' || typeof type === 'undefined') {
            return type;
        }

        if (type.audio && type.video) {
            return null;
        }

        if (type.audio) {
            return 'audio';
        }

        if (type.video) {
            return 'video';
        }

        return;
    }

    function setHandlers(stream, syncAction, connection) {
        if (!stream || !stream.addEventListener) return;

        if (typeof syncAction == 'undefined' || syncAction == true) {
            var streamEndedEvent = 'ended';

            if ('oninactive' in stream) {
                streamEndedEvent = 'inactive';
            }

            stream.addEventListener(streamEndedEvent, function() {
                StreamsHandler.onSyncNeeded(this.streamid, streamEndedEvent);
            }, false);
        }

        stream.mute = function(type, isSyncAction) {
            type = handleType(type);

            if (typeof isSyncAction !== 'undefined') {
                syncAction = isSyncAction;
            }

            if (typeof type == 'undefined' || type == 'audio') {
                stream.getAudioTracks().forEach(function(track) {
                    track.enabled = false;
                    connection.streamEvents[stream.streamid].isAudioMuted = true;
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

            connection.streamEvents[stream.streamid].muteType = type || 'both';

            fireEvent(stream, 'mute', type);
        };

        stream.unmute = function(type, isSyncAction) {
            type = handleType(type);

            if (typeof isSyncAction !== 'undefined') {
                syncAction = isSyncAction;
            }

            graduallyIncreaseVolume();

            if (typeof type == 'undefined' || type == 'audio') {
                stream.getAudioTracks().forEach(function(track) {
                    track.enabled = true;
                    connection.streamEvents[stream.streamid].isAudioMuted = false;
                });
            }

            if (typeof type == 'undefined' || type == 'video') {
                stream.getVideoTracks().forEach(function(track) {
                    track.enabled = true;
                });

                // make sure that video unmute doesn't affects audio
                if (typeof type !== 'undefined' && type == 'video' && connection.streamEvents[stream.streamid].isAudioMuted) {
                    (function looper(times) {
                        if (!times) {
                            times = 0;
                        }

                        times++;

                        // check until five-seconds
                        if (times < 100 && connection.streamEvents[stream.streamid].isAudioMuted) {
                            stream.mute('audio');

                            setTimeout(function() {
                                looper(times);
                            }, 50);
                        }
                    })();
                }
            }

            if (typeof syncAction == 'undefined' || syncAction == true) {
                StreamsHandler.onSyncNeeded(stream.streamid, 'unmute', type);
            }

            connection.streamEvents[stream.streamid].unmuteType = type || 'both';

            fireEvent(stream, 'unmute', type);
        };

        function graduallyIncreaseVolume() {
            if (!connection.streamEvents[stream.streamid].mediaElement) {
                return;
            }

            var mediaElement = connection.streamEvents[stream.streamid].mediaElement;
            mediaElement.volume = 0;
            afterEach(200, 5, function() {
                try {
                    mediaElement.volume += .20;
                } catch (e) {
                    mediaElement.volume = 1;
                }
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
