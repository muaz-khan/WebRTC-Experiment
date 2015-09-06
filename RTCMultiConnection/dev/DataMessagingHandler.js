function TextReceiver(connection) {
    var content = {};

    function receive(data, userid, extra) {
        // uuid is used to uniquely identify sending instance
        var uuid = data.uuid;
        if (!content[uuid]) {
            content[uuid] = [];
        }

        content[uuid].push(data.message);
        if (data.last) {
            var message = content[uuid].join('');
            if (data.isobject) {
                message = JSON.parse(message);
            }

            // latency detection
            var receivingTime = new Date().getTime();
            var latency = receivingTime - data.sendingTime;

            var e = {
                data: message,
                userid: userid,
                extra: extra,
                latency: latency
            };

            if (message.preRecordedMediaChunk) {
                if (!connection.preRecordedMedias[message.streamerid]) {
                    connection.shareMediaFile(null, null, message.streamerid);
                }
                connection.preRecordedMedias[message.streamerid].onData(message.chunk);
            } else if (connection.autoTranslateText) {
                e.original = e.data;
                connection.Translator.TranslateText(e.data, function(translatedText) {
                    e.data = translatedText;
                    connection.onmessage(e);
                });
            } else if (message.isPartOfScreen) {
                connection.onpartofscreen(message);
            } else {
                connection.onmessage(e);
            }

            delete content[uuid];
        }
    }

    return {
        receive: receive
    };
}
var TextSender = {
    send: function(config) {
        var connection = config.connection;

        if (config.text instanceof ArrayBuffer || config.text instanceof DataView) {
            return config.channel.send(config.text, config._channel);
        }

        var channel = config.channel,
            _channel = config._channel,
            initialText = config.text,
            packetSize = connection.chunkSize || 1000,
            textToTransfer = '',
            isobject = false;

        if (!isString(initialText)) {
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
                }, connection.chunkInterval || 100);
            }
        }
    }
};
