// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC

// _____________
// MRecordRTC.js

function MRecordRTC(mediaStream) {
    this.addStream = function(_mediaStream) {
        if (_mediaStream) mediaStream = _mediaStream;
    };

    this.mediaType = {
        audio: true,
        video: true
    };

    this.startRecording = function() {
        if (this.mediaType.audio) {
            this.audioRecorder = RecordRTC(mediaStream, this).startRecording();
        }

        if (this.mediaType.video) {
            this.videoRecorder = RecordRTC(mediaStream, {
                type: 'video'
            }).startRecording();
        }

        if (this.mediaType.gif) {
            this.gifRecorder = RecordRTC(mediaStream, {
                type: 'gif',
                frameRate: this.frameRate || 200,
                quality: this.quality || 10
            }).startRecording();
        }
    };

    this.stopRecording = function(callback) {
        callback = callback || function() {
        };

        if (this.audioRecorder) {
            this.audioRecorder.stopRecording(function(blobURL) {
                callback(blobURL, 'audio');
            });
        }

        if (this.videoRecorder) {
            this.videoRecorder.stopRecording(function(blobURL) {
                callback(blobURL, 'video');
            });
        }

        if (this.gifRecorder) {
            this.gifRecorder.stopRecording(function(blobURL) {
                callback(blobURL, 'gif');
            });
        }
    };

    this.getBlob = function(callback) {
        var output = { };

        if (this.audioRecorder) {
            output.audio = this.audioRecorder.getBlob();
        }

        if (this.videoRecorder) {
            output.video = this.videoRecorder.getBlob();
        }

        if (this.gifRecorder) {
            output.gif = this.gifRecorder.getBlob();
        }
        if (callback) callback(output);
    };

    this.getDataURL = function(callback) {
        this.getBlob(function(blob) {
            getDataURL(blob.audio, function(_audioDataURL) {
                getDataURL(blob.video, function(_videoDataURL) {
                    callback({
                        audio: _audioDataURL,
                        video: _videoDataURL
                    });
                });
            });
        });

        function getDataURL(blob, callback00) {
            if (!!window.Worker) {
                var webWorker = processInWebWorker(function readFile(_blob) {
                    postMessage(new FileReaderSync().readAsDataURL(_blob));
                });

                webWorker.onmessage = function(event) {
                    callback00(event.data);
                };

                webWorker.postMessage(blob);
            }
        }

        function processInWebWorker(_function) {
            var blob = URL.createObjectURL(new Blob([_function.toString(),
                    'this.onmessage =  function (e) {readFile(e.data);}'], {
                        type: 'application/javascript'
                    }));

            var worker = new Worker(blob);
            URL.revokeObjectURL(blob);
            return worker;
        }
    };

    this.writeToDisk = function() {
        RecordRTC.writeToDisk({
            audio: this.audioRecorder,
            video: this.videoRecorder,
            gif: this.gifRecorder
        });
    };
}

MRecordRTC.getFromDisk = RecordRTC.getFromDisk;
MRecordRTC.writeToDisk = RecordRTC.writeToDisk;
