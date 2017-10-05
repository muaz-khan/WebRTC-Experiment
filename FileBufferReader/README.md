# [FileBufferReader.js](https://github.com/muaz-khan/FileBufferReader) / [Demo](https://www.WebRTC-Experiment.com/FileBufferReader/) / [Watch a YouTube video](https://www.youtube.com/watch?v=gv8xpdGdS4o)

[![npm](https://img.shields.io/npm/v/fbr.svg)](https://npmjs.org/package/fbr) [![downloads](https://img.shields.io/npm/dm/fbr.svg)](https://npmjs.org/package/fbr) [![Build Status: Linux](https://travis-ci.org/muaz-khan/FileBufferReader.png?branch=master)](https://travis-ci.org/muaz-khan/FileBufferReader)

All released versions: https://github.com/muaz-khan/FileBufferReader/releases

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

```sh
npm install fbr --production

# or using bower
bower install fbr
```

To use it:

```html
<script src="./node_modules/fbr/FileBufferReader.js"></script>
<script src="./bower_components/fbr/FileBufferReader.js"></script>

<!-- or CDN -->
<script src="https://cdn.webrtc-experiment.com/FileBufferReader.js"></script>

<!-- or rawgit -->
<script src="https://rawgit.com/muaz-khan/FileBufferReader/master/FileBufferReader.js"></script>
```

Or run localhost server:

```sh
node server.js
```

Then open: `http://localhost:9001/` or `http://127.0.0.1:9001/`.

## [fbr-client](https://github.com/muaz-khan/FileBufferReader/tree/master/fbr-client)

You can even try [socket.io file sharing client](https://github.com/muaz-khan/FileBufferReader/tree/master/fbr-client):

```sh
npm install fbr-client
```

Then run the server:

```sh
cd ./node_modules/fbr-client
node server.js port=9001
```

Then open: `http://localhost:9001/` or `http://127.0.0.1:9001/`.

> You can modify development files from the `dev` directory; and use `grunt` tool to recompile into `FileBufferReader.js`.

## FileBufferReader API

1. `chunks` object. It contains multiple files' chunks. Even if you received chunks from remote peer, and invoked `addChunk` method; all chunks will be stored in same `chunks` object. `var fileChunks = fileBufferReader.chunks['file-uuid']`.
2. `readAsArrayBuffer` method. It reads entire file and stores chunkified buffers in `chunks` object.
3. `getNextChunk` method. It simply reads `last-position` and returns next available array-buffer chunk.
4. `onBegin`, `onEnd` and `onProgress` events. These are added only to support file progress bars.
5. `addChunk` method. It allows you store all received chunks in an array until entire file is received.
6. `convertToObject` method. FileBufferReader assumes that you're sending ArrayBuffer using WebRTC data channels. It means that you'll be getting ArrayBuffer type in the `onmessage` event. `convertToObject` method allows you convert ArrayBuffer into JavaScript object type, which is helpful to check type of message.
7. `convertToArrayBuffer` method. You can pass javascript object or any data-type, and this method will return `ArrayBuffer`.

## 1. Link The Library

```
https://cdn.webrtc-experiment.com/FileBufferReader.js

# or
https://cdn.rawgit.com/muaz-khan/FileBufferReader/master/FileBufferReader.js
```

## 2. Select File (optional step)

You can use `input[type=file].onchange` instead, which is **strongly recommended** over using `FileSelecter` because `FileSelector` object is incapable to handle failures or situations where browser doesn't fires `onchange` event.

```javascript
var fileSelector = new FileSelector();

// *.png, *.jpeg, *.mp4, etc.
fileSelector.accept = '*.*';

var btnSelectFile = document.getElementById('select-file');
btnSelectFile.onclick = function() {
    fileSelector.selectSingleFile(function(file) {
        // file == input[type=file]
    });
};
```

## 3. Read Buffers

```javascript
var fileBufferReader = new FileBufferReader();

fileBufferReader.readAsArrayBuffer(file, function(fileUUID) {
    // var file         = fileBufferReader.chunks[fileUUID];
    // var listOfChunks = file.listOfChunks;

    // get first chunk, and send using WebRTC data channels
    // NEVER send chunks in loop; otherwise you'll face issues in slow networks
    // remote peer should notify if it is ready for next chunk
    fileBufferReader.getNextChunk(fileUUID, function(nextChunk, isLastChunk) {
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
    chunkSize: 15 * 1000,    // Firefox' receiving limit is 16k
    userid: 'sender-userid'  // MOST USEFUL object
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

        fileBufferReader.convertToObject(chunk, function(object) {
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

Link this script:

```
https://cdn.webrtc-experiment.com/FileProgressBarHandler.js

# or
https://cdn.rawgit.com/muaz-khan/FileBufferReader/master/fbr.0/dev/FileProgressBarHandler.js
```

Add a files-div:

```html
<div id="files-container"></div>
```

Add following code:

```javascript
// this line is optional
// however it allows you set the <DIV> for progress-bars and files-preview
fileBufferReader.filesContainer = document.getElementById('files-container');

// this line sets "onFileStart", "onFileProgress" and "onFileEnd" events (see below lines)
FileProgressBarHandler.handle(fileBufferReader);

fileBufferReader.onBegin    = fileBufferReader.onFileStart;
fileBufferReader.onProgress = fileBufferReader.onFileProgress;
fileBufferReader.onEnd      = fileBufferReader.onFileEnd;
```

Above snippet can be written as following:

```javascript
var options = {};

// this line is optional
// however it allows you set the <DIV> for progress-bars and files-preview
options.filesContainer = document.getElementById('files-container');

// this line sets "onFileStart", "onFileProgress" and "onFileEnd" events (see below lines)
FileProgressBarHandler.handle(options);

fileBufferReader.onBegin    = options.onFileStart;
fileBufferReader.onProgress = options.onFileProgress;
fileBufferReader.onEnd      = options.onFileEnd;
```

If you're **NOT interested** in above `FileProgressBarHandler.js`:

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

function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}

fileBufferReader.onBegin    = FileHelper.onBegin;
fileBufferReader.onProgress = FileHelper.onProgress;
fileBufferReader.onEnd      = FileHelper.onEnd;
```

## Sharing with multiple users?

```javascript
fbr.readAsArrayBuffer(file, function(fileUUID) {
    ['first-user', 'second-user', 'third-user'].forEach(function(userid) {
        fbr.getNextChunk(fileUUID, function(nextChunk, isLastChunk) {
            specific_datachannel.send(nextChunk);
        }, userid);
    });
});

datachannel.onmessage = function(event) {
    fbr.getNextChunk(message.uuid, function(nextChunk, isLastChunk) {
        specific_datachannel.send(nextChunk);
    }, specific_userid);
};
```

> Pass specific-userid as 3rd argument over `getNextChunk` method.

To uniquely identify progress-bars for each user, watch for `remoteUserId` object:

```javascript
FileHelper.onBegin = function(file) {
    if(file.remoteUserId) {
        // file is being shared with multiple users
    }
};

FileHelper.onEnd = function(file) {
    if(file.remoteUserId) {
        // file is being shared with multiple users
    }
};

FileHelper.onProgress = function(chunk) {
    if(chunk.remoteUserId) {
        // file is being shared with multiple users
    }
};
```

## Advance Usages

```javascript
var fbr = new FileBufferReader();
fbr.readAsArrayBuffer(file, function(fileUUID) {
    // don't call "getNextChunk"
    // instead, try to process/use/acccess chunks yourself

    var thisFileChunks = fbr.chunks[fileUUID];
    var numberOfFileChunks = thisFileChunks[0].maxChunks;

    var arrayOfRealBuffers = [];

    for(var i = 1; i < numberOfFileChunks; i++) {
        var fileChunk = thisFileChunks[i];
        var realArrayBufferObject = fileChunk.buffer;
        arrayOfRealBuffers.push(realArrayBufferObject);
    }

    var fileBlob = new Blob(realArrayBufferObject, {
        type: thisFileChunks[0].type
    });

    var blobURL = URL.createObjectURL(fileBlob);
    document.write('<iframe style="width: 100%; height: 100%; border:0; " src="' +  blobURL + '"></iframe>');
});
```

The structure of `fileBufferReader.chunks` object looks like this:

```javascript
fileBufferReader.chunks =
{
    // "4152661527041346" is file-uuid
   "4152661527041346":{

      // "0" index helps firing "onStart" event.
      "0":{
         "currentPosition":0,
         "uuid":"4152661527041346",
         "maxChunks":20,
         "size":298540,
         "name":"WebRTC.png",
         "type":"image/png",
         "lastModifiedDate":"Wed Oct 14 2015 15:51:26 GMT+0500 (PKT)",
         "start":true,
         "userid":0,
         "extra":{
            "userid":0
         }
      },

      // index "1" to "maxChunks" are the real file-chunks

      "1":{
         "uuid":"4152661527041346",

         // this is the real ArrayBuffer object
         "buffer":{},

         "currentPosition":1,
         "maxChunks":20,
         "size":298540,
         "name":"WebRTC.png",
         "lastModifiedDate":"Wed Oct 14 2015 15:51:26 GMT+0500 (PKT)",
         "type":"image/png",
         "userid":0,
         "extra":{  
            "userid":0
         }
      },

      ....
      ....

      // this is the last file-chunk
      // here "currentPosition===maxChunks"
      "20":{  
         "uuid":"4152661527041346",
         "buffer":{},
         "currentPosition":20,
         "maxChunks":20,
         "size":298540,
         "name":"WebRTC.png",
         "lastModifiedDate":"Wed Oct 14 2015 15:51:26 GMT+0500 (PKT)",
         "type":"image/png",
         "userid":0,
         "extra":{  
            "userid":0
         }
      },

      // this one helps firing "onEnd" event
      "21":{  
         "currentPosition":21,
         "uuid":"4152661527041346",
         "maxChunks":20,
         "size":298540,
         "name":"WebRTC.png",
         "lastModifiedDate":"Wed Oct 14 2015 15:51:26 GMT+0500 (PKT)",
         "url":"blob:http%3A//domain/fe5a20d0-cdb4-4f4e-9de7-1a14340fc402",
         "type":"image/png",
         "end":true,
         "userid":0,
         "extra":{  
            "userid":0
         }
      },

      // this is optionally used to detect which chunk is being shared
      // you should skip it.
      "currentPosition":0
   }
}
```

You can see that real file-chunks starts from `1` and ends before `length-1`.

E.g.

```javascript
var fileChunks = fbr.chunks['file-uuid'];
var allFileIndices = Object.keys(fileChunks);

var allFileBuffers = [];
for(var chunkIndex = 1; chunkIndex < allFileIndices.length; i++) {
    var chunk = fileChunks[chunkIndex];
    allFileBuffers.push(chunk.buffer);
}
```

# `FileSelector`

Provides methods to select single file, multiple files or entire directory.

**Select single file:**

```javascript
var selector = new FileSelector();
selector.accept = '*.png';
selector.selectSingleFile(function(file) {
    alert(file.name);
}, function() {
    alert('User did not select any file.');
});
```

**Select multiple files:**

```javascript
var selector = new FileSelector();
selector.accept = '*.png';
selector.selectMultipleFiles(function(files) {
    files.forEach(function(file) {
        alert(file.name);
    });
}, function() {
    alert('User did not select any file.');
});
```

**Select entire directory:**

```javascript
var selector = new FileSelector();
selector.accept = '*.png';
selector.selectDirectory(function(files) {
    files.forEach(function(file) {
        alert(file.webkitRelativePath);
    });
}, function() {
    alert('User did not select any file.');
});
```

# `FileConverter`

This global object exposes two methods:

1. `ConvertToArrayBuffer`
2. `ConvertToObject`

Here is how to use these methods:

```javascript
var yourObject = {
    x: 0,
    y: 1,
    str: 'string',
    bool: true
};

FileConverter.ConvertToArrayBuffer(yourObject, function(arrayBuffer) {
    alert(arrayBuffer.byteLength);

    // to convert back to "object"
    FileConverter.ConvertToObject(arrayBuffer, function(yourObject) {
        alert( JSON.stringify(yourObject) );
    });
});
```

When you call `getNextChunk`, the `FileBufferReader` instance checks for `currentPosition` and returns buffer using following snippet:

```javascript
// this method explains insights of FileBufferReader
fbr.getNextChunk = function(fileUUId, callback) {
    var fileChunks = fbr.chunks[fileUUID];
    var currentPosition = fileChunks.currentPosition;

    var nextChunk = fileChunks[currentPosition];
    FileConverter.ConvertToArrayBuffer(nextChunk, function(buffer) {
        // you can see that "callback" is passed two arguments
        // 1) the converted buffer
        // 2) "isLastChunk" boolean
        callback(buffer, currentPosition == nextChunk.maxChunks);
    });
};

// and your code calls above method as following;
fbr.getNextChunks('file-uuid', function(buffer) {
    webrtc.channel.send(buffer);
});
```

## Applications using FileBufferReader

1. [RTCMultiConnection.js](https://githbu.com/RTCMultiConnection)

## RTCMultiConnection FileBufferReader Demos

1. https://rtcmulticonnection.herokuapp.com/demos/Audio+Video+TextChat+FileSharing.html
2. https://rtcmulticonnection.herokuapp.com/demos/TextChat+FileSharing.html

More demos here: https://rtcmulticonnection.herokuapp.com/demos/

## License

[FileBufferReader.js](https://github.com/muaz-khan/FileBufferReader) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.muazkhan.com/).
