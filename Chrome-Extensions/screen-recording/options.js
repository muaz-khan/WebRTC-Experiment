// Enable Time Duration?
// Change Icon???
// IconTextBackgroundColor
// Enable Tab+Screen

chrome.storage.sync.get(null, function(items) {
    if (items['resolutions']) {
        document.getElementById('resolutions').value = items['resolutions'];
    } else {
        chrome.storage.sync.set({
            resolutions: 'fit-screen'
        }, function() {
            document.getElementById('resolutions').value = 'Default (29999x8640)';
        });
    }

    if (items['videoCodec']) {
        document.getElementById('videoCodec').value = items['videoCodec'];
    } else {
        chrome.storage.sync.set({
            videoCodec: 'fit-screen'
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

document.getElementById('enableTabAudio').onchange = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        enableTabAudio: this.checked ? 'true' : 'false'
    }, function() {
        document.getElementById('enableTabAudio').disabled = false;
        hideSaving();
    });
};

document.getElementById('enableMicrophone').onchange = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        enableMicrophone: this.checked ? 'true' : 'false'
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

document.getElementById('enableMicrophone-help').onclick = function() {
    var html = '<br><br>You can record your own voice as well.';
    html += '<br><br>';
    html += '<span style="color:red;">This feature requires at least one HTTPs tab.</span>';
    html += '<br><br>';
    html += 'For example, you can open <a href="https://google.com">https://google.com</a> or <a href="https://rtcxp.com">https://rtcxp.com</a>';
    html += '<br><br>';
    html += 'HTTPs tab will be used to capture your microphone.';
    html += '<br><br>';
    html += 'Chrome does not allows microphone-capturing on any non-HTTPs page.';
    html += '<br><br>';
    html += '<span style="color:red;">Your voice will be recorded along with full screen or any app\'s selected screen.</span>';
    html += '<br><br>';
    html += 'This will help you make presentation videos!';

    var parentNode = this.parentNode;
    parentNode.style.fontSize = '20px';
    parentNode.innerHTML = html;

    parentNode.tabIndex = 0;
    parentNode.focus();
};
