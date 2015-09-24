var RecorderHelper = (function() {
    var isFirefox = !!navigator.mozGetUserMedia;
    var socket; // socket.io
    var roomId;
    var userId;
    var UploadInterval = 2000; // default, 2 seconds

    // default: 240p
    var VideoWidth = 320;
    var VideoHeight = 240;

    var multiStreamRecorder;

    function initRecorder(MediaStream, video) {
        // listen for "ended" event
        // works only in Chrome
        MediaStream.addEventListener('ended', function() {
            // LET server know recording process is stopped
            // todo???? maybe ask server to wait for 5-10 minutes
            //          then invoke merge/concatenate functions??
            socket.emit('stream-stopped');
            multiStreamRecorder.stop();
        }, false);

        multiStreamRecorder = new MultiStreamRecorder(MediaStream);

        // resolutions are passed here
        multiStreamRecorder.canvas = {
            width: VideoWidth,
            height: VideoHeight
        };

        // LET Chrome decide "best" buffer-size value
        // todo???? YOU can use HARD-CODED value here
        // need to use bufferSize=16384 when recording 720p to make sure audio is NOT affected.
        multiStreamRecorder.bufferSize = 0;

        // RECORD only LEFT channel
        // https://github.com/streamproc/MediaStreamRecorder#audiochannelss
        multiStreamRecorder.audioChannels = 1;

        // HTMLVideoElement
        // https://github.com/streamproc/MediaStreamRecorder#video
        multiStreamRecorder.video = video;


        multiStreamRecorder.ondataavailable = function(blobs) {
            // WAV/WebM blobs
            onDataAvailable(blobs.audio, blobs.video);
        };
        multiStreamRecorder.start(UploadInterval);
    }

    // this variable is used to detect if all pending are uploaded
    var isStopPending = false;

    // handler to detect if user is leaving
    window.addEventListener('beforeunload', function(event) {
        if (multiStreamRecorder) {
            // this code quickly stops recording
            // in first confirm-box
            multiStreamRecorder.stop();
            multiStreamRecorder = null;
        }

        // if some of the pending blobs are still there
        if (Object.keys(socketPendingMessages).length) {
            isStopPending = true;
            event.returnValue = 'Still some recording intervals are pending.';
        } else {
            // otherwise, let server know that stream is finally stopped.
            socket.emit('stream-stopped');
        }
    }, false);

    function onDataAvailable(audioBlob, videoBlob) {
        // todo: DataURL process is too slow.
        // UPload ArrayBuffer or Blob to the server.

        // DataURL is uploaded to server instead of Blobs
        // This process is 60-80 times slow comparing direct blob uploading
        // Because we need to wait for FileReader to read DataURLs
        getDataURL(audioBlob, function(audioDataURL) {
            // this object containers audio DataURL
            var audio = {
                blob: audioBlob,
                dataURL: audioDataURL
            };

            // Firefox will be MERELY having single audio DataURL
            // that DataURL is actually WebM file containing both audio and video
            if (isFirefox) {
                postFiles(audio);
                return;
            }

            // read video DataURL for Chrome
            getDataURL(videoBlob, function(videoDataURL) {
                // this object contains video DataURL
                var video = {
                    blob: videoBlob,
                    dataURL: videoDataURL
                };

                // upload both audio and video DataURLs to server
                postFiles(audio, video);
            });
        });
    }

    // each user is having unique file-name-string
    // this is exactly name that is stored on server like this:
    // file-1.wav
    // file-1.webm
    // file-2.wav
    // file-2.webm
    var fileNameString;
    var index = 1;

    function postFiles(audio, video) {
        var interval = index;

        // exact file name that is uploaded to server
        fileName = fileNameString + '-' + index;

        index++; // increment interval

        // single object that contains both audio/video DataURls
        var files = {
            interval: interval, // currently uploading interval
            isFirefox: !!isFirefox,
            roomId: roomId || generatefileNameString(), // unique roomid
            userId: userId || generatefileNameString(), // unique userid
            fileName: fileNameString // file-name-string
        };

        // audio DataURL
        files.audio = {
            name: fileName + '.' + audio.blob.type.split('/')[1],
            type: audio.blob.type,
            contents: audio.dataURL,
            interval: interval
        };

        if (!isFirefox) {
            // video DataURL for Chrome
            files.video = {
                name: fileName + '.' + video.blob.type.split('/')[1],
                type: video.blob.type,
                contents: video.dataURL,
                interval: interval
            };
        }

        // if socket.io is in progress
        if (isSocketBusy) {
            // store recordings in a global object
            // it is named as "pending-data"
            socketPendingMessages[interval] = {
                files: files, // the actual pending data

                // this method is invoke to upload "pending-data"
                emit: function() {
                    isSocketBusy = true;

                    console.info('emitting', interval);

                    // uploading to server
                    socket.emit('recording-message', JSON.stringify(files), function() {
                        isSocketBusy = false;

                        // if there are still some pending-data
                        if (socketPendingMessages[interval + 1]) {
                            socketPendingMessages[interval + 1].emit();
                            delete socketPendingMessages[interval + 1];
                        } else if (isStopPending) {
                            // otherwise, let server know that all pending DataURLs are uploaded
                            socket.emit('stream-stopped');
                        }
                    });
                }
            };
            return;
        }

        isSocketBusy = true;
        console.info('emitting', interval);

        // uploading to server
        socket.emit('recording-message', JSON.stringify(files), function() {
            isSocketBusy = false;

            // if there are still some pending-data
            if (socketPendingMessages[interval + 1]) {
                socketPendingMessages[interval + 1].emit();
                delete socketPendingMessages[interval + 1];
            } else if (isStopPending) {
                // otherwise, let server know that all pending DataURLs are uploaded
                socket.emit('stream-stopped');
            }
        });
    }

    // this global variable is used to detect if socket.io is busy
    var isSocketBusy = false;

    // this global object stores all pending-blobs
    var socketPendingMessages = {};

    // simply generates random string
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

    // reads DataURL in WebWorker
    // todo: single WebWorker can be used to read all recordings
    //       it'll reduce RAM usage as well as speed-up reading process (a bit).
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

    // this function generates WebWorker code on the fly.
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
        // public API
        // RecorderHelper.StartRecording(config);
        StartRecording: function(obj) {
            index = 1;

            // make sure that file name is uniqe for each user
            fileNameString = /* obj.FileName || */ generatefileNameString();

            roomId = obj.roomId; // getting value from config
            userId = obj.userId; // getting value from config
            UploadInterval = obj.UploadInterval; // getting value from config
            VideoWidth = obj.VideoWidth; // getting value from config
            VideoHeight = obj.VideoHeight; // getting value from config

            socket = obj.Socket; // getting value from config

            // Starting Recording
            initRecorder(obj.MediaStream, obj.HTMLVideoElement);
        }
    };
})();