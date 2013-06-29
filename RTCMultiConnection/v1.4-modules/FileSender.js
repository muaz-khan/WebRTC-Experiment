// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

// FileSender.send(config);

var FileSender = {
    send: function(config) {
        var root = config.root;
        var file = config.file;

        function send(message) {
            if (isChrome) message = JSON.stringify(message);

            // share data between two unique users i.e. direct messages
            if (config.channel) return config.channel.send(message);

            // share data with all connected users
            var channels = root.channels || { };
            for (var channel in channels) {
                channels[channel].channel.send(message);
            }
        }

        if (isFirefox) {
            send(JSON.stringify({
                fileName: file.name,
                type: 'file'
            }));
            send(file);
            if (root.onFileSent)
                root.onFileSent({
                    file: file,
                    userid: config.userid,
                    extra: config.extra
                });
        }

        if (isChrome) {
            var reader = new window.FileReader();
            reader.readAsDataURL(file);
            reader.onload = onReadAsDataURL;
        }

        var packetSize = 1000,
            textToTransfer = '',
            numberOfPackets = 0,
            packets = 0;

        function onReadAsDataURL(event, text) {
            var data = {
                type: 'file'
            };

            if (event) {
                text = event.target.result;
                numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);
            }

            if (root.onFileProgress)
                root.onFileProgress({
                    remaining: packets--,
                    length: numberOfPackets,
                    sent: numberOfPackets - packets,
                    userid: config.userid,
                    extra: config.extra
                });

            if (text.length > packetSize)
                data.message = text.slice(0, packetSize);
            else {
                data.message = text;
                data.last = true;
                data.name = file.name;

                if (root.onFileSent)
                    root.onFileSent({
                        file: file,
                        userid: config.userid,
                        extra: config.extra
                    });
            }

            send(data);

            textToTransfer = text.slice(data.message.length);

            if (textToTransfer.length)
                setTimeout(function() {
                    onReadAsDataURL(null, textToTransfer);
                }, 500);
        }
    }
};
