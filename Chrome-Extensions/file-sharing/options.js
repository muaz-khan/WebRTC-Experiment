chrome.storage.sync.get(null, function(items) {
    if (items['room_id']) {
        document.getElementById('room_id').value = items['room_id'];
    }
    
    if (items['chunk_size']) {
        document.getElementById('chunk_size').value = items['chunk_size'];
    }
});

document.getElementById('room_id').onblur = function() {
    this.disabled = true;

    chrome.storage.sync.set({
        room_id: this.value
    }, function() {
        document.getElementById('room_id').disabled = false;
    });
};

document.getElementById('chunk_size').onblur = function() {
    this.disabled = true;

    chrome.storage.sync.set({
        chunk_size: this.value
    }, function() {
        document.getElementById('chunk_size').disabled = false;
    });
};
