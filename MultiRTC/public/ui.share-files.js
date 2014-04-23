// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Experiments       - github.com/muaz-khan/WebRTC-Experiment

// file sharing
var progressHelper = { };
rtcMultiConnection.onFileStart = function(file) {
    addNewMessage({
        header: rtcMultiConnection.extra.username,
        message: '<strong>' + file.name + '</strong> ( ' + bytesToSize(file.size) + ' )',
        userinfo: getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.userid], 'images/share-files.png'),
        callback: function(div) {
            var innerDiv = document.createElement('div');
            innerDiv.title = file.name;
            innerDiv.innerHTML = '<label>0%</label><progress></progress>';
            div.querySelector('.message').appendChild(innerDiv);
            progressHelper[file.uuid] = {
                div: innerDiv,
                progress: innerDiv.querySelector('progress'),
                label: innerDiv.querySelector('label')
            };
            progressHelper[file.uuid].progress.max = file.maxChunks;
        }
    });
};
rtcMultiConnection.onFileProgress = function(chunk) {
    var helper = progressHelper[chunk.uuid];
    if (!helper) return;
    helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
    updateLabel(helper.progress, helper.label);
};

// www.RTCMultiConnection.org/docs/onFileEnd/
rtcMultiConnection.onFileEnd = function(file) {
    if (!progressHelper[file.uuid]) {
        console.error('No such progress-helper element exists.', file);
        return;
    }
    var div = progressHelper[file.uuid].div;
    if (file.type.indexOf('image') != -1) {
        div.innerHTML = '<a href="' + file.url + '" download="' + file.name + '">Download <strong style="color:red;">' + file.name + '</strong> </a><br /><img src="' + file.url + '" title="' + file.name + '" style="max-width: 80%;">';
    } else {
        div.innerHTML = '<a href="' + file.url + '" download="' + file.name + '">Download <strong style="color:red;">' + file.name + '</strong> </a><br /><iframe src="' + file.url + '" title="' + file.name + '" style="width: 80%;border: 0;height: inherit;margin-top:1em;"></iframe>';
    }

    setTimeout(function() {
        div = div.parentNode.parentNode.parentNode;
        div.querySelector('.user-info').style.height = div.querySelector('.user-activity').clientHeight + 'px';
    }, 10);
};

function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}
