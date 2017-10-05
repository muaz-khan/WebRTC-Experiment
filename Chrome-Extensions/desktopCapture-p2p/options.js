chrome.storage.sync.get(null, function(items) {
    if (items['resolutions']) {
        document.getElementById('resolutions').value = items['resolutions'];
    } else {
        chrome.storage.sync.set({
            resolutions: 'fit-screen'
        }, function() {
            document.getElementById('resolutions').value = 'fit-screen'
        });
    }

    if (items['room_password']) {
        document.getElementById('room_password').value = items['room_password'];
    }

    if (items['room_id']) {
        document.getElementById('room_id').value = items['room_id'];
    }
});

document.getElementById('resolutions').onchange = function() {
    this.disabled = true;

    chrome.storage.sync.set({
        resolutions: this.value
    }, function() {
        document.getElementById('resolutions').disabled = false;
    });
};

document.getElementById('room_password').onblur = function() {
    this.disabled = true;

    chrome.storage.sync.set({
        room_password: this.value
    }, function() {
        document.getElementById('room_password').disabled = false;
    });
};

document.getElementById('room_id').onblur = function() {
    this.disabled = true;

    chrome.storage.sync.set({
        room_id: this.value
    }, function() {
        document.getElementById('room_id').disabled = false;
    });
};
