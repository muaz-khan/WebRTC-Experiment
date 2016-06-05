/* This Source Code Form is subject to the terms of the Mozilla Public 
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 * taken from: HenrikJoreteg/getScreenMedia/firefox-extension-sample
 * original source: https://hg.mozilla.org/users/blassey_mozilla.com/screenshare-whitelist/
 */
var addon_domains = []; // list of domains the addon added
var allowed_domains_pref = 'media.getusermedia.screensharing.allowed_domains';
var enable_screensharing_pref = 'media.getusermedia.screensharing.enabled';

function startup(data, reason) {
    if (reason === APP_STARTUP) {
        return;
    }
    var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
    var values = prefs.getCharPref(allowed_domains_pref).split(',');
    
    ['webrtc-experiment.com', 'www.webrtc-experiment.com'].forEach(function(domain) {
        if (values.indexOf(domain) === -1) {
            values.push(domain);
            addon_domains.push(domain);
        }
    });
    
    if(prefs.getBoolPref(enable_screensharing_pref) == false) {
        prefs.setBoolPref(enable_screensharing_pref, 1);
    }
    prefs.setCharPref(allowed_domains_pref, values.join(','));
}

function shutdown(data, reason) {
    if (reason === APP_SHUTDOWN) {
        return;
    }
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefBranch);
    var values = prefs.getCharPref(allowed_domains_pref).split(',');
    values = values.filter(function(value) {
        return addon_domains.indexOf(value) === -1;
    });
    prefs.setCharPref(allowed_domains_pref, values.join(','));
}

function install(data, reason) {}

function uninstall(data, reason) {}
