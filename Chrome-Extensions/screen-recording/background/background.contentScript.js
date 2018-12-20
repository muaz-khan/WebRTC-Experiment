var port = chrome.runtime.connect();
port.onMessage.addListener(function(message) {
    message.messageFromContentScript1234 = true
    window.postMessage(message, '*');
});

window.addEventListener('message', function(event) {
    if (event.source != window || !event.data.messageFromContentScript1234) return;
    port.postMessage(event.data);
});

// ctrl+tab to stop the recording
var isControlKeyPressed;
window.addEventListener('keydown', function(e) {
    keyCode = e.which || e.keyCode || 0;

    if(keyCode === 17) {
        isControlKeyPressed = true;
    }
}, false);

window.addEventListener('keyup', function(e) {
    keyCode = e.which || e.keyCode || 0;

    if(isControlKeyPressed && keyCode === 32) {
        port.postMessage({
            messageFromContentScript1234: true,
            stopRecording: true,
            dropdown: true
        });

        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    if(keyCode === 17) {
        isControlKeyPressed = false;
    }
}, false);

function RecordRTC_Extension(config) {
    config = config || {
        enableTabCaptureAPI: false,
        enableTabCaptureAPIAudioOnly: false,
        enableScreen: true,
        enableSpeakers: true,
        enableCamera: false,
        enableMicrophone: false
    };

    var startCallback = function() {
        //
    };

    var stopCallback = function() {
        //
    };

    var supportedValues = ['enableTabCaptureAPI', 'enableTabCaptureAPIAudioOnly', 'enableScreen', 'enableSpeakers', 'enableCamera', 'enableMicrophone'];

    window.addEventListener('message', function(event) {
        if (event.source != window || !event.data.messageFromContentScript1234) return;
        
        if(event.data.startedRecording === true) {
            startCallback();
        }

        if(event.data.stoppedRecording === true) {
            stopCallback(dataURItoBlob(event.data.file));
        }
    });

    // via: https://stackoverflow.com/a/12300351/552182
    function dataURItoBlob(dataURI) {
      var byteString = atob(dataURI.split(',')[1]);
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      var blob = new Blob([ab], {type: mimeString});
      return blob;
    }

    function getSupoortedFormats() {
        return [{
            enableScreen: true
        }, {
            enableScreen: true,
            enableMicrophone: true
        }, {
            enableScreen: true,
            enableSpeakers: true
        }, {
            enableScreen: true,
            enableMicrophone: true,
            enableSpeakers: true
        }, {
            enableTabCaptureAPI: true
        }, {
            enableTabCaptureAPI: true,
            enableTabCaptureAPIAudioOnly: true
        }, {
            enableScreen: true,
            enableCamera: true
        }, {
            enableMicrophone: true,
            enableCamera: true
        }, {
            enableMicrophone: true,
            enableSpeakers: true
        }, {
            enableMicrophone: true
        }, {
            enableSpeakers: true
        }];
    }

    return {
        startRecording: function(options, callback) {
            startCallback = callback || function() {};

            if(options) {
                if(typeof options != 'object') {
                    callback(false, 'First parameter must be an object.')
                    return;
                }

                if(!Object.keys(options).length) {
                    callback(false, 'First parameter must specify at least one recoding type.')
                    return;
                }

                var mismatchedValues = [];
                Object.keys(options).forEach(function(key) {
                    if(supportedValues.indexOf(key) == -1) {
                        mismatchedValues.push(key);
                    }
                });

                if(mismatchedValues.length) {
                    callback(false, 'Unsupported parameters detected: ' + mismatchedValues.join(', '))
                    return;
                }

                config = options; // override
            }

            config.messageFromContentScript1234 = true;
            config.startRecording = true;
            config.RecordRTC_Extension = true; // hint for background page

            window.postMessage(config, '*');
        },
        stopRecording: function(callback) {
            stopCallback = callback || function() {};
            
            if(!config.startRecording) {
                callback(false, 'There is no recorder to stop.');
                return;
            }

            config.startRecording = false;
            config.stopRecording = true;

            window.postMessage(config, '*');
        },
        getSupoortedFormats: getSupoortedFormats
    }
}

var script = document.createElement('script');
(document.head || document.body || document.documentElement).appendChild(script).text = RecordRTC_Extension.toString() + ';;';
script.remove();
