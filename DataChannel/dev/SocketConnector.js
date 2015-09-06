function SocketConnector(_channel, config) {
    var socket = config.openSignalingChannel({
        channel: _channel,
        onopen: config.onopen,
        onmessage: config.onmessage,
        callback: function(_socket) {
            socket = _socket;
        }
    });

    return {
        send: function(message) {
            if (!socket) {
                return;
            }

            socket.send({
                userid: userid,
                message: message
            });
        }
    };
}
