var logs = document.querySelector('#logs');
function showLog(log) {
    var div = document.createElement('div');
    div.innerHTML = log;
    logs.appendChild(div);
}

var getUserMediaStreamObject;

function getUserMedia() {
    if(typeof getUserMediaHttp !== 'function') {
        showLog('getUserMedia extension is not installed or disabled.');
        showLog('Please install this extension: <a href="https://chrome.google.com/webstore/detail/getusermedia/nbnpcmljmiinldficickhdoaiblgkggc">https://chrome.google.com/webstore/detail/getusermedia/nbnpcmljmiinldficickhdoaiblgkggc</a>');
        return;
    }

    showLog('Calling getUserMediaHttp...');

    var hints = {
        audio: true,
        video: true
    };

    var checkedRadioId = document.querySelector('input[type=radio]:checked').id;
    
    if(checkedRadioId === 'camera') {
        hints = {
            audio: true,
            video: true
        };
    }

    if(checkedRadioId === 'microphone') {
        hints = {
            audio: true
        };
    }

    if(checkedRadioId === 'screen') {
        hints = {
            video: {
                mediaSource: 'screen'
            }
        };
    }

    showLog('getUserMediaHttp hints: ' + JSON.stringify(hints));

    navigator.mediaDevices.getUserMedia(hints).then(function(stream) {
        getUserMediaStreamObject = stream;

        showLog('Got stream from getUserMediaHttp...');

        stream.getTracks().forEach(function(track) {
            showLog(track.kind + ': ' + track.readyState);
        });
            
        document.querySelector('video').srcObject = stream;
    }).catch(function(e) {
        showLog('Message: ' + e.message);
        showLog('Stack: ' + e.stack);
    });
}

document.querySelector('#getUserMedia').onclick = function() {
    this.disabled = true;

    if(!getUserMediaStreamObject) {
        this.innerHTML = 'Stop getUserMedia Stream';
        getUserMedia();
    }
    else {
        this.innerHTML = 'getUserMedia';

        getUserMediaStreamObject.getTracks().forEach(function(track) {
            track.stop();
        });

        document.querySelector('video').srcObject = null;
    }

    setTimeout(function() {
        document.querySelector('#getUserMedia').disabled = false;
    }, 1000);
};

document.querySelectorAll('#radio-container input[type=radio]').forEach(function(radio) {
    radio.onclick = function() {
        document.querySelectorAll('#radio-container input[type=radio]:checked').forEach(function(radio) {
            radio.checked = false;
        });
        this.checked = true;
    };
});
