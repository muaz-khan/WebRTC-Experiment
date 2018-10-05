var video = document.querySelector('video');
var fname = document.querySelector('#file-name');
var fsize = document.querySelector('#file-size');
var fduration = document.querySelector('#file-duration');
var fresolutions = document.querySelector('#file-resolutions');
var header = document.querySelector('header');
var header = document.querySelector('header');

var browserCache = document.querySelector('#browser-cache');

function setVideoWidth() {
    video.style.cursor = 'pointer';
    video.style.marginTop = header.clientHeight;
    video.style.height = innerHeight - header.clientHeight;
}

window.onresize = setVideoWidth;

var file;

function onGettingFile(f, item) {
    file = f;

    if (!file) {
        if (item && item.name) {
            header.querySelector('p').innerHTML = item.display + ' has no video data.';
            header.querySelector('span').innerHTML = '';
        } else {
            header.querySelector('p').innerHTML = 'You did NOT record anything yet.';
            header.querySelector('span').innerHTML = '';
        }
        return;
    }

    file.item = item;

    if(!file.url || file.url.toString().toLowerCase().indexOf('youtube') !== -1) {
        file.url = URL.createObjectURL(file);
    }

    (function() {
        // this function calculates the duration
        var hidden = document.createElement('video');
        var url = file.url;
        hidden.currentTime = 9999999999;
        hidden.onloadedmetadata = function() {
            if(url !== file.url) return;

            fresolutions.innerHTML = hidden.clientWidth + 'x' + hidden.clientHeight;

            if(hidden.duration === Infinity) {
                setTimeout(hidden.onloadedmetadata, 1000);
                return;
            }
            fduration.innerHTML = formatSecondsAsTime(hidden.duration);
            hidden.parentNode.removeChild(hidden);
        };
        hidden.style = 'position: absolute; top: -99999999999; left: -99999999999; opacity: 0;';
        (document.body || document.documentElement).appendChild(hidden);
        hidden.muted = true;
        hidden.src = file.url;
        hidden.play();
    })();

    video.onloadedmetadata = function() {
        // video.onloadedmetadata = null;

        // seek back to the beginning
        // video.currentTime = 0;
    };

    video.src = file.url;
    video.currentTime = 9999999999;

    if(file.name && (file.name.indexOf('.mp3') !== -1 || file.name.indexOf('.wav') !== -1 || file.name.indexOf('.ogg') !== -1)) {
        video.style.background = 'url(images/no-video.png) no-repeat center center';
        video.currentTime = 0;
    }
    else {
        video.style.background = '';
    }

    fname.innerHTML = item.display;
    fsize.innerHTML = bytesToSize(file.size);

    setVideoWidth();
    video.onclick = function() {
        video.onclick = null;
        video.style.cursor = '';
        video.play();
    };

    var html = 'This file is in your browser cache. Click <a href="' + file.url + '" download="' + file.name + '">here</a> to download.';
    if (item.php && item.youtube) {
        html = 'Click to download file from <a href="' + item.php + '" target="_blank">Private Server</a> <img src="images/cross-icon.png" class="cross-icon" title="Delete from server"> or <a href="' + item.youtube + '" target="_blank">YouTube</a>';
    } else if (item.php) {
        html = 'Click to download file from: <a href="' + item.php + '" target="_blank">' + item.php + '</a> <img src="images/cross-icon.png" class="cross-icon" title="Delete from server">';
    } else if (item.youtube) {
        html = 'Click to download file from: <a href="' + item.youtube + '" target="_blank">' + item.youtube + '</a>';
    }
    browserCache.innerHTML = html;
    if (browserCache.querySelector('.cross-icon')) {
        browserCache.querySelector('.cross-icon').onclick = function() {
            if (window.confirm('Do you want to delete this video from server?')) {
                deleteFromPHPServer(item.name, function(response) {
                    DiskStorage.UpdateFileInfo(file.name, {
                        php: ''
                    }, function() {
                        if (response === 'deleted') {
                            location.reload();
                        } else {
                            alert(response);
                        }
                    });
                });
            }
        };
    }

    localStorage.setItem('selected-file', file.name);
}

