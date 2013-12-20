// 2013, Muaz Khan - www.MuazKhan.com
// MIT License     - www.WebRTC-Experiment.com/licence
// Documentation   - github.com/muaz-khan/WebRTC-Experiment/tree/master/Pre-recorded-Media-Streaming

requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

function Streamer() {
	var prefix = !!navigator.webkitGetUserMedia ? '' : 'moz';
    var self = this;
	
    self.stream = streamPreRecordedMedia;

    window.MediaSource = window.MediaSource || window.WebKitMediaSource;
    if (!window.MediaSource) throw 'Chrome >=M28 (or Firefox with flag "media.mediasource.enabled=true") is mandatory to test this experiment.';

    function streamPreRecordedMedia(file) {
        if (!self.push) throw '<push> method is mandatory.';
        
        var reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function (e) {
            startStreaming(new window.Blob([new window.Uint8Array(e.target.result)]));
        };

        var sourceBuffer, mediaSource = new MediaSource();
        mediaSource.addEventListener(prefix +'sourceopen', function () {
            sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
            console.debug('MediaSource readyState: <', this.readyState, '>');
        }, false);

        mediaSource.addEventListener(prefix+'sourceended', function () {
            console.debug('MediaSource readyState: <', this.readyState, '>');
        }, false);

        function startStreaming(blob) {
			if(!blob) return;
                var size = blob.size,
                    startIndex = 0,
                    plus = 3000;

                console.debug('one chunk size: <', plus, '>');

                function inner_streamer() {
                    reader = new window.FileReader();
                    reader.onload = function (e) {
                        self.push(new window.Uint8Array(e.target.result));

                        startIndex += plus;
                        if (startIndex <= size) window.requestAnimationFrame(inner_streamer);
                        else
                            self.push({
                                end: true
                            });
                    };
                    reader.readAsArrayBuffer(blob.slice(startIndex, startIndex + plus));
                }

                inner_streamer();
        }

        startStreaming();
    }

    self.receive = receive;
    function receive() {
        var sourceBuffer, mediaSource = new MediaSource();

        self.video.src = window.URL.createObjectURL(mediaSource);
        mediaSource.addEventListener(prefix+'sourceopen', function () {
            self.receiver = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
            self.mediaSource = mediaSource;

            console.debug('MediaSource readyState: <', this.readyState, '>');
        }, false);
		

        mediaSource.addEventListener(prefix+'sourceended', function () {
            console.warn('MediaSource readyState: <', this.readyState, '>');
        }, false);
    }

    this.append = function (data) {
		var uint8array = new window.Uint8Array(data);
        self.receiver.appendBuffer(uint8array);
    };

    this.end = function (data) {
        self.mediaSource.endOfStream();
    };
}
