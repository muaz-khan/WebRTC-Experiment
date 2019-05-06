document.write('<h1 style="font-family: Courier New; font-size: 30px; color:red;margin-top:200px;">The purpose of this page is to access your camera and microphone.</h1>');

var port = chrome.runtime.connect();

navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
}).then(function(stream) {
    var tracksLength = stream.getTracks().length;

    stream.getTracks().forEach(function(track) {
        track.stop();
    });

    if(tracksLength <= 1) {
        throw new Error('Expected two tracks but received: ' + tracksLength);
    }

    port.postMessage({
        messageFromContentScript1234: true,
        startRecording: true
    });
    window.close();
}).catch(function(e) {
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(function(stream) {
        var tracksLength = stream.getTracks().length;

        stream.getTracks().forEach(function(track) {
            track.stop();
        });

        if(tracksLength < 1) {
            throw new Error('Expected at least one track but received: ' + tracksLength);
        }

        port.postMessage({
            messageFromContentScript1234: true,
            startRecording: true,
            onlyMicrophone: true
        });
        window.close();
    }).catch(function() {
        var html = '<h1 style="font-family: Courier New; font-size: 30px; color:red;margin-top:20px;">Unable to access your camera and/or microphone.</h1>';
        html += '<p style="font-family: Courier New; font-size: 25px; color:black;margin-top:20px;">Please go to following pages and remove "RecordRTC" from blocked-list:</p>';
        html += '<pre style="font-family: Courier New; font-size: 25px; color:blue;margin-top:20px;">chrome://settings/content/camera?search=camera</pre>';
        html += '<pre style="font-family: Courier New; font-size: 25px; color:blue;margin-top:20px;">chrome://settings/content/microphone?search=microphone</pre>';
        
        if(e.message && e.message.toString().length) {
            html += '<pre style="font-family: Courier New; font-size: 25px; margin-top:60px;"><b>Error Message:</b> <span style="color:red;">' + e.message + '</span></pre>';
        }

        document.body.innerHTML = html;
    });
});
