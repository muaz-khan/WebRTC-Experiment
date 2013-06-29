// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

// new FileReceiver().receive(config);

function FileReceiver() {
    var content = [],
        fileName = '',
        packets = 0,
        numberOfPackets = 0;

    this.receive = function(config) {
        var root = config.root;
        var data = config.data;

        if (isFirefox) {
            if (data.fileName)
                fileName = data.fileName;

            if (data.size) {
                var reader = new window.FileReader();
                reader.readAsDataURL(data);
                reader.onload = function(event) {
                    FileSaver.SaveToDisk({
                        fileURL: event.target.result,
                        fileName: fileName
                    });

                    if (root.onFileReceived)
                        root.onFileReceived({
                            fileName: fileName,
                            userid: config.userid,
                            extra: config.extra
                        });
                };
            }
        }

        if (isChrome) {
            if (data.packets)
                numberOfPackets = packets = parseInt(data.packets);

            if (root.onFileProgress)
                root.onFileProgress({
                    remaining: packets--,
                    length: numberOfPackets,
                    received: numberOfPackets - packets,
                    userid: config.userid,
                    extra: config.extra
                });

            content.push(data.message);

            if (data.last) {
                FileSaver.SaveToDisk({
                    fileURL: content.join(''),
                    fileName: data.name
                });

                if (root.onFileReceived)
                    root.onFileReceived({
                        fileName: data.name,
                        userid: config.userid,
                        extra: config.extra
                    });
                content = [];
            }
        }
    };
}
