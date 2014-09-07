# [FileBufferReader.js](https://github.com/muaz-khan/FileBufferReader) [![npm](https://img.shields.io/npm/v/fbr.svg)](https://npmjs.org/package/fbr) [![downloads](https://img.shields.io/npm/dm/fbr.svg)](https://npmjs.org/package/fbr) / [Demo](https://www.WebRTC-Experiment.com/FileBufferReader/)

Using FileBufferReader.js, you can:

1. Get list of array-buffers with each specific chunkSize
2. Chunks can be step-by-step shared with remote peers, or instantly shared using for-loop

You can easily implement retransmission of chunks as well. You need to set `binaryType` to `arraybuffer`:

```javascript
WebRTC_Data_Channel.binaryType = 'arraybuffer';
```

## A few points:

1. FileBufferReader itself doesn't do anything except reading the file(s)
2. You need to manually share chunks using your preferred medium or gateway
3. FileBufferReader currently uses memory to store chunks; which has storage limits. So, you may not be able to use FileBufferReader to read/share file with 1GB size or more.
4. FileBufferReader is added to support controlled-buffers transmissions whilst following Skype's file sharing style.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

```
npm install fbr
```

To use it:

```htm
<script src="./node_modules/fbr/FileBufferReader.js"></script>
```

## 1. Link The Library

```
https://cdn.webrtc-experiment.com/FileBufferReader.js
```

## 2. Select File (optional step)

You can use `input[type=file].onchange` instead.

```javascript
var fileSelector = new FileSelector();

var btnSelectFile = document.getElementById('select-file');
btnSelectFile.onclick = function() {
    fileSelector.selectSingleFile(function(file) {
        // file == input[type=file]
    });
};
```

You can select multiple files using `selectMultipleFiles` method.

## 3. Read Buffers

```javascript
var fileBufferReader = new FileBufferReader();

fileBufferReader.readAsArrayBuffer(file, function(uuid) {
    // var file         = fileBufferReader.chunks[uuid];
    // var listOfChunks = file.listOfChunks;
    
    // get first chunk, and send using WebRTC data channels
    // NEVER send chunks in loop; otherwise you'll face issues in slow networks
    // remote peer should notify if it is ready for next chunk
    fileBufferReader.getNextChunk(uuid, function(nextChunk, isLastChunk) {
        if(isLastChunk) {
            alert('File Successfully sent.');
        }
        // sending using WebRTC data channels
        datachannel.send(nextChunk);
    });
});
```

`readAsArrayBuffer` takes 3rd argument as well; where you can pass `chunkSize`, and your custom data.

```javascript
var extra = {
    chunkSize: 15 * 1000k, // Firefox' receiving limit is 16k
    senderUserName: 'someone',
    autoSaveToDisk: true,
    coords: {
        x: 10,
        y: 20
    }
};

fileBufferReader.readAsArrayBuffer(file, callback, extra);
```

## 4. When remote peer receives a chunk

```javascript
datachannel.onmessage = function(event) {
    var chunk = event.data;
    
    if (chunk instanceof ArrayBuffer || chunk instanceof DataView) {
        // array buffers are passed using WebRTC data channels
        // need to convert data back into JavaScript objects
    
        fileBufferReader.ConvertToObject(chunk, function(object) {
            datachannel.onmessage({
                data: object
            });
        });
        return;
    }
    
    // if you passed "extra-data", you can access it here:
    // chunk.extra.senderUserName or whatever else
    
    // if target peer requested next chunk
    if(chunk.readyForNextChunk) {
        fileBufferReader.getNextChunk(chunk.uuid, function(nextChunk, isLastChunk) {
            if(isLastChunk) {
                alert('File Successfully sent.');
            }
            // sending using WebRTC data channels
            datachannel.send(nextChunk);
        });
        return;
    }
    
    // if chunk is received
    fileBufferReader.addChunk(chunk, function(promptNextChunk) {
        // request next chunk
        datachannel.send(promptNextChunk);
    });
};
```

## 5. File progress helpers

```javascript
var progressHelper = {};
var outputPanel = document.body;

var FileHelper = {
    onBegin: function(file) {
        // if you passed "extra-data", you can access it here:
        // file.extra.senderUserName or whatever else
    
        var li = document.createElement('li');
        li.title = file.name;
        li.innerHTML = '<label>0%</label> <progress></progress>';
        outputPanel.insertBefore(li, outputPanel.firstChild);
        progressHelper[file.uuid] = {
            li: li,
            progress: li.querySelector('progress'),
            label: li.querySelector('label')
        };
        progressHelper[file.uuid].progress.max = file.maxChunks;
    },
    onEnd: function(file) {
        // if you passed "extra-data", you can access it here:
        // file.extra.senderUserName or whatever else
        
        progressHelper[file.uuid].li.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';
    },
    onProgress: function(chunk) {
        // if you passed "extra-data", you can access it here:
        // chunk.extra.senderUserName or whatever else
        
        var helper = progressHelper[chunk.uuid];
        helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
        updateLabel(helper.progress, helper.label);
    }
};

fileBufferReader.onBegin    = FileHelper.onBegin;
fileBufferReader.onProgress = FileHelper.onProgress;
fileBufferReader.onEnd      = FileHelper.onEnd;
```

## Credits

[Muaz Khan](https://github.com/muaz-khan):

1. Personal Webpage: http://www.muazkhan.com
2. Email: muazkh@gmail.com
3. Twitter: https://twitter.com/muazkh and https://twitter.com/WebRTCWeb
4. Google+: https://plus.google.com/+WebRTC-Experiment
5. Facebook: https://www.facebook.com/WebRTC

## License

[FileBufferReader.js](https://github.com/muaz-khan/FileBufferReader) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
