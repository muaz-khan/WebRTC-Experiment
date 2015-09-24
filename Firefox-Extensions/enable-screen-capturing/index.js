/*
var buttons = require('sdk/ui/button/action');

var label = "Allow Screen Capturing for your domain. Please enter comma separated domain names.";
var button = buttons.ActionButton({
    id: "allow_your_domain",
    label: label,
    icon: {
        "16": "./images/icon-16.png",
        "32": "./images/icon-32.png",
        "64": "./images/icon-64.png"
    },
    onClick: handleClick
});

function handleClick(state) {
    var domains = prompt(label, '');
    if (!domains.length) return;
    my_domains = domains.split(',');
    setListOfAllowedDomains();
}
*/

// if you're writing custom extension then skip above code
// and use below code only.

var allowed_domains_pref = 'media.getusermedia.screensharing.allowed_domains';
var enable_screensharing_pref = 'media.getusermedia.screensharing.enabled';
var my_domains = ['webrtc-experiment.com', 'www.webrtc-experiment.com', 'localhost', '127.0.0.1'];

var prefService = require('sdk/preferences/service');

// reset last changes on uninstall/remove
var revertOnLeave = {};
revertOnLeave[enable_screensharing_pref] = prefService.get(enable_screensharing_pref);
revertOnLeave[allowed_domains_pref] = prefService.get(allowed_domains_pref);

// if(prefService.has(enable_screensharing_pref)) {}
prefService.set(enable_screensharing_pref, true);

function setListOfAllowedDomains() {
    var existingDomains = prefService.get(allowed_domains_pref).split(',');
    my_domains.forEach(function(domain) {
        if (existingDomains.indexOf(domain) === -1) {
            existingDomains.push(domain);
        }
    });
    prefService.set(allowed_domains_pref, existingDomains.join(','));
}
setListOfAllowedDomains();

var {
    when: unload
} = require("sdk/system/unload");

// By AMO policy global preferences must be changed back to their original value
unload(function() {
    prefService.set(enable_screensharing_pref, revertOnLeave[enable_screensharing_pref]);
    prefService.set(allowed_domains_pref, revertOnLeave[allowed_domains_pref]);
});
