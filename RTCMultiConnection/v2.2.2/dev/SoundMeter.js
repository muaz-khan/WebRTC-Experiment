// Sound meter is used to detect speaker
function SoundMeter(config) {
    var root = config.root;
    var context = config.context;
    this.context = context;
    this.volume = 0.0;
    this.slow_volume = 0.0;
    this.clip = 0.0;

    // Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384)
    this.script = context.createScriptProcessor(256, 1, 1);
    that = this;

    this.script.onaudioprocess = function(event) {
        var input = event.inputBuffer.getChannelData(0);
        var i;
        var sum = 0.0;
        var clipcount = 0;
        for (i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
            if (Math.abs(input[i]) > 0.99) {
                clipcount += 1;
            }
        }
        that.volume = Math.sqrt(sum / input.length);

        var volume = that.volume.toFixed(2);

        if (volume >= .1 && root.onspeaking) {
            root.onspeaking(config.event);
        }

        if (volume < .1 && root.onsilence) {
            root.onsilence(config.event);
        }
    };
}

SoundMeter.prototype.connectToSource = function(stream) {
    this.mic = this.context.createMediaStreamSource(stream);
    this.mic.connect(this.script);
    this.script.connect(this.context.destination);
};

SoundMeter.prototype.stop = function() {
    this.mic.disconnect();
    this.script.disconnect();
};
