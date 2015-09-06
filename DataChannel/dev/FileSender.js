var FileSender = {
    send: function(config) {
        var root = config.root;
        var channel = config.channel;
        var privateChannel = config._channel;
        var file = config.file;

        if (!config.file) {
            console.error('You must attach/select a file.');
            return;
        }

        // max chunk sending limit on chrome is 64k
        // max chunk receiving limit on firefox is 16k
        var packetSize = 15 * 1000;

        if (root.chunkSize) {
            packetSize = root.chunkSize;
        }

        var textToTransfer = '';
        var numberOfPackets = 0;
        var packets = 0;

        file.uuid = getRandomString();

        function processInWebWorker() {
            var blob = URL.createObjectURL(new Blob(['function readFile(_file) {postMessage(new FileReaderSync().readAsDataURL(_file));};this.onmessage =  function (e) {readFile(e.data);}'], {
                type: 'application/javascript'
            }));

            var worker = new Worker(blob);
            URL.revokeObjectURL(blob);
            return worker;
        }

        if (!!window.Worker && !isMobileDevice) {
            var webWorker = processInWebWorker();

            webWorker.onmessage = function(event) {
                onReadAsDataURL(event.data);
            };

            webWorker.postMessage(file);
        } else {
            var reader = new FileReader();
            reader.onload = function(e) {
                onReadAsDataURL(e.target.result);
            };
            reader.readAsDataURL(file);
        }

        function onReadAsDataURL(dataURL, text) {
            var data = {
                type: 'file',
                uuid: file.uuid,
                maxChunks: numberOfPackets,
                currentPosition: numberOfPackets - packets,
                name: file.name,
                fileType: file.type,
                size: file.size
            };

            if (dataURL) {
                text = dataURL;
                numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);

                file.maxChunks = data.maxChunks = numberOfPackets;
                data.currentPosition = numberOfPackets - packets;

                if (root.onFileSent) {
                    root.onFileSent(file);
                }
            }

            if (root.onFileProgress) {
                root.onFileProgress({
                    remaining: packets--,
                    length: numberOfPackets,
                    sent: numberOfPackets - packets,

                    maxChunks: numberOfPackets,
                    uuid: file.uuid,
                    currentPosition: numberOfPackets - packets
                }, file.uuid);
            }

            if (text.length > packetSize) {
                data.message = text.slice(0, packetSize);
            } else {
                data.message = text;
                data.last = true;
                data.name = file.name;

                file.url = URL.createObjectURL(file);
                root.onFileSent(file, file.uuid);
            }

            channel.send(data, privateChannel);

            textToTransfer = text.slice(data.message.length);
            if (textToTransfer.length) {
                setTimeout(function() {
                    onReadAsDataURL(null, textToTransfer);
                }, root.chunkInterval || 100);
            }
        }
    }
};
