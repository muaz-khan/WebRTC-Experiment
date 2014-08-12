// Last time updated at August 03, 2014, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/Plugin.Temasys.js

// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Source Codes      - https://github.com/muaz-khan/PluginRTC

// __________________
// Plugin.Temasys.js

// Original Source: https://temasys.atlassian.net/wiki/display/TWPP/WebRTC+Plugins

(function() {
    var ua = navigator.userAgent.toLowerCase();
    var isSafari = ua.indexOf('safari') != -1 && ua.indexOf('chrome') == -1;
    var isInternetExplorer = !!((Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, "ActiveXObject")) || ("ActiveXObject" in window));

    if (!(isSafari || isInternetExplorer)) return;

    function LoadPluginRTC() {
        window.PluginRTC = {};
        
        var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
        var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        // At least Safari 3+: "[object HTMLElementConstructor]"
        var isChrome = !!window.chrome && !isOpera; // Chrome 1+
        var isIE = /*@cc_on!@*/ false || !!document.documentMode; // At least IE6

        var RTCPeerConnection = null;
        var getUserMedia = null;
        var attachMediaStream = null;

        var TemPageId = Math.random().toString(36).slice(2);

        var TemStaticWasInit = 1;
        TemPrivateWebRTCReadyCb = function() {
            if (TemStaticWasInit === 1) {
                if (typeof WebRTCReadyCb === 'function') {
                    WebRTCReadyCb();
                }
            }
            TemStaticWasInit++;
        };

        function plugin0() {
            return document.getElementById('_Tem_plugin0');
        }
        plugin = plugin0;

        isPluginInstalled = function(comName, plugName, installedCb, notInstalledCb) {
            if (isChrome || isSafari || isFirefox) { // Not IE (firefox, for example)
                var pluginArray = navigator.plugins;
                for (var i = 0; i < pluginArray.length; i++) {
                    if (pluginArray[i].name.indexOf(plugName) >= 0) {
                        installedCb();
                        return;
                    }
                }
                notInstalledCb();
            } else if (isIE) { // We're running IE
                try {
                    var tmp = new ActiveXObject(comName + '.' + plugName);
                } catch (e) {
                    notInstalledCb();
                    return;
                }
                installedCb();
            } else {
                // Unsupported
                return;
            }
        };

        // defines webrtc's JS interface according to the plugin's implementation
        defineWebRTCInterface = function() {
            // ==== UTIL FUNCTIONS ===
            function isDefined(variable) {
                return variable !== null && variable !== undefined;
            }

            injectPlugin = function() {
                var frag = document.createDocumentFragment();
                var temp = document.createElement('div');
                temp.innerHTML = '<object id="_Tem_plugin0" type="application/x-temwebrtcplugin" ' +
                    'width="1" height="1">' +
                    '<param name="pluginId" value="_Tem_plugin0" /> ' +
                    '<param name="windowless" value="false" /> ' +
                    '<param name="pageId" value="' + TemPageId + '" /> ' +
                    '<param name="onload" value="TemPrivateWebRTCReadyCb" />' +
                    // '<param name="forceGetAllCams" value="True" />' +  // uncomment to be able to use virtual cams
                    '</object>';
                while (temp.firstChild) {
                    frag.appendChild(temp.firstChild);
                }
                document.body.appendChild(frag);
            };
            injectPlugin();

            // END OF UTIL FUNCTIONS

            // The RTCSessionDescription object.
            window.PluginRTC.RTCSessionDescription = function(info) {
                return plugin().ConstructSessionDescription(info.type, info.sdp);
            };

            // PEER CONNECTION
            window.PluginRTC.RTCPeerConnection = function(servers, constraints) {
                var iceServers = null;
                if (servers) {
                    iceServers = servers.iceServers;
                    for (var i = 0; i < iceServers.length; i++) {
                        if (iceServers[i].urls && !iceServers[i].url) {
                            iceServers[i].url = iceServers[i].urls;
                        }
                        iceServers[i].hasCredentials = isDefined(iceServers[i].username) &&
                            isDefined(iceServers[i].credential);
                    }
                }
                var mandatory = (constraints && constraints.mandatory) ? constraints.mandatory : null;
                var optional = (constraints && constraints.optional) ? constraints.optional : null;
                return plugin().PeerConnection(TemPageId, iceServers, mandatory, optional);
            };

            window.PluginRTC.MediaStreamTrack = {};
            window.PluginRTC.MediaStreamTrack.getSources = function(callback) {
                return plugin().GetSources(callback);
            };

            window.PluginRTC.getUserMedia = function(constraints, successCallback, failureCallback) {
                plugin().getUserMedia(constraints, successCallback, failureCallback);
            };

            // Attach a media stream to an element.
            window.PluginRTC.attachMediaStream = function(element, stream) {
                stream.enableSoundTracks(true);
                if (element.nodeName.toLowerCase() !== 'audio') {
                    var elementId = element.id.length === 0 ? Math.random().toString(36).slice(2) : element.id;
                    if (!element.isTemWebRTCPlugin || !element.isTemWebRTCPlugin()) {
                        var frag = document.createDocumentFragment();
                        var temp = document.createElement('div');
                        var classHTML = element.className ? 'class="' + element.className + '" ' : '';
                        temp.innerHTML = '<object id="' + elementId + '" ' +
                            classHTML + 'type="application/x-temwebrtcplugin">' +
                            '<param name="pluginId" value="' + elementId + '" /> ' +
                            '<param name="pageId" value="' + TemPageId + '" /> ' +
                            '<param name="windowless" value="true" /> ' +
                            '<param name="streamId" value="' + stream.id + '" /> ' +
                            '</object>';
                        while (temp.firstChild) {
                            frag.appendChild(temp.firstChild);
                        }

                        var rectObject = element.getBoundingClientRect();
                        element.parentNode.insertBefore(frag, element);
                        frag = document.getElementById(elementId);
                        frag.width = rectObject.width + 'px';
                        frag.height = rectObject.height + 'px';
                        element.parentNode.removeChild(element);

                    } else {
                        var children = element.children;
                        for (var i = 0; i !== children.length; ++i) {
                            if (children[i].name === 'streamId') {
                                children[i].value = stream.id;
                                break;
                            }
                        }
                        element.setStreamId(stream.id);
                    }

                    var newElement = document.getElementById(elementId);
                    newElement.onclick = element.onclick ? element.onclick : function(arg) {};
                    newElement._TemOnClick = function(id) {
                        var arg = {
                            srcElement: document.getElementById(id)
                        };
                        newElement.onclick(arg);
                    };
                    return newElement;
                } else { // is audio element
                    // The sound was enabled, there is nothing to do here
                    return element;
                }
            };

            window.PluginRTC.RTCIceCandidate = function(candidate) {
                return plugin().ConstructIceCandidate(candidate.sdpMid,
                    candidate.sdpMLineIndex,
                    candidate.candidate);
            };
            
            plugin().setLogFunction(console);
            
            if(window.onPluginRTCInitialized) {
                window.onPluginRTCInitialized(window.PluginRTC);
            }
        };

        pluginNeededButNotInstalledCb = function() {
            console.error('Your browser is not webrtc ready and Temasys plugin is not installed. You need to reload the browser after plugin installations.');
        };

        // Try to detect the plugin and act accordingly
        isPluginInstalled('Tem', 'TemWebRTCPlugin', defineWebRTCInterface, pluginNeededButNotInstalledCb);
    }

    window.addEventListener('load', LoadPluginRTC, false);
})();
