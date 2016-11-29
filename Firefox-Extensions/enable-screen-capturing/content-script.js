// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Github        - github.com/muaz-khan/Firefox-Extensions

// window.postMessage({ enableScreenCapturing: true }, "*");

window.addEventListener("message", function(event) {
    // do NOT allow external domains
    // via: https://github.com/muaz-khan/Firefox-Extensions/issues/11
    if (event.source !== document.defaultView) return;

    var addonMessage = event.data;

    // this content-script is used to check whether screen capturing is enabled for your own domain or not.
    if(addonMessage && addonMessage.checkIfScreenCapturingEnabled) {
        self.port.on('is-screen-capturing-enabled-response', function(response) {
            window.postMessage(response, '*');
        });

        self.port.emit('is-screen-capturing-enabled');
    }
}, false);
