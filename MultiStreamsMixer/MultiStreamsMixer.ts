// @maalouf

export class MultiStreamsMixer {

  videos : Array<any>;
  isStopDrawingFrames: boolean;
  canvas : any;
  context : CanvasRenderingContext2D;
  disableLogs: boolean;
  frameInterval: number;
  width : number;
  height: number;
  useGainNode : boolean;
  arrayOfMediaStreams: Array<MediaStream>;
  /********************************************/
  audioContext : any;
  audioDestination : any;
  audioSources : Array<any>;
  gainNode : GainNode;


  constructor (_arrayOfMediaStreams) {
    // requires: chrome://flags/#enable-experimental-web-platform-features
    this.arrayOfMediaStreams = _arrayOfMediaStreams;
    this.videos = new Array<any>();
    this.isStopDrawingFrames = false;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    // this.canvas.style = 'opacity:0;position:absolute;z-index:-1;top: -100000000;left:-1000000000; margin-top:-1000000000;margin-left:-1000000000;';
    // (document.body || document.documentElement).appendChild(canvas);
    this.disableLogs = false;
    this.frameInterval = 10;
    this.width = 360;
    this.height = 240;
    this.useGainNode = true;
    this.audioContext = undefined;
  }

  private isPureAudio(){
    for (let i = 0; i < this.arrayOfMediaStreams.length;i++){
      if (this.arrayOfMediaStreams[i].getTracks().filter(function(t) {
                return t.kind === 'video';
            }).length > 0) return false;
    }
    return true;
  }

  getAudioContext():AudioContext {
    if (typeof AudioContext !== 'undefined') {
      return new AudioContext();
    } else if (typeof (<any>window).webkitAudioContext !== 'undefined') {
      return new (<any>window).webkitAudioContext();
    } else if (typeof (<any>window).mozAudioContext !== 'undefined') {
      return new (<any>window).mozAudioContext();
    }
  }

  /**************************************************/


  private setSrcObject(stream, element) {
    var URL = window.URL || (<any>window).webkitURL;
    if ('srcObject' in element) {
      element.srcObject = stream;
    } else if ('mozSrcObject' in element) {
      element.mozSrcObject = stream;
    } else if ('createObjectURL' in URL) {
      element.src = URL.createObjectURL(stream);
    } else {
      alert('createObjectURL/srcObject both are not supported.');
    }
  }

  public startDrawingFrames() {
    this.drawVideosToCanvas();
  };

  private drawVideosToCanvas() {
    if (this.isStopDrawingFrames) {
      return;
    }
    let videosLength = this.videos.length;
    let fullcanvas = undefined;
    let remaining = [];
    this.videos.forEach(video => {
      if (!video.stream) {
        video.stream = {};
      }
      if (video.stream.fullcanvas) {
        fullcanvas = video;
      } else {
        remaining.push(video);
      }
    });

    if (fullcanvas !== undefined) {
      this.canvas.width = fullcanvas.stream.width;
      this.canvas.height = fullcanvas.stream.height;
    } else if (remaining.length) {
      this.canvas.width = videosLength > 1 ? remaining[0].width * 2 : remaining[0].width;
      var height = 1;
      if (videosLength === 3 || videosLength === 4) {
        height = 2;
      }
      if (videosLength === 5 || videosLength === 6) {
        height = 3;
      }
      if (videosLength === 7 || videosLength === 8) {
        height = 4;
      }
      if (videosLength === 9 || videosLength === 10) {
        height = 5;
      }
      this.canvas.height = remaining[0].height * height;
    } else {
      this.canvas.width = this.width || 360;
      this.canvas.height = this.height || 240;
    }

    if (fullcanvas && fullcanvas instanceof HTMLVideoElement) {
      this.drawImage(fullcanvas,0);
    }

    remaining.forEach((video, idx) => {
      this.drawImage(video, idx);
    });

    setTimeout(this.drawVideosToCanvas.bind(this), this.frameInterval);
  }

  private drawImage(video, idx) {
    if (this.isStopDrawingFrames) {
      return;
    }

    var x = 0;
    var y = 0;
    var width = video.width;
    var height = video.height;

    if (idx === 1) {
      x = video.width;
    }

    if (idx === 2) {
      y = video.height;
    }

    if (idx === 3) {
      x = video.width;
      y = video.height;
    }

    if (idx === 4) {
      y = video.height * 2;
    }

    if (idx === 5) {
      x = video.width;
      y = video.height * 2;
    }

    if (idx === 6) {
      y = video.height * 3;
    }

    if (idx === 7) {
      x = video.width;
      y = video.height * 3;
    }

    if (typeof video.stream.left !== 'undefined') {
      x = video.stream.left;
    }

    if (typeof video.stream.top !== 'undefined') {
      y = video.stream.top;
    }

    if (typeof video.stream.width !== 'undefined') {
      width = video.stream.width;
    }

    if (typeof video.stream.height !== 'undefined') {
      height = video.stream.height;
    }
    this.context.drawImage(video, x, y, width, height);
    if (typeof video.stream.onRender === 'function') {
      video.stream.onRender(this.context, x, y, width, height, idx);
    }
  }

