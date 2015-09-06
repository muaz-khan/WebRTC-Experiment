function FileReceiver(root) {
    var content = {};
    var packets = {};
    var numberOfPackets = {};

    function receive(data) {
        var uuid = data.uuid;

        if (typeof data.packets !== 'undefined') {
            numberOfPackets[uuid] = packets[uuid] = parseInt(data.packets);
        }

        if (root.onFileProgress) {
            root.onFileProgress({
                remaining: packets[uuid] --,
                length: numberOfPackets[uuid],
                received: numberOfPackets[uuid] - packets[uuid],

                maxChunks: numberOfPackets[uuid],
                uuid: uuid,
                currentPosition: numberOfPackets[uuid] - packets[uuid]
            }, uuid);
        }

        if (!content[uuid]) {
            content[uuid] = [];
        }

        content[uuid].push(data.message);

        if (data.last) {
            var dataURL = content[uuid].join('');

            FileConverter.DataURLToBlob(dataURL, data.fileType, function(blob) {
                blob.uuid = uuid;
                blob.name = data.name;
                // blob.type = data.fileType;
                blob.extra = data.extra || {};

                blob.url = (window.URL || window.webkitURL).createObjectURL(blob);

                if (root.autoSaveToDisk) {
                    FileSaver.SaveToDisk(blob.url, data.name);
                }

                if (root.onFileReceived) {
                    root.onFileReceived(blob);
                }

                delete content[uuid];
            });
        }
    }

    return {
        receive: receive
    };
}
