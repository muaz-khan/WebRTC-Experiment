// Last time updated at Feb 08, 2015, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/Plugin.EveryWhere.js

// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Source Codes      - https://github.com/muaz-khan/PluginRTC

// _____________________
// Plugin.EveryWhere.js

// Original Source: https://github.com/sarandogou/webrtc-everywhere#downloads

(function() {
    var ua = navigator.userAgent.toLowerCase();
    var isSafari = ua.indexOf('safari') != -1 && ua.indexOf('chrome') == -1;
    var isIE = !!((Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, "ActiveXObject")) || ("ActiveXObject" in window));

    if (!(isSafari || isIE)) return;

    function LoadPluginRTC() {
        window.PluginRTC = {};

        var extractPluginObj = function(elt) {
            return elt.isWebRtcPlugin ? elt : elt.pluginObj;
        }
        var attachEventListener = function(elt, type, listener, useCapture) {
            var _pluginObj = extractPluginObj(elt);
            if (_pluginObj) {
                _pluginObj.bindEventListener(type, listener, useCapture);
            } else {
                if (typeof elt.addEventListener !== "undefined") {
                    elt.addEventListener(type, listener, useCapture);
                } else if (typeof elt.addEvent !== "undefined") {
                    elt.addEventListener("on" + type, listener, useCapture);
                }
            }
        }

        function getPlugin() {
            return document.getElementById('WebrtcEverywherePluginId');
        }

        var installPlugin = function() {
            if (document.getElementById('WebrtcEverywherePluginId')) {
                return;
            }

            var pluginObj = document.createElement('object');
            if (isIE) {
                pluginObj.setAttribute('classid', 'CLSID:7FD49E23-C8D7-4C4F-93A1-F7EACFA1EC53');
            } else {
                pluginObj.setAttribute('type', 'application/webrtc-everywhere');
            }
            pluginObj.setAttribute('id', 'WebrtcEverywherePluginId');
            (document.body || document.documentElement).appendChild(pluginObj);
            pluginObj.setAttribute('width', '0');
            pluginObj.setAttribute('height', '0');
        }

        if (document.body) {
            installPlugin();
        } else {
            attachEventListener(window, 'load', function() {
                installPlugin();
            });
            attachEventListener(document, 'readystatechange', function() {
                if (document.readyState == 'complete') {
                    installPlugin();
                }
            });
        }

        var getUserMediaDelayed;
        window.PluginRTC.getUserMedia = navigator.getUserMedia = function(constraints, successCallback, errorCallback) {
            if (document.readyState !== 'complete') {
                if (!getUserMediaDelayed) {
                    getUserMediaDelayed = true;
                    attachEventListener(document, 'readystatechange', function() {
                        if (getUserMediaDelayed && document.readyState == 'complete') {
                            getUserMediaDelayed = false;
                            getPlugin().getUserMedia(constraints, successCallback, errorCallback);
                        }
                    });
                }
            } else getPlugin().getUserMedia(constraints, successCallback, errorCallback);
        }

        window.PluginRTC.attachMediaStream = function(element, stream) {
            if (element.isWebRtcPlugin) {
                element.src = stream;
                return element;
            } else if (element.nodeName.toLowerCase() === 'video') {
                if (!element.pluginObj && stream) {
                    var _pluginObj = document.createElement('object');
                    var _isIE = (Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, "ActiveXObject")) || ("ActiveXObject" in window);
                    if (_isIE) {
                        _pluginObj.setAttribute('classid', 'CLSID:7FD49E23-C8D7-4C4F-93A1-F7EACFA1EC53');
                    } else {
                        _pluginObj.setAttribute('type', 'application/webrtc-everywhere');
                    }
                    element.pluginObj = _pluginObj;

                    _pluginObj.setAttribute('className', element.className);
                    _pluginObj.setAttribute('innerHTML', element.innerHTML);
                    var width = element.getAttribute('width');
                    var height = element.getAttribute('height');
                    var bounds = element.getBoundingClientRect();
                    if (!width) width = bounds.right - bounds.left;
                    if (!height) height = bounds.bottom - bounds.top;

                    if ('getComputedStyle' in window) {
                        var computedStyle = window.getComputedStyle(element, null);
                        if (!width && computedStyle.width != 'auto' && computedStyle.width != '0px') {
                            width = computedStyle.width;
                        }
                        if (!height && computedStyle.height != 'auto' && computedStyle.height != '0px') {
                            height = computedStyle.height;
                        }
                    }
                    if (width) _pluginObj.setAttribute('width', width);
                    else _pluginObj.setAttribute('autowidth', true);

                    if (height) _pluginObj.setAttribute('height', height);
                    else _pluginObj.setAttribute('autoheight', true);

                    (document.body || document.documentElement).appendChild(_pluginObj);
                    if (element.parentNode) {
                        element.parentNode.replaceChild(_pluginObj, element); // replace (and remove) element

                        document.body.appendChild(element);
                        element.style.visibility = 'hidden';
                    }
                }

                if (element.pluginObj) {
                    element.pluginObj.bindEventListener('play', function(objvid) {
                        if (element.pluginObj) {
                            if (element.pluginObj.getAttribute('autowidth') && objvid.videoWidth) {
                                element.pluginObj.setAttribute('width', objvid.videoWidth /* + "px"*/ );
                            }
                            if (element.pluginObj.getAttribute('autoheight') && objvid.videoHeight) {
                                element.pluginObj.setAttribute('height', objvid.videoHeight /* + "px"*/ );
                            }
                        }
                    });
                    element.pluginObj.src = stream;
                }

                return element.pluginObj;
            } else if (element.nodeName.toLowerCase() === 'audio') {
                return element;
            }
        };

        window.PluginRTC.MediaStreamTrack = {};
        var getSourcesDelayed;
        window.PluginRTC.MediaStreamTrack.getSources = function(gotSources) {
            if (document.readyState !== 'complete') {
                if (!getSourcesDelayed) {
                    getSourcesDelayed = true;
                    attachEventListener(document, 'readystatechange', function() {
                        if (getSourcesDelayed && document.readyState == "complete") {
                            getSourcesDelayed = false;
                            getPlugin().getSources(gotSources);
                        }
                    });
                }
            } else {
                getPlugin().getSources(gotSources);
            }
        };

        window.PluginRTC.RTCPeerConnection = function(configuration, constraints) {
            return getPlugin().createPeerConnection(configuration, constraints);
        };

        window.PluginRTC.RTCIceCandidate = function(RTCIceCandidateInit) {
            return getPlugin().createIceCandidate(RTCIceCandidateInit);
        };

        window.PluginRTC.RTCSessionDescription = function(RTCSessionDescriptionInit) {
            return getPlugin().createSessionDescription(RTCSessionDescriptionInit);
        };

        if (window.onPluginRTCInitialized) {
            window.onPluginRTCInitialized(window.PluginRTC);
        }
    }

    window.addEventListener('load', LoadPluginRTC, false);
})();
