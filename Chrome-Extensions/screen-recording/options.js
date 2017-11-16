chrome.storage.sync.get(null, function(items) {
    if (items['videoCodec']) {
        querySelectorAll('#videoCodec input').forEach(function(input) {
            var codec = input.parentNode.textContent;
            if (codec !== items['videoCodec']) {
                input.checked = false;
                return;
            }
            input.checked = true;
        });
    } else {
        chrome.storage.sync.set({
            videoCodec: 'Default'
        }, function() {
            querySelectorAll('#videoCodec input')[0].checked = true;
        });
    }

    if (items['videoMaxFrameRates'] && items['videoMaxFrameRates'] !== 'None' && items['videoMaxFrameRates'].length) {
        document.getElementById('videoMaxFrameRates').value = items['videoMaxFrameRates'];
    } else {
        chrome.storage.sync.set({
            videoMaxFrameRates: ''
        }, function() {
            document.getElementById('videoMaxFrameRates').value = 'None';
        });
    }

    if (items['bitsPerSecond']) {
        document.getElementById('bitsPerSecond').value = items['bitsPerSecond'];
    } else {
        chrome.storage.sync.set({
            bitsPerSecond: ''
        }, function() {
            document.getElementById('bitsPerSecond').value = 'default';
        });
    }
});

function querySelectorAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
}

querySelectorAll('#videoCodec input').forEach(function(input) {
    input.onchange = function() {
        querySelectorAll('#videoCodec input').forEach(function(input) {
            input.checked = false;
        });

        this.checked = true;

        var codec = this.parentNode.textContent;

        showSaving();
        chrome.storage.sync.set({
            videoCodec: codec
        }, function() {
            hideSaving();
        });
    };
});

document.getElementById('videoMaxFrameRates').onchange = function() {
    this.disabled = true;

    showSaving();
    chrome.storage.sync.set({
        videoMaxFrameRates: this.value === 'None' ? '' : this.value
    }, function() {
        document.getElementById('videoMaxFrameRates').disabled = false;
        hideSaving();
    });
};

document.getElementById('bitsPerSecond').onchange = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        bitsPerSecond: this.value === 'default' ? '' : this.value
    }, function() {
        document.getElementById('bitsPerSecond').disabled = false;
        hideSaving();
    });
};

function showSaving() {
    document.getElementById('applying-changes').style.display = 'block';
}

function hideSaving() {
    setTimeout(function() {
        document.getElementById('applying-changes').style.display = 'none';
    }, 700);
}

// camera & mic
// microphone-devices
function onGettingDevices(result, stream) {
    chrome.storage.sync.get('microphone', function(storage) {
        result.audioInputDevices.forEach(function(device, idx) {
            var option = document.createElement('option');
            option.innerHTML = device.label || device.id;
            option.value = device.id;

            if (!storage.microphone && idx === 0) {
                option.selected = true;
            }

            if (storage.microphone && storage.microphone === device.id) {
                option.selected = true;
            }

            document.getElementById('microphone-devices').appendChild(option);
        });
    });

    chrome.storage.sync.get('camera', function(storage) {
        result.videoInputDevices.forEach(function(device, idx) {
            var option = document.createElement('option');
            option.innerHTML = device.label || device.id;
            option.value = device.id;

            if (!storage.camera && idx === 0) {
                option.selected = true;
            }

            if (storage.camera && storage.camera === device.id) {
                option.selected = true;
            }

            document.getElementById('camera-devices').appendChild(option);
        });
    });

    stream && stream.getTracks().forEach(function(track) {
        track.stop();
    });
}

getAllAudioVideoDevices(function(result) {
    if (result.audioInputDevices.length && !result.audioInputDevices[0].label) {
        var constraints = { audio: true, video: true };
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
            var video = document.createElement('video');
            video.muted = true;
            if('srcObject' in video) {
                video.srcObject = stream;
            }
            else {
                video.src = URL.createObjectURL(stream);
            }

            onGettingDevices(result, stream);
        }).catch(function() {
            onGettingDevices(result);
        });
        return;
    }

    onGettingDevices(result);
});

document.getElementById('microphone-devices').onchange = function() {
    showSaving();
    chrome.storage.sync.set({
        microphone: this.value
    }, hideSaving);
};

document.getElementById('camera-devices').onchange = function() {
    showSaving();
    chrome.storage.sync.set({
        camera: this.value
    }, hideSaving);
};
