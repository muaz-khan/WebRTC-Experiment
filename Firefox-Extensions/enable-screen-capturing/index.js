var prefService = require('sdk/preferences/service');

var configToReferListOfAllowedDomains = 'media.getusermedia.screensharing.allowed_domains';
var configToEnableScreenCapturing = 'media.getusermedia.screensharing.enabled';

// replace your own domains with below array
var arrayOfMyOwnDomains = ['webrtc-experiment.com', 'www.webrtc-experiment.com', 'localhost', '127.0.0.1'];

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
        if (existingDomains.indexOf(domain) !== -1) {
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

/*
* connect with webpage using postMessage
* a webpage can use following API to enable screen capturing for his domains
* window.postMessage({ enableScreenCapturing: true, domains: ["www.firefox.com"] }, "*");
* 
* current firefox user is always asked to confirm whether he is OK to enable screen capturing for requested domains.
*/
var tabs = require("sdk/tabs");
var mod = require("sdk/page-mod");
var self = require("sdk/self");

var pageMod = mod.PageMod({
    include: ["*"],
    contentScriptFile: "./../content-script.js",
    contentScriptWhen: "start", // or "ready"
    onAttach: function(worker) {
        worker.port.on("installation-confirmed", function(domains) {
            // make sure that this addon's self-domains (i.e. "arrayOfMyOwnDomains")
            // are not included in the "listOfSimilarAlreadyAllowedDomains" array.
            removeMyDomainOnUnInstall();

            arrayOfMyOwnDomains = arrayOfMyOwnDomains.concat(domains);
            addMyOwnDomains();
        });
    }
});
