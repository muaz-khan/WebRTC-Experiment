# FlashAudioRecorder.js usage

This module based on recorder.js library - https://github.com/jwagener/recorder.js
It support uploading file after record or getting them as Blob type ro 

## 1. Include this module

```
  <script src="path_to_MediaStreamRecorder/AudioStreamRecorder/FlashAudioRecorder.js"> </script>
```
## 2. Basic usage - through serverside

Initialize

```
  var flashRecorder = new FlashAudioRecorder({
      uploadParams:{
          url: "http://url",
          audioParam: "qqfile", // same as in recorder.js lib
          params: {}
      }
  });
```

Start capture audio:

```
  flashRecorder.start();
```

Stop capture audio

```
  flashRecorder.stop();
```

Get uploaded file url (you must write your own serverside script to handle upload.)

```
flashRecorder.ondataavailable = function(e) {
    console.log(e.msg); // server answer
}

```
## 3. Attributes

### dataType

Which type of data should be returned this param used when ondataavailable event appended to instance 
You can pass value in object instance or directly pass to constructor

Example 1:
```
  var flashRecorder = new FlashAudioRecorder({
    dataType:'dataUri'
  });
```

Example 2:
```
  var flashRecorder = new FlashAudioRecorder();
      flashRecorder.dataType = 'blob';
```
Values: 

#### false
  module do nothing after record ends. You can call upload method to upload record manually 

#### 'url' - Default
  when record ends, module upload this data immediately
#### 'blob'
  call ondataavailable event with blob, that contains all recorded data. Note: this case gives a js memory leaks
  With 1m record you can get about 300Mb of memory per your process. Use this metho only on short recordings (< 45 sec) 
  and short-living applications.
  If you want upload your data immediately after stop recording, its better to use 'url' dataType
  Example
```javascript
  var flashRecorder = new FlashAudioRecorder({
    dataType:'blob'
  });
  flashRecorder.start();
  flashRecorder.stop();
  flashRecorder.ondataavailable = function(e) {
      var formData = new FormData();
      formData.append('qqFile', e.data);
      xhr.send(formData);
  }
```
#### 'raw' 
  get recorded array. You can easily edit your record. Same as 'blob' dataType Limitations
#### 'dataUri'
  with that type you can easily listen your pre-recorded data or save it to Computer using Javascript File API
  Same as 'blob' dataType Limitations

  Example
```javascript
  var flashRecorder = new FlashAudioRecorder({
    dataType:'dataUri'
  });
  flashRecorder.start();
  flashRecorder.stop();
  flashRecorder.ondataavailable = function(e) {
      var audio = new Audio(e.data);
      audio.play();
  }
```
### baseUrl
  path to FlashAudioRecorder.js. Readonly

## 4. Constructor methods

### swfObjectPath
  path to recorder.swf
  default: baseUrl+'lib/recorder.js/recorder.swf'
### jsLibPath
  path to recorder.js
  default:  baseUrl+'lib/recorder.js/recorder.js'
### encoderPath
  path to [WavEncoder.js](https://github.com/fritzo/wavencoderjs)
  THis lib used in 'blob' and 'dataUri' dataTypes
  default: encoderPath: baseUrl+'lib/wavencoder/wavencoder.js'
### uploadParams
  params that will be passed to [Recorder.upload function](https://github.com/jwagener/recorder.js)
  except success and error events (see onerror and ondataavailiable events)

Example 
```
  new FlashAudioRecorder({
    uploadParams:{
      method: "POST"                             // (not implemented) (optional, defaults to POST) HTTP Method can be either POST or PUT 
      url: "http://api.soundcloud.com/tracks",   // URL to upload to (needs to have a suitable crossdomain.xml for Adobe Flash)
      audioParam: "track[asset_data]",           // Name for the audio data parameter
      params: {                                  // Additional parameters (needs to be a flat object)
        "track[title]": "some track",
        "oauth_token":  "VALID_TOKEN"
      }
    }
  })
```


## 5. Methods

### start
  start capture audiostream
### stop
  stop capture audiostream 
### upload
  upload pre-recorded data

```
  var flashRecorder = new FlashAudioRecorder({
    dataType:false // manual upload
  });
  flashRecorder.start();
  flashRecorder.stop();
  flashRecorder.upload({
    method: "POST"                             // (not implemented) (optional, defaults to POST) HTTP Method can be either POST or PUT 
    url: "http://api.soundcloud.com/tracks",   // URL to upload to (needs to have a suitable crossdomain.xml for Adobe Flash)
    audioParam: "track[asset_data]",           // Name for the audio data parameter
    params: {                                  // Additional parameters (needs to be a flat object)
      "track[title]": "some track",
      "oauth_token":  "VALID_TOKEN"
    }
  });
```

## 6. Events

This module supports all events that you can see in [W3C API](https://dvcs.w3.org/hg/dap/raw-file/tip/media-stream-capture/MediaRecorder.html) 
You can pass any event function in object instance or directly pass it to constructor params
```
  var flashRecorder = new FlashAudioRecorder({
    onstart: function() {

    }
  });
  flashRecorder.onstart = function(e) {
    console.log('start');
  }
  flashRecorder.onstop = function(e) {
    console.log('stop');
  }
  flashRecorder.ondataavailable = function(e) {
    console.log('Data availiable')
  }
  // triggering when upload fails
  flashRecorder.onerror = function(e) {
    console.log('error');
  }
```

Also you can bind this events:

```
  // taken from recorder.js onFlashSecurity event
  // (optional) callback when the flash swf needs to be visible
  // this allows you to hide/show the flashContainer element on demand.
  
  flashRecorder.onFlashSecurity = function(e) {

  }
  // triggers when flash movie loaded into DOM
  flashRecorder.onready = function(e) {
      
  }
```


=

##### License

[MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) library is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://github.com/muaz-khan) and [neizerth](https://github.com/neizerth).
