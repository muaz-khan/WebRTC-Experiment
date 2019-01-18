// All Copyrights goes to: Google Inc.
// Original: https://github.com/GoogleChromeLabs/webm-wasm

// _________________
// WebAssemblyRecorder.js

/**
 * WebAssemblyRecorder lets you create webm videos in JavaScript via WebAssembly. The library consumes raw RGBA32 buffers (4 bytes per pixel) and turns them into a webm video with the given framerate and quality. This makes it compatible out-of-the-box with ImageData from a CANVAS. With realtime mode you can also use webm-wasm for streaming webm videos.
 * @summary Video recording feature in Chrome and maybe Edge. Firefox is not supporting WritableStream yet. ReadableStream is also behind two flags on Firefox.
 * @license {@link https://github.com/muaz-khan/RecordRTC#license|MIT}
 * @author {@link http://www.MuazKhan.com|Muaz Khan}
 * @typedef WebAssemblyRecorder
 * @class
 * @example
 * var recorder = new WebAssemblyRecorder(mediaStream);
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 * });
 * @see {@link https://github.com/muaz-khan/RecordRTC|RecordRTC Source Code}
 * @param {MediaStream} mediaStream - MediaStream object fetched using getUserMedia API or generated using captureStreamUntilEnded or WebAudio API.
 * @param {object} config - {webAssemblyPath:'webm-wasm.wasm',workerPath: 'webm-worker.js', frameRate: 30, width: 1920, height: 1080}
 */
function WebAssemblyRecorder(stream, config) {
    // following polyfill is strongly recommended:
    // because it fixes readable/writable streams issues on Firefox:
    // https://unpkg.com/@mattiasbuelens/web-streams-polyfill/dist/polyfill.min.js

    config = config || {};

    config.width = config.width || 640;
    config.height = config.height || 480;
    config.frameRate = config.frameRate || 30;
    config.bitrate = config.bitrate || 1200;

    function createBufferURL(buffer, type = '') {
        return URL.createObjectURL(new Blob([buffer], {
            type
        }));
    }

    function cameraStream() {
        // Firefox requires:
        // 1) dom.streams.enabled
        // 2) javascript.options.streams
        return new ReadableStream({
            async start(controller) {
                const cvs = document.createElement('canvas');
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                await nextEvent(video, 'playing');
                [cvs.width, cvs.height] = [config.width, config.height];
                const ctx = cvs.getContext('2d');
                const frameTimeout = 1000 / config.frameRate;
                setTimeout(async function f() {
                    ctx.drawImage(video, 0, 0);
                    await controller.enqueue(
                        ctx.getImageData(0, 0, config.width, config.height)
                    );
                    setTimeout(f, frameTimeout);
                }, frameTimeout);
            }
        });
    }

    function nextEvent(target, name) {
        return new Promise(function(resolve) {
            target.addEventListener(name, resolve, {
                once: true
            });
        });
    }

    var worker;

    async function startRecording(stream) {
        if (!config.workerPath) {
            // is it safe to use @latest ?
            const buffer = await fetch(
                'https://unpkg.com/webm-wasm@latest/dist/webm-worker.js'
            ).then(function(r) {
                return r.arrayBuffer();
            });

            worker = new Worker(
                URL.createObjectURL(new Blob([buffer], {
                    type: 'text/javascript'
                }))
            );
        } else {
            worker = new Worker(config.workerPath);
        }

        worker.postMessage(config.webAssemblyPath || 'https://unpkg.com/webm-wasm@latest/dist/webm-wasm.wasm');

        await nextEvent(worker, 'message');
        worker.postMessage({
            width: config.width,
            height: config.height,
            bitrate: config.bitrate || 1200,
            timebaseDen: config.frameRate || 30,
            realtime: true
        });

        // Firefox do not support "WritableStream" YET.
        cameraStream().pipeTo(new WritableStream({
            write(image) {
                worker && worker.postMessage(image.data.buffer, [image.data.buffer]);
            }
        }));

        worker.onmessage = function(event) {
            if (!!event.data) {
                if (!isPaused) {
                    arrayOfBuffers.push(event.data);
                }
            }
        };
    }

    /**
     * This method records video.
     * @method
     * @memberof WebAssemblyRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        arrayOfBuffers = [];
        isPaused = false;
        startRecording(stream);
    };

    var isPaused;

    /**
     * This method pauses the recording process.
     * @method
     * @memberof WebAssemblyRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        isPaused = true;
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof WebAssemblyRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        isPaused = false;
    };

    async function terminate() {
        if (!worker) {
            return;
        }

        worker.postMessage(null);
        worker.terminate();
        worker = null;
    }

    var arrayOfBuffers = [];

    /**
     * This method stops recording video.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof WebAssemblyRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        terminate();
        var blob = new Blob(arrayOfBuffers, {
            type: 'video/webm'
        });
        callback(blob);
    };
}

if (typeof RecordRTC !== 'undefined') {
    RecordRTC.WebAssemblyRecorder = WebAssemblyRecorder;
}
