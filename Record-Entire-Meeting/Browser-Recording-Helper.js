// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Documentation - github.com/streamproc/MediaStreamRecorder
var RecorderHelper = (function() {
    var socket; // socket.io
    var roomId;
    var userId;
    var UploadInterval = 5 * 1000;

    var mediaStreamRecorder;

    function initRecorder(mediaStream, video) {
        mediaStream.addEventListener('ended', function() {
            // RecorderHelper.StopRecording();
        }, false);

        mediaStreamRecorder = new MediaStreamRecorder(mediaStream);

        mediaStreamRecorder.mimeType = 'video/webm';

        mediaStreamRecorder.ondataavailable = function(blobs) {
            onDataAvailable(blobs);
        };
        mediaStreamRecorder.start(UploadInterval);

        socket.on('complete', function(fileName) {
            RecorderHelper.OnComplete(fileName);
        });

        socket.on('ffmpeg-progress', function(response) {
            RecorderHelper.OnProgress(response);
        });
    }

    window.addEventListener('beforeunload', function(event) {
        if (mediaStreamRecorder) {
            mediaStreamRecorder.stop();
            mediaStreamRecorder = null;
        }

        if (Object.keys(socketPendingMessages).length) {
            event.returnValue = 'Still some recording intervals are pending.';
        }
    }, false);

    function onDataAvailable(blob) {
        getDataURL(blob, function(dataURL) {
            var data = {
                blob: blob,
                dataURL: dataURL
            };

            postFiles(data);
        });
    }

    var fileNameString;
    var index = 1;

    function postFiles(data) {
        var interval = index;

        fileName = fileNameString + '-' + index;

        index++;

        var files = {
            interval: interval,
            roomId: roomId || generatefileNameString(),
            userId: userId || generatefileNameString(),
            fileName: fileNameString
        };

        files.data = {
            name: fileName + '.' + data.blob.type.split('/')[1],
            type: data.blob.type,
            contents: data.dataURL,
            interval: interval
        };

        if (isSocketBusy) {
            socketPendingMessages[interval] = {
                files: files,
                emit: function() {
                    isSocketBusy = true;

                    console.info('emitting', interval);

                    socket.emit('recording-message', JSON.stringify(files), function() {
                        isSocketBusy = false;

                        if (socketPendingMessages[interval + 1]) {
                            socketPendingMessages[interval + 1].emit();
                            delete socketPendingMessages[interval + 1];
                        } else if(!mediaStreamRecorder) {
                            socket.emit('stream-stopped');
                        }
                    });
                }
            };
            return;
        }

        isSocketBusy = true;
        console.info('emitting', interval);

        socket.emit('recording-message', JSON.stringify(files), function() {
            isSocketBusy = false;

            console.info('emitting', interval);

            if (socketPendingMessages[interval + 1]) {
                socketPendingMessages[interval + 1].emit();
                delete socketPendingMessages[interval + 1];
            } else if(!mediaStreamRecorder) {
                socket.emit('stream-stopped');
            }
        });
    }

    var isSocketBusy = false;
    var socketPendingMessages = {};

    function generatefileNameString() {
        if (window.crypto) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
    }

    function getDataURL(blob, callback) {
        if (!!window.Worker) {
            var webWorker = processInWebWorker(function readFile(_blob) {
                postMessage(new FileReaderSync().readAsDataURL(_blob));
            });

            webWorker.onmessage = function(event) {
                callback(event.data);
            };

            webWorker.postMessage(blob);
        } else {
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = function(event) {
                callback(event.target.result);
            };
        }
    }

    var worker;

    function processInWebWorker(_function) {
        if (worker) {
            return worker;
        }

        var blob = URL.createObjectURL(new Blob([_function.toString(),
            'this.onmessage =  function (e) {' + _function.name + '(e.data);}'
        ], {
            type: 'application/javascript'
        }));

        worker = new Worker(blob);
        URL.revokeObjectURL(blob);
        return worker;
    }

    return {
        StartRecording: function(obj) {
            index = 1;

            fileNameString = obj.FileName || generatefileNameString();

            roomId = obj.roomId;
            userId = obj.userId;
            UploadInterval = obj.UploadInterval;

            socket = obj.Socket;

            initRecorder(obj.MediaStream, obj.HTMLVideoElement);

            this.alreadyStopped = false;
        },

        StopRecording: function() {
            if (this.alreadyStopped) return;
            this.alreadyStopped = true;

            mediaStreamRecorder.stop();
            mediaStreamRecorder = null;
        },

        OnComplete: function(fileName) {
            console.debug('File saved at: /uploads/' + roomId + '/' + fileName);
        },

        OnProgress: function(response) {
            console.info('ffmpeg progress', response.progress, response);
        }
    };
})();
