// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

// new TextReceiver().receive(config);

function TextReceiver() {
    var content = [];

    function receive(config) {
        var root = config.root;
        var data = config.data;

        content.push(data.message);
        if (data.last) {
            if (root.onmessage)
                root.onmessage({
                    data: content.join(''),
                    userid: config.userid,
                    extra: config.extra
                });
            content = [];
        }
    }

    return {
        receive: receive
    };
}