var recentFile = localStorage.getItem('selected-file');
DiskStorage.GetLastSelectedFile(recentFile, function(file) {
    if (!file) {
        onGettingFile(file);
        return;
    }

    DiskStorage.GetFilesList(function(list) {
        if (!recentFile) {
            onGettingFile(file, list[0]);
            return;
        }

        var found;
        list.forEach(function(item) {
            if (typeof item === 'string') {
                if (item === recentFile) {
                    found = {
                        name: item,
                        display: item,
                        php: '',
                        youtube: ''
                    };
                }
            } else if (item.name === recentFile) {
                found = item;
            }
        });

        if (!found) {
            onGettingFile(file, list[0]);
            return;
        }

        onGettingFile(file, found);
    });
});

var btnUploadDropDown = document.querySelector('#btn-upload-dropdown');
document.querySelector('#btn-upload').onclick = function(e) {
    e.stopPropagation();

    if (!file) {
        alert('You have no recordings.');
        return;
    }

    if (btnUploadDropDown.className === 'visible') {
        btnUploadDropDown.className = '';
    } else {
        btnUploadDropDown.className = 'visible';
    }
};

var btnRecordingsListDropDown = document.querySelector('#btn-recordings-list-dropdown');
document.querySelector('#btn-recordings-list').onclick = function(e) {
    e.stopPropagation();

    if (btnRecordingsListDropDown.className === 'visible') {
        btnRecordingsListDropDown.className = '';
        btnRecordingsListDropDown.innerHTML = '';
    } else {
        btnRecordingsListDropDown.className = 'visible';

        btnRecordingsListDropDown.innerHTML = '';
        DiskStorage.GetFilesList(function(list) {
            if (!list.length) {
                btnRecordingsListDropDown.className = '';
                alert('You have no recordings.');
                return;
            }

            list.forEach(function(item) {
                var div = document.createElement('div');
                div.innerHTML = '<img src="images/cross-icon.png" class="cross-icon"><img src="images/edit-icon.png" class="edit-icon">' + item.display;
                btnRecordingsListDropDown.appendChild(div);

                div.querySelector('.cross-icon').onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!window.confirm('Are you sure you want to permanently delete the selected recording?')) {
                        return;
                    }

                    function afterDelete() {
                        if (div.previousSibling) {
                            div.previousSibling.click();
                        } else if (div.nextSibling) {
                            div.nextSibling.click();
                        } else {
                            location.reload();
                        }

                        div.parentNode.removeChild(div);
                    }

                    DiskStorage.RemoveFile(item.name, function() {
                        if(!item.php || !item.php.length) {
                            afterDelete();
                            return;
                        }

                        deleteFromPHPServer(item.name, afterDelete);
                    });
                };

                div.querySelector('.edit-icon').onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var newFileName = prompt('Please enter new file name', item.display) || item.display;

                    DiskStorage.UpdateFileInfo(item.name, {
                        display: newFileName
                    }, function() {
                        item.display = newFileName;

                        onGettingFile(file, item);
                        document.body.onclick();
                    });
                };

                div.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    DiskStorage.Fetch(item.name, function(file) {
                        onGettingFile(file, item);
                    });

                    document.body.onclick();
                };

                if (file && file.item && file.item.name === item.name) {
                    div.className = 'btn-upload-dropdown-selected';
                }
            });
        });
    }
};

document.body.onclick = function() {
    if (btnUploadDropDown.className === 'visible') {
        btnUploadDropDown.className = '';
    }

    if (btnRecordingsListDropDown.className === 'visible') {
        btnRecordingsListDropDown.className = '';
    }
};

function formatSecondsAsTime(secs) {
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600)) / 60);
    var sec = Math.floor(secs - (hr * 3600) - (min * 60));

    if (min < 10) {
        min = "0" + min;
    }
    if (sec < 10) {
        sec = "0" + sec;
    }

    if (hr <= 0) {
        return min + ':' + sec;
    }

    return hr + ':' + min + ':' + sec;
}
