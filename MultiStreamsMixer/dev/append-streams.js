this.appendStreams = function(streams) {
    if (!streams) {
        throw 'First parameter is required.';
    }

    if (!(streams instanceof Array)) {
        streams = [streams];
    }

    streams.forEach(function(stream) {
        arrayOfMediaStreams.push(stream);

        var newStream = new MediaStream();

        if (stream.getTracks().filter(function(t) {
                return t.kind === 'video';
            }).length) {
            var video = getVideo(stream);
            video.stream = stream;
            videos.push(video);

            newStream.addTrack(stream.getTracks().filter(function(t) {
                return t.kind === 'video';
            })[0]);
        }

        if (stream.getTracks().filter(function(t) {
                return t.kind === 'audio';
            }).length) {
            var audioSource = self.audioContext.createMediaStreamSource(stream);
            // self.audioDestination = self.audioContext.createMediaStreamDestination();
            audioSource.connect(self.audioDestination);

            newStream.addTrack(self.audioDestination.stream.getTracks().filter(function(t) {
                return t.kind === 'audio';
            })[0]);
        }
    });
};
