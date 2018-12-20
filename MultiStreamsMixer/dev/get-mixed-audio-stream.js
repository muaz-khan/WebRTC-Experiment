function getMixedAudioStream() {
    // via: @pehrsons
    if (!Storage.AudioContextConstructor) {
        Storage.AudioContextConstructor = new Storage.AudioContext();
    }

    self.audioContext = Storage.AudioContextConstructor;

    self.audioSources = [];

    if (self.useGainNode === true) {
        self.gainNode = self.audioContext.createGain();
        self.gainNode.connect(self.audioContext.destination);
        self.gainNode.gain.value = 0; // don't hear self
    }

    var audioTracksLength = 0;
    arrayOfMediaStreams.forEach(function(stream) {
        if (!stream.getTracks().filter(function(t) {
                return t.kind === 'audio';
            }).length) {
            return;
        }

        audioTracksLength++;

        var audioSource = self.audioContext.createMediaStreamSource(stream);

        if (self.useGainNode === true) {
            audioSource.connect(self.gainNode);
        }

        self.audioSources.push(audioSource);
    });

    if (!audioTracksLength) {
        return;
    }

    self.audioDestination = self.audioContext.createMediaStreamDestination();
    self.audioSources.forEach(function(audioSource) {
        audioSource.connect(self.audioDestination);
    });
    return self.audioDestination.stream;
}
