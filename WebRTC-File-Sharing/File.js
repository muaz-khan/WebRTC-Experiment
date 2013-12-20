// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/WebRTC-Experiment/tree/master/WebRTC-File-Sharing

// _______
// File.js

var File = {
    Send: function(config) {
        var file = config.file;
        var socket = config.channel;

        var chunkSize = config.chunkSize || 40 * 1000; // 64k max sctp limit (AFAIK!)
        var sliceId = 0;
        var cacheSize = chunkSize;

        var chunksPerSlice = Math.floor(Math.min(100000000, cacheSize) / chunkSize);
        var sliceSize = chunksPerSlice * chunkSize;
        var maxChunks = Math.ceil(file.size / chunkSize);

        // uuid is used to uniquely identify sending instance
        var uuid = (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');

        socket.send({
            uuid: uuid,
            maxChunks: maxChunks,
            size: file.size,
            name: file.name,
            lastModifiedDate: file.lastModifiedDate,
            type: file.type,
            start: true
        }, config.extra);

        file.maxChunks = maxChunks;
        file.uuid = uuid;
        if (config.onBegin) config.onBegin(file);

        var blob, reader = new FileReader();
        reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) {
                addChunks(file.name, evt.target.result, function() {
                    sliceId++;
                    if ((sliceId + 1) * sliceSize < file.size) {
                        blob = file.slice(sliceId * sliceSize, (sliceId + 1) * sliceSize);
                        reader.readAsArrayBuffer(blob);
                    } else if (sliceId * sliceSize < file.size) {
                        blob = file.slice(sliceId * sliceSize, file.size);
                        reader.readAsArrayBuffer(blob);
                    } else {
                        socket.send({
                            uuid: uuid,
                            maxChunks: maxChunks,
                            size: file.size,
                            name: file.name,
                            lastModifiedDate: file.lastModifiedDate,
                            type: file.type,
                            end: true
                        }, config.extra);

                        file.url = URL.createObjectURL(file);
                        if (config.onEnd) config.onEnd(file);
                    }
                });
            }
        };

        blob = file.slice(sliceId * sliceSize, (sliceId + 1) * sliceSize);
        reader.readAsArrayBuffer(blob);

        var numOfChunksInSlice;
        var currentPosition = 0;
        var hasEntireFile;
        var chunks = [];

        function addChunks(fileName, binarySlice, callback) {
            numOfChunksInSlice = Math.ceil(binarySlice.byteLength / chunkSize);
            for (var i = 0; i < numOfChunksInSlice; i++) {
                var start = i * chunkSize;
                chunks[currentPosition] = binarySlice.slice(start, Math.min(start + chunkSize, binarySlice.byteLength));

                FileConverter.ArrayBufferToDataURL(chunks[currentPosition], function(str) {
                    socket.send({
                        uuid: uuid,
                        value: str,
                        currentPosition: currentPosition,
                        maxChunks: maxChunks
                    }, config.extra);
                });

                currentPosition++;
            }

            if (config.onProgress) {
                config.onProgress({
                    currentPosition: currentPosition,
                    maxChunks: maxChunks,
                    uuid: uuid
                });
            }

            if (currentPosition == maxChunks) {
                hasEntireFile = true;
            }

            if (config.interval == 0 || typeof config.interval == 'undefined')
                callback();
            else
                setTimeout(callback, config.interval);
        }
    },

    Receiver: function(config) {
        var packets = { };

        function receive(chunk) {
            if (chunk.start && !packets[chunk.uuid]) {
                packets[chunk.uuid] = [];
                if (config.onBegin) config.onBegin(chunk);
            }

            if (!chunk.end && chunk.value) packets[chunk.uuid].push(chunk.value);

            if (chunk.end) {
                var _packets = packets[chunk.uuid];
                var finalArray = [], length = _packets.length;

                for (var i = 0; i < length; i++) {
                    if (!!_packets[i]) {
                        FileConverter.DataURLToBlob(_packets[i], function(buffer) {
                            finalArray.push(buffer);
                        });
                    }
                }

                var blob = new Blob(finalArray, { type: chunk.type });
                blob = merge(blob, chunk);
                blob.url = URL.createObjectURL(blob);
                blob.uuid = chunk.uuid;

                if (!blob.size) console.error('Something went wrong. Blob Size is 0.');

                if (config.onEnd) config.onEnd(blob);
            }

            if (chunk.value && config.onProgress) config.onProgress(chunk);
        }

        return {
            receive: receive
        };
    },
    SaveToDisk: function(fileUrl, fileName) {
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
    ArrayBufferToDataURL: function(buffer, callback) {
        window.BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;

        // getting blob from array-buffer
        var blob = new Blob([buffer]);

        // reading file as binary-string
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
            callback(e.target.result);
        };
        fileReader.readAsDataURL(blob);
    },
    DataURLToBlob: function(dataURL, callback) {
        var binary = atob(dataURL.substr(dataURL.indexOf(',') + 1)),
            i = binary.length,
            view = new Uint8Array(i);

        while (i--) {
            view[i] = binary.charCodeAt(i);
        }

        callback(new Blob([view]));
    }
};

function merge(mergein, mergeto) {
    if (!mergein) mergein = { };
    if (!mergeto) return mergein;

    for (var item in mergeto) {
        mergein[item] = mergeto[item];
    }
    return mergein;
}
