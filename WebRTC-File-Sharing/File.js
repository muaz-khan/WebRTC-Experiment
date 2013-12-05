// Muaz Khan      - www.MuazKhan.com
// MIT License    - https://www.webrtc-experiment.com/licence/
// Documentation  - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/WebRTC-File-Sharing
// _______
// File.js
var File = {
    Send: function (config) {
        FileSender.send(config);
    },
    Receiver: function (config) {
        var fileReceiver = new FileReceiver(config);
        return {
            receive: function (data) {
                fileReceiver.receive(data);
            }
        };
    },
    SaveToDisk: function (fileUrl, fileName) {
        FileSaver.SaveToDisk(fileUrl, fileName);
    }
};

// _____________
// FileSender.js
var FileSender = {
    send: function (config) {
        var channel = config.channel,
            file = config.file;

        var packetSize = 1000, // 16k max limit
            textToTransfer = '',
            numberOfPackets = 0,
            packets = 0,
            DataURL;

        // uuid to uniquely identify sending instance
        file.uuid = getRandomString();

        var reader = new window.FileReader();
        reader.readAsDataURL(file);
        reader.onload = onReadAsDataURL;

        function onReadAsDataURL(event, text) {
            var data = {
                type: 'file',
                uuid: file.uuid
            };

            if (event) {
                DataURL = text = event.target.result;
                numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);

				file.maxChunks = numberOfPackets;
                channel.send({
                    start: true,
                    file: {
						name: file.name,
						size: file.size,
						type: file.type,
						maxChunks: numberOfPackets
					}
                });

                if (config.onBegin) config.onBegin(file);
            }

            if (config.onProgress) {
                config.onProgress({
                    currentPosition: numberOfPackets - packets,
                    max: numberOfPackets,
                    remaining: packets--,
                    uuid: file.uuid
                });
            }

            if (text.length > packetSize) data.message = text.slice(0, packetSize);
            else {
                data.message = text;
                data.last = true;
                data.name = file.name;
                data.file = {
					name: file.name,
					size: file.size,
					type: file.type,
					maxChunks: numberOfPackets
				};

                if (config.onEnd) {
                    var blob = FileConverter.DataUrlToBlob(DataURL);

                    file.url = (window.URL || window.webkitURL).createObjectURL(blob);
					file.dataURL = DataURL;
                    config.onEnd(file);
                }
            }

            channel.send(data);

            textToTransfer = text.slice(data.message.length);
            if (textToTransfer.length) {
                if (config.interval == 0 || typeof config.interval == 'undefined')
                    onReadAsDataURL(null, textToTransfer);
                else
                    setTimeout(function () {
                        onReadAsDataURL(null, textToTransfer);
                    }, config.interval);
            }
        }
    }
};

// _______________
// FileReceiver.js
function FileReceiver(config) {
    var content = {},
        packets = {},
        numberOfPackets = {};

    function receive(data) {
        if (data.start) {
            return config.onBegin(data.file);
        }

        // uuid is used to uniquely identify sending instance
        var uuid = data.uuid;

        if (data.packets) numberOfPackets[uuid] = packets[uuid] = parseInt(data.packets);

        if (config.onProgress) {
            config.onProgress({
                currentPosition: numberOfPackets[uuid] - packets[uuid],
                max: numberOfPackets[uuid],
                remaining: packets[uuid]--,
                uuid: uuid
            });
        }

        if (!content[uuid]) content[uuid] = [];

        content[uuid].push(data.message);

        // if it is last packet
        if (data.last) {
            var dataURL = content[uuid].join('');
            var blob = FileConverter.DataUrlToBlob(dataURL);
            var virtualURL = (window.URL || window.webkitURL).createObjectURL(blob);

            if (config.autoSaveToDisk)
                FileSaver.SaveToDisk(dataURL, data.name);

            if (config.onEnd) {
                var file = data.file;

                file.url = virtualURL;
                file.dataURL = dataURL;
                file.blob = blob;

                config.onEnd(file);
            }

            delete content[uuid];
        }
    }

    return {
        receive: receive
    };
}

// ____________
// FileSaver.js
var FileSaver = {
    SaveToDisk: function (fileUrl, fileName) {
        var hyperlink = document.createElement('a');
        hyperlink.href = fileUrl;
        hyperlink.target = '_blank';
        hyperlink.download = fileName || fileUrl;

        var mouseEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });

        hyperlink.dispatchEvent(mouseEvent);
        (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
    }
};

// ________________
// FileConverter.js
var FileConverter = {
    DataUrlToBlob: function (dataURL) {
        var binary = atob(dataURL.substr(dataURL.indexOf(',') + 1));
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }

        var type;

        try {
            type = dataURL.substr(dataURL.indexOf(':') + 1).split(';')[0];
        } catch (e) {
            type = 'text/plain';
        }

        var uint8Array = new Uint8Array(array);
        // bug: must recheck FileConverter
        return new Blob([new DataView(uint8Array.buffer)], {
            type: type
        });
    }
};

function getRandomString() {
    return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
}
