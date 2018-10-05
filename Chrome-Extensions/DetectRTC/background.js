// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Source Code   - https://github.com/muaz-khan/Chrome-Extensions

var runtimePort;

chrome.runtime.onConnect.addListener(function(port) {
    runtimePort = port;

    runtimePort.onMessage.addListener(function(message) {
        if (!message || !message.messageFromContentScript1234) {
            return;
        }

        if(message.DetectRTC) {
            DetectRTC = message.DetectRTC;
        }

        if(message.fromDropDown) {
            runtimePort.postMessage({
                messageFromContentScript1234: true,
                DetectRTC: DetectRTC
            });
        }
    });
});
