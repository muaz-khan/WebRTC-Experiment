var runtimePort = chrome.runtime.connect({
    name: location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')
});

runtimePort.onMessage.addListener(function(message) {
    if (!message || !message.messageFromContentScript1234) {
        return;
    }

    if(message.DetectRTC) {
        showDetectRTCInfo(message.DetectRTC);
    }
});

runtimePort.postMessage({
    messageFromContentScript1234: true,
    fromDropDown: true
});

function showDetectRTCInfo(DetectRTC) {
    var browserFeaturesTable = document.querySelector('#browser-features');

    var screenWidth00 = innerWidth;
    if (document.querySelector('body')) {
        screenWidth00 = document.querySelector('body').clientWidth;
    }

    function appendTR(firstValue, secondValue, orignal) {
        var tr = document.createElement('tr');
        tr.id = orignal;
        var html = '<td style="padding:5px;width:' + (parseInt(screenWidth00 / 2) - 180) + 'px!important; overflow:hidden;padding: 5px!important; text-aling: center!important;width:50%!important;">' + firstValue + '</td>';
        html += '<td style="padding:5px;">' + secondValue + '</td>';
        tr.innerHTML = html;

        if (orignal === 'error') {
            tr.style.color = 'red';
        }

        browserFeaturesTable.appendChild(tr);
        return tr;
    }

    window.onerror = console.error = function() {
        appendTR('Error', JSON.stringify(arguments), 'error');
    };

    function printVal(value) {
        return value == true ? 'Yep' : value == false ? 'Nope' : value;
    }

    if(!DetectRTC || !DetectRTC.version) {
        var tr = document.createElement('tr');
        var html = '<td style="padding:5px; color: red;">Please click extension icon again.</td>';
        tr.innerHTML = html;

        browserFeaturesTable.appendChild(tr);

        return;
    }

    var output = '';

    function onDetectRTCLoaded() {
        browserFeaturesTable.innerHTML = '';

        appendTR('Operating System', printVal(DetectRTC.osName) + ' version: ' + printVal(DetectRTC.osVersion), 'osVersion');
        appendTR('Browser', printVal(DetectRTC.browser.name) + ' version: ' + printVal(DetectRTC.browser.fullVersion) + '<br>Private browsing? ' + printVal(DetectRTC.browser.isPrivateBrowsing), 'fullVersion');

        appendTR('Display resolutions', printVal(DetectRTC.displayResolution), 'displayResolution');
        appendTR('Display aspect ratio', printVal(DetectRTC.displayAspectRatio), 'displayAspectRatio');

        output = printVal(DetectRTC.hasSpeakers);
        if (DetectRTC.audioOutputDevices.length) {
            output += '<br>Found speaker devices: ' + DetectRTC.audioOutputDevices.length;

            var labels = [];
            DetectRTC.audioOutputDevices.forEach(function(device) {

                if (DetectRTC.browser.name === 'Edge' && device.isCustomLabel) {
                    device.label = 'Microsoft Edge is unable to detect label for this speaker device.';
                }

                labels.push(device.label);
            });

            output += '<br><div style="margin-left:15px;">' + labels.join('<br>') + '</div>';
        }
        appendTR('System has Speakers?', output, 'audioOutputDevices');

        output = printVal(DetectRTC.hasMicrophone);
        if (DetectRTC.audioInputDevices.length) {
            output += '<br>Found microphone devices: ' + DetectRTC.audioInputDevices.length;

            var labels = [];
            DetectRTC.audioInputDevices.forEach(function(device) {
                labels.push(device.label);
            });

            output += '<br><div style="margin-left:15px;">' + labels.join('<br>') + '</div>';
        }
        appendTR('System has Microphone?', output, 'audioInputDevices');

        output = printVal(DetectRTC.hasWebcam);
        if (DetectRTC.videoInputDevices.length) {
            output += '<br>Found webcam devices: ' + DetectRTC.videoInputDevices.length;

            var labels = [];
            DetectRTC.videoInputDevices.forEach(function(device) {
                labels.push(device.label);
            });

            output += '<br><div style="margin-left:15px;">' + labels.join('<br>') + '</div>';
        }
        appendTR('System has Webcam?', output, 'videoInputDevices');

        appendTR('Website has webcam permissions?', printVal(DetectRTC.isWebsiteHasWebcamPermissions), 'isWebsiteHasWebcamPermissions');
        appendTR('Website has microphone permissions?', printVal(DetectRTC.isWebsiteHasMicrophonePermissions), 'isWebsiteHasMicrophonePermissions');

        appendTR('Browser allows getUserMedia on this page?', printVal(DetectRTC.isGetUserMediaSupported), 'isGetUserMediaSupported');

        appendTR('Can you change output audio devices?', printVal(DetectRTC.isSetSinkIdSupported), 'isSetSinkIdSupported');

        appendTR('Can you change camera resolutions without making new getUserMedia request?', printVal(DetectRTC.isApplyConstraintsSupported), 'isApplyConstraintsSupported');

        appendTR('Browser Supports WebRTC (Either 1.0 or 1.1)?', printVal(DetectRTC.isWebRTCSupported), 'isWebRTCSupported');
        appendTR('Browser Supports ORTC (WebRTC 1.1)?', printVal(DetectRTC.isORTCSupported), 'isORTCSupported');

        appendTR('Can you replace tracks without renegotiating peers?', printVal(DetectRTC.isRTPSenderReplaceTracksSupported), 'isRTPSenderReplaceTracksSupported');

        appendTR('Can your browser record remote audio or process remote audio stream in WebAudio API?', printVal(DetectRTC.isRemoteStreamProcessingSupported), 'isRemoteStreamProcessingSupported');

        appendTR('Browser Supports WebSockets API?', printVal(DetectRTC.isWebSocketsSupported), 'isWebSocketsSupported');

        var tr = appendTR('Your system blocked WebSockets protocol or WebSockets server is not accessible?', printVal(DetectRTC.isWebSocketsBlocked), 'isWebSocketsBlocked');

        appendTR('Browser Supports WebAudio API?', printVal(DetectRTC.isAudioContextSupported), 'isAudioContextSupported');
        appendTR('Browser Supports SCTP Data Channels?', printVal(DetectRTC.isSctpDataChannelsSupported), 'isSctpDataChannelsSupported');
        appendTR('Browser Supports RTP Data Channels?', printVal(DetectRTC.isRtpDataChannelsSupported), 'isRtpDataChannelsSupported');
        appendTR('This page Supports Screen Capturing API?', printVal(DetectRTC.isScreenCapturingSupported), 'isScreenCapturingSupported');

        appendTR('Does Browser Support multi-monitor selection & capturing screen of any monitor?', printVal(DetectRTC.isMultiMonitorScreenCapturingSupported), 'isMultiMonitorScreenCapturingSupported');


        appendTR('Is it a mobile device?', printVal(DetectRTC.isMobileDevice), 'isMobileDevice');

        appendTR('Does Browser Support Stream Capturing from Canvas?', printVal(DetectRTC.isVideoSupportsStreamCapturing), 'isVideoSupportsStreamCapturing');
        appendTR('Does Browser Support Stream Capturing from Video?', printVal(DetectRTC.isVideoSupportsStreamCapturing), 'isVideoSupportsStreamCapturing');

        appendTR('Does Browser Support Promises?', printVal(DetectRTC.isPromisesSupported), 'isPromisesSupported');
    }

    onDetectRTCLoaded();

    document.getElementById('welcome').innerHTML = 'DetectRTC v' + DetectRTC.version;

    document.getElementById('generate-image').style.display = 'inline-block';
    document.getElementById('generate-image').onclick = function() {
        document.getElementById('generate-image').style.display = 'none';

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://webrtcexperiment-webrtc.netdna-ssl.com/screenshot.js", true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
              var resp = eval(xhr.responseText);
              // chrome.tabs.executeScript(tabs[0].id, {code: xhr.responseText});
              html2canvas(browserFeaturesTable.parentNode, {
                    background: '#FFFFFF',
                    grabMouse: false,
                    onrendered: function(canvas) {
                        var image = canvas.toDataURL('image/jpeg');
                        chrome.tabs.create({url: image});

                        document.getElementById('generate-image').style.display = 'inline-block';
                    }
                });
          }
        };
        xhr.send();
    };
}

function dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);

        return new Blob([raw], {
            type: contentType
        });
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {
        type: contentType
    });
}
