this.appendStreams = function(streams) {
    if (!streams) {
        throw 'First parameter is required.';
    }

    if (!(streams instanceof Array)) {
        streams = [streams];
    }

    arrayOfMediaStreams.concat(streams);

    streams.forEach(function(stream) {
        if (stream.getVideoTracks().length) {
            var video = getVideo(stream);
            video.stream = stream;
            videos.push(video);
        }

        if (stream.getAudioTracks().length && self.audioContext) {
            var audioSource = self.audioContext.createMediaStreamSource(stream);
            audioSource.connect(self.audioDestination);
            self.audioSources.push(audioSource);
        }
    });
};
