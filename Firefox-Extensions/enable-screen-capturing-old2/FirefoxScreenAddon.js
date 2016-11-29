// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Github        - github.com/muaz-khan/Firefox-Extensions

// FirefoxScreenAddon.checkIfScreenCapturingEnabled(domains, callback);
// FirefoxScreenAddon.enableScreenCapturing(domains, callback);

var FirefoxScreenAddon = (function() {
    return {
        checkIfScreenCapturingEnabled: function(domains, callback) {
            var isCallbackFired = false;

            // ask addon to check if screen capturing enabled for specific domains
            window.postMessage({
                checkIfScreenCapturingEnabled: true,
                domains: domains
            }, "*");

            // watch addon's response
            // addon will return "isScreenCapturingEnabled=true|false"
            window.addEventListener("message", function(event) {
                if(!isCallbackFired) return;

                var addonMessage = event.data;
                if(!addonMessage || typeof addonMessage.isScreenCapturingEnabled === 'undefined') return;

                isCallbackFired = true;
                callback(addonMessage);
            }, false);
        },
        enableScreenCapturing: function(domains, callback) {
            var isCallbackFired = false;

            // request addon to enable screen capturing for your domains
            window.postMessage({
                enableScreenCapturing: true,
                domains: domains
            }, "*");

            // watch addon's response
            // addon will return "enabledScreenCapturing=true" for success
            // else "enabledScreenCapturing=false" for failure (i.e. user rejection)
            window.addEventListener("message", function(event) {
                if(!isCallbackFired) return;

                var addonMessage = event.data;
                if(!addonMessage || typeof addonMessage.enabledScreenCapturing === 'undefined') return;

                isCallbackFired = true;
                callback(addonMessage);
            }, false);
        }
    };
})();