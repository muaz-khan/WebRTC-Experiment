(function () {
    var audio = document.createElement('audio');
    audio.setAttribute('id', 'audio');
    audio.setAttribute('autoplay', 'true');
    audio.style.position = 'absolute';
    audio.style.top = '-100em';
    document.body.insertBefore(audio, document.body.childNodes[0]);

    var div = document.createElement('div');
    div.setAttribute('id', 'pubnub');
    div.setAttribute('ssl', 'on');
    document.body.insertBefore(div, document.body.childNodes[0]);

    function load(src, callback) {
        var script = document.createElement('script');
        script.src = src;
        if (callback) script.onload = callback;
        document.body.appendChild(script);
    }
	window.iceServers = null;
    window.socket_config = {
        publish_key: 'demo',
        subscribe_key: 'demo',
        ssl: true
    };

    load('https://webrtc-experiment.appspot.com/dependencies/socket.io.js', function () {
        load('https://webrtc-experiment.appspot.com/RTCPeerConnection.js', function () {
            load('https://webrtc-experiment.appspot.com/RTCPeerConnection-Helpers.js', function () {
                load('https://webrtc-experiment.appspot.com/calls/helper.js', function () {
                    load('https://webrtc-experiment.appspot.com/calls/ui.js', function () {
                        load('https://webrtc-experiment.appspot.com/calls/socket.js');
                    });
                });
            });
        });
    });
})();