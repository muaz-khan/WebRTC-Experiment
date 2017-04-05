// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Github        - github.com/muaz-khan/Firefox-Extensions

var prefService = require('sdk/preferences/service');

var configToReferListOfAllowedDomains = 'media.getusermedia.screensharing.allowed_domains';
var configToEnableScreenCapturing = 'media.getusermedia.screensharing.enabled';

// replace your own domains with below array
var arrayOfMyOwnDomains = ['webrtc-experiment.com', 'www.webrtc-experiment.com', 'rtcmulticonnection.herokuapp.com', 'localhost', '127.0.0.1'];
// Patterns to match the websites that may check whether ther add-on is installed.
// See https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/util_match-pattern
var patternsOfMyDomains = ['*.webrtc-experiment.com', '*.rtcmulticonnection.herokuapp.com', /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/.*/];

// e.g. if 127.0.0.1 or localhost is already allowed by anyone else
var listOfSimilarAlreadyAllowedDomains = [];

// if(prefService.has(configToEnableScreenCapturing)) {}
// this flag is enabled by default since Firefox version 37 or 38.
// it maybe get removed in version 47-48. (As far as I can assume)
// i.e. screen capturing will always be allowed to list of allowed_domains.
prefService.set(configToEnableScreenCapturing, true);

function addMyOwnDomains() {
    var existingDomains = prefService.get(configToReferListOfAllowedDomains).split(',');
    arrayOfMyOwnDomains.forEach(function(domain) {
        if (existingDomains.indexOf(domain) === -1) {
            existingDomains.push(domain);
        }

        // else { }
        else if (existingDomains.indexOf(domain) !== -1) {
            // Seems domain is already in the list.
            // Keep it when this addon is uninstalled.
            listOfSimilarAlreadyAllowedDomains.push(domain);
        }
    });
    prefService.set(configToReferListOfAllowedDomains, existingDomains.join(','));
}
addMyOwnDomains();

// below code handles addon-uninstall
function removeMyDomainOnUnInstall() {
    var externalDomains = [];

    prefService.get(configToReferListOfAllowedDomains).split(',').forEach(function(domain) {
        // Skip Others Domains
        if (arrayOfMyOwnDomains.indexOf(domain) === -1) {
            // if its NOT mine, keep it.
            externalDomains.push(domain);
        } else if (listOfSimilarAlreadyAllowedDomains.indexOf(domain) !== -1) {
            // seems that localhost/127.0.0.1 are already added by external users
            externalDomains.push(domain);
        }
    });

    prefService.set(configToReferListOfAllowedDomains, externalDomains.join(','));
}

var {
    when: unload
} = require("sdk/system/unload");

// By AMO policy global preferences must be changed back to their original value
unload(function() {
    // remove only my own domains
    removeMyDomainOnUnInstall();
});

var tabs = require("sdk/tabs");
var mod = require("sdk/page-mod");
var self = require("sdk/self");

var pageMod = mod.PageMod({
    include: patternsOfMyDomains,
    contentScriptFile: "./../content-script.js",
    contentScriptWhen: "start", // or "ready"
    onAttach: function(worker) {
        // webpages can verify if their domains are REALLY enabled or not.
        worker.port.on("is-screen-capturing-enabled", function() {
            var isScreenCapturingEnabled = false;

            var arrayOfEnabledDomains = [];

            prefService.get(configToReferListOfAllowedDomains).split(',').forEach(function(domain) {
                if(arrayOfMyOwnDomains.indexOf(domain) !== -1) {
                    // maybe we need to check whether all of, my own, domains are enabled?
                    isScreenCapturingEnabled = true;

                    // we will pass this to the webpage
                    // so webpage can understand which domain is enabled; and which is NOT.
                    arrayOfEnabledDomains.push(domain);
                }
            });

            worker.port.emit('is-screen-capturing-enabled-response', {
                isScreenCapturingEnabled: isScreenCapturingEnabled,

                // pass only those domains that are enabled for screen capturing
                // however those domains MUST be our own
                domains: arrayOfEnabledDomains
            });
        });
    }
});
