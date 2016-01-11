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

    if (items['min_bandwidth']) {
        document.getElementById('min_bandwidth').value = items['min_bandwidth'];
    } else {
        chrome.storage.sync.set({
            min_bandwidth: 512
        }, function() {});
    }

    if (items['max_bandwidth']) {
        document.getElementById('max_bandwidth').value = items['max_bandwidth'];
    } else {
        chrome.storage.sync.set({
            max_bandwidth: 1048
        }, function() {});
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

document.getElementById('min_bandwidth').onblur = function() {
    var maxValue = parseInt(document.getElementById('max_bandwidth').value);
    var minValue = parseInt(document.getElementById('min_bandwidth').value);
    if(maxValue < minValue) {
        console.log('Min-Bandwidth must be lower than Max-Bandwidth.');
        document.getElementById('max_bandwidth').value = 
            document.getElementById('min_bandwidth').value = this.value;
        return;
    }
    
    this.disabled = true;

    chrome.storage.sync.set({
        min_bandwidth: this.value
    }, function() {
        document.getElementById('min_bandwidth').disabled = false;
    });
};

document.getElementById('max_bandwidth').onblur = function() {
    var maxValue = parseInt(document.getElementById('max_bandwidth').value);
    var minValue = parseInt(document.getElementById('min_bandwidth').value);
    if(maxValue < minValue) {
        console.log('Min-Bandwidth must be lower than Max-Bandwidth.');
        document.getElementById('max_bandwidth').value = 
            document.getElementById('min_bandwidth').value = this.value;
        return;
    }
    
    this.disabled = true;

    chrome.storage.sync.set({
        max_bandwidth: this.value
    }, function() {
        document.getElementById('max_bandwidth').disabled = false;
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
