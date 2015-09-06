var TextSender = {
    send: function(config) {
        var root = config.root;

        var channel = config.channel;
        var _channel = config._channel;
        var initialText = config.text;
        var packetSize = root.chunkSize || 1000;
        var textToTransfer = '';
        var isobject = false;

        if (typeof initialText !== 'string') {
            isobject = true;
            initialText = JSON.stringify(initialText);
        }

        // uuid is used to uniquely identify sending instance
        var uuid = getRandomString();
        var sendingTime = new Date().getTime();

        sendText(initialText);

        function sendText(textMessage, text) {
            var data = {
                type: 'text',
                uuid: uuid,
                sendingTime: sendingTime
            };

            if (textMessage) {
                text = textMessage;
                data.packets = parseInt(text.length / packetSize);
            }

            if (text.length > packetSize) {
                data.message = text.slice(0, packetSize);
            } else {
                data.message = text;
                data.last = true;
                data.isobject = isobject;
            }

            channel.send(data, _channel);

            textToTransfer = text.slice(data.message.length);

            if (textToTransfer.length) {
                setTimeout(function() {
                    sendText(null, textToTransfer);
                }, root.chunkInterval || 100);
            }
        }
    }
};
