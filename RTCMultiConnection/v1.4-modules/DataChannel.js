// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

// DataChannel.createDataChannel(peer, config);
// DataChannel.setChannelEvents(channel, config);

var DataChannel = {
    createDataChannel: function(peer, config) {
        // in renegotiation process; don't create data channels multiple times
        if (peer.localDescription && peer.localDescription.sdp.indexOf('a=mid:data') !== -1) return;

        var channel = peer.createDataChannel('channel', { reliable: false });
        this.setChannelEvents(channel, config);
    },
    setChannelEvents: function(channel, config) {
        channel.onopen = function() {
            config.onopen({
                channel: channel,
                userid: config.to,
                extra: config.extra,

                // used to make sure we're not forwaring
                // details of renegotiated streams
                renegotiated: !!config.renegotiated
            });
        };

        channel.onmessage = function(e) {
            config.onmessage({
                data: e.data,
                userid: config.to,
                extra: config.extra
            });
        };

        channel.onclose = function(event) {
            config.onclose({
                event: event,
                userid: config.to,
                extra: config.extra
            });
        };

        channel.onerror = function(event) {
            config.onerror({
                event: event,
                userid: config.to,
                extra: config.extra
            });
        };
    }
};
