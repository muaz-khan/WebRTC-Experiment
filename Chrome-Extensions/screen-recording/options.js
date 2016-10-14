// Enable Time Duration?
// Change Icon???
// IconTextBackgroundColor
// Enable Tab+Screen

chrome.storage.sync.get(null, function(items) {
    if (items['resolutions']) {
        document.getElementById('resolutions').value = items['resolutions'];
    } else {
        chrome.storage.sync.set({
            resolutions: 'Default (29999x8640)'
        }, function() {
            document.getElementById('resolutions').value = 'Default (29999x8640)';
        });
    }

    if (items['videoCodec']) {
        document.getElementById('videoCodec').value = items['videoCodec'];
    } else {
        chrome.storage.sync.set({
            videoCodec: ''
        }, function() {
            document.getElementById('videoCodec').value = 'Default';
        });
    }

    if (items['videoMaxFrameRates']) {
        document.getElementById('videoMaxFrameRates').value = items['videoMaxFrameRates'];
    } else {
        chrome.storage.sync.set({
            videoMaxFrameRates: ''
        }, function() {
            document.getElementById('videoMaxFrameRates').value = '';
        });
    }

    if (items['videoBitsPerSecond']) {
        document.getElementById('videoBitsPerSecond').value = items['videoBitsPerSecond'];
    } else {
        chrome.storage.sync.set({
            videoBitsPerSecond: ''
        }, function() {
            document.getElementById('videoBitsPerSecond').value = '';
        });
    }

    if (items['audioBitsPerSecond']) {
        document.getElementById('audioBitsPerSecond').value = items['audioBitsPerSecond'];
    } else {
        chrome.storage.sync.set({
            audioBitsPerSecond: ''
        }, function() {
            document.getElementById('audioBitsPerSecond').value = '';
        });
    }

    if (items['enableTabAudio']) {
        if(getChromeVersion() < 53) {
            items['enableTabAudio'] = 'false';
        }

        document.getElementById('enableTabAudio').checked = items['enableTabAudio'] === 'true';
    } else {
        chrome.storage.sync.set({
            enableTabAudio: 'false'
        }, function() {
            document.getElementById('enableTabAudio').removeAttribute('checked');
        });
    }

    if (items['enableMicrophone']) {
        document.getElementById('enableMicrophone').checked = items['enableMicrophone'] === 'true';
    } else {
        chrome.storage.sync.set({
            enableMicrophone: 'false'
        }, function() {
            document.getElementById('enableMicrophone').removeAttribute('checked');
        });
    }
});

document.getElementById('resolutions').onchange = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        resolutions: this.value
    }, function() {
        document.getElementById('resolutions').disabled = false;
        hideSaving();
    });
};

document.getElementById('videoCodec').onchange = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        videoCodec: this.value
    }, function() {
        document.getElementById('videoCodec').disabled = false;
        hideSaving();
    });
};

document.getElementById('videoMaxFrameRates').onblur = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        videoMaxFrameRates: this.value
    }, function() {
        document.getElementById('videoMaxFrameRates').disabled = false;
        hideSaving();
    });
};

document.getElementById('enableTabAudio').onchange = function(event) {
    if(!!event) {
        // microphone along with tab+audio is NOT allowed
        document.getElementById('enableMicrophone').checked = false;
        document.getElementById('enableMicrophone').onchange();
    }

    if(getChromeVersion() < 53) {
        this.checked = false;

        var label = this.parentNode.querySelector('label');
        label.style.color = 'red';
        label.innerHTML = 'Please try Chrome version 53 or newer.';

        var small = this.parentNode.querySelector('small');
        small.style.color = '#bb0000';
        small.innerHTML = 'You are using Chrome version ' + getChromeVersion() + ' which is <b>incapable</b> to capture audios on any selected tab.';
        return;
    }

    document.getElementById('enableTabAudio').disabled = true;
    showSaving();
    chrome.storage.sync.set({
        enableTabAudio: document.getElementById('enableTabAudio').checked ? 'true' : 'false'
    }, function() {
        document.getElementById('enableTabAudio').disabled = false;
        hideSaving();
    });
};

document.getElementById('enableMicrophone').onchange = function(event) {
    if(!!event) {
        // microphone along with tab+audio is NOT allowed
        document.getElementById('enableTabAudio').checked = false;
        document.getElementById('enableTabAudio').onchange();
    }

    document.getElementById('enableMicrophone').disabled = true;
    showSaving();
    chrome.storage.sync.set({
        enableMicrophone: document.getElementById('enableMicrophone').checked ? 'true' : 'false'
    }, function() {
        document.getElementById('enableMicrophone').disabled = false;
        hideSaving();
    });
};

document.getElementById('videoBitsPerSecond').onblur = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        videoBitsPerSecond: this.value
    }, function() {
        document.getElementById('videoBitsPerSecond').disabled = false;
        hideSaving();
    });
};

document.getElementById('audioBitsPerSecond').onblur = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        audioBitsPerSecond: this.value
    }, function() {
        document.getElementById('audioBitsPerSecond').disabled = false;
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

function getChromeVersion() {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : 52;
}
