(function () {
    if (!document.body) document.documentElement.appendChild(document.createElement('body'));

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

    function load(index) {
        if (!scriptFiles[index]) return;
        var script = document.createElement('script');
        script.src = scriptFiles[index];
        script.onload = function () {
            if (scriptFiles[index++]) load(index);
        };
        document.body.appendChild(script);
    }

    window.iceServers = null;
    window.socket_config = {
        publish_key: 'demo',
        subscribe_key: 'demo'
    };

    var domain = 'https://webrtc-experiment.appspot.com/';
    var scriptFiles = ['http://bit.ly/socket-io', domain + 'RTCPeerConnection.js', domain + 'RTCPeerConnection-Helpers.js', domain + 'calls/helper.js', domain + 'calls/ui.js', domain + 'calls/socket.js'];
    load(0);
})();