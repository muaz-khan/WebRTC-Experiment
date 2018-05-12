var video = document.querySelector('video');
var fname = document.querySelector('#file-name');
var fsize = document.querySelector('#file-size');
// var fduration = document.querySelector('#file-duration');
var header = document.querySelector('header');
var title = document.querySelector('title');
var header = document.querySelector('header');

function setVideoWidth() {
    video.style.cursor = 'pointer';
    video.style.marginTop = header.clientHeight;
    video.style.height = innerHeight - header.clientHeight;
}

window.onresize = setVideoWidth;

var file;

function onGettingFile(f) {
    file = f;

    if (!file) {
        header.querySelector('p').innerHTML = 'You did NOT record anything yet.';
        header.querySelector('span').innerHTML = '';
        return;
    }

    video.src = URL.createObjectURL(file);
    fname.innerHTML = fname.download = title.innerHTML = file.name;
    fname.innerHTML = '<img src="images/download-icon.png" style="height: 32px; vertical-align: middle;margin-right: 5px;">' + file.name;
    fname.href = video.src;
    fsize.innerHTML = bytesToSize(file.size);
    // fduration.innerHTML = file.duration || '00:00';

    setVideoWidth();
    video.onclick = function() {
        video.onclick = null;
        video.style.cursor = '';
        video.play();
    };
}
DiskStorage.GetRecentFile(onGettingFile);

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
        DiskStorage.GetFilesList(function(fileNames) {
            if (!fileNames.length) {
                btnRecordingsListDropDown.className = '';
                alert('You have no recordings.');
                return;
            }

            fileNames.forEach(function(fName) {
                var div = document.createElement('div');
                div.innerHTML = '<img src="images/cross-icon.png" class="cross-icon">' + fName;
                btnRecordingsListDropDown.appendChild(div);

                div.querySelector('.cross-icon').onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!window.confirm('Are you sure you want to permanently delete the selected recording?')) {
                        return;
                    }

                    DiskStorage.RemoveFile(fName, function() {
                        location.reload();
                    });
                };

                div.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    DiskStorage.Fetch(fName, function(file) {
                        onGettingFile(file);
                    });

                    document.body.onclick();
                };
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
