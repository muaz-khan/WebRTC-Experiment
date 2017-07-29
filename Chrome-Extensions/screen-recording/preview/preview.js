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

DiskStorage.Fetch('latest-file', function(f) {
    file = f;

    if (!file) {
        header.innerHTML = 'You did NOT record anything yet.';
        return;
    }

    video.src = URL.createObjectURL(file);
    fname.innerHTML = fname.download = title.innerHTML = file.name;
    fname.href = video.src;
    fsize.innerHTML = bytesToSize(file.size);
    // fduration.innerHTML = file.duration || '00:00';

    setVideoWidth();
    video.onclick = function() {
        video.onclick = null;
        video.style.cursor = '';
        video.play();
    };
});

var btnUploadDropDown = document.querySelector('#btn-upload-dropdown');
document.querySelector('#btn-upload').onclick = function(e) {
    e.stopPropagation();

    if(btnUploadDropDown.className === 'visible') {
        btnUploadDropDown.className = '';
    }
    else {
        btnUploadDropDown.className = 'visible';
    }
};

document.body.onclick = function() {
    if(btnUploadDropDown.className === 'visible') {
        btnUploadDropDown.className = '';
    }
};