  getMixedStream() {
    this.isStopDrawingFrames = false;
    let mixedAudioStream = this.getMixedAudioStream();
    let mixedVideoStream = (this.isPureAudio()) ? undefined: this.getMixedVideoStream();
    if (mixedVideoStream == undefined){
      return mixedAudioStream;
    } else {
      if (mixedAudioStream) {
        mixedAudioStream.getTracks().filter(function(t) {
                return t.kind === 'audio';
            }).forEach(track => {
          mixedVideoStream.addTrack(track);
        });
      }
      return mixedVideoStream;
    }
  }

  private getMixedVideoStream() {
    this.resetVideoStreams();
    var capturedStream = this.canvas.captureStream() || this.canvas.mozCaptureStream();
    var videoStream = new MediaStream();
    capturedStream.getTracks().filter(function(t) {
                return t.kind === 'video';
            }).forEach(track => {
      videoStream.addTrack(track);
    });
    this.canvas.stream = videoStream;
    return videoStream;
  }

  private getMixedAudioStream() {
    // via: @pehrsons
    if (this.audioContext == undefined) this.audioContext = this.getAudioContext();
    this.audioSources = new Array<any>();
    if (this.useGainNode === true) {
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0; // don't hear self
    }

    let audioTracksLength = 0;
    this.arrayOfMediaStreams.forEach(stream => {
      if (!stream.getTracks().filter(function(t) {
                return t.kind === 'audio';
            }).length) {
        return;
      }
      audioTracksLength++;
      let _audioSource = this.audioContext.createMediaStreamSource(stream);
      if (this.useGainNode === true) {
        _audioSource.connect(this.gainNode);
      }
      this.audioSources.push(_audioSource);
    });

    if (!audioTracksLength) {
      return undefined;
    }
    this.audioDestination = this.audioContext.createMediaStreamDestination();
    this.audioSources.forEach(_audioSource => {
      _audioSource.connect(this.audioDestination);
    });
    return this.audioDestination.stream;
  }

  private getVideo(stream) {
    var video = document.createElement('video');
    this.setSrcObject(stream, video);
    video.muted = true;
    video.volume = 0;
    video.width = stream.width || this.width || 360;
    video.height = stream.height || this.height || 240;
    video.play();
    return video;
  }

  appendStreams(streams) {
    if (!streams) {
      throw 'First parameter is required.';
    }

    if (!(streams instanceof Array)) {
      streams = [streams];
    }

    this.arrayOfMediaStreams.concat(streams);
    streams.forEach(stream => {
      if (stream.getTracks().filter(function(t) {
                return t.kind === 'video';
            }).length) {
        var video = this.getVideo(stream);
        video['stream'] = stream;
        this.videos.push(video);
      }

      if (stream.getTracks().filter(function(t) {
                return t.kind === 'audio';
            }).length && this.audioContext) {
        var audioSource = this.audioContext.createMediaStreamSource(stream);
        audioSource.connect(this.audioDestination);
        this.audioSources.push(audioSource);
      }
    });
  };

  private releaseStreams() {
    this.videos = [];
    this.isStopDrawingFrames = true;

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioSources.length) {
      this.audioSources.forEach(source => {
        source.disconnect();
      });
      this.audioSources = [];
    }

    if (this.audioDestination) {
      this.audioDestination.disconnect();
      this.audioDestination = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.audioContext = null;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.canvas.stream) {
      this.canvas.stream.stop();
      this.canvas.stream = null;
    }
  }

  private resetVideoStreams(streams?:any) {
    if (streams && !(streams instanceof Array)) {
      streams = [streams];
    }

    this._resetVideoStreams(streams);
  }

  private _resetVideoStreams(streams) {
    this.videos = [];
    streams = streams || this.arrayOfMediaStreams;

    // via: @adrian-ber
    streams.forEach(stream => {
      if (!stream.getTracks().filter(function(t) {
                return t.kind === 'video';
            }).length) {
        return;
      }
      let tempVideo = this.getVideo(stream);
      tempVideo['stream'] = stream;
      this.videos.push(tempVideo);
    });
  }

}
