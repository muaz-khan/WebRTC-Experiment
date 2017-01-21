// Last time updated at Dec 31, 2016, 10:54:23

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence

// Source Code    - github.com/muaz-khan/Translator
// Demo           - www.webrtc-experiment.com/Translator

function Translator() {
    this.voiceToText = function(callback, language) {
        initTranscript(callback, language);
    };

    this.speakTextUsingRobot = function(text, args) {
        args = args || { };

        if (!args.amplitude) args.amplitude = 100;
        if (!args.wordgap) args.wordgap = 0;
        if (!args.pitch) args.pitch = 50;
        if (!args.speed) args.speed = 175;

        // args.workerPath
        // args.callback

        Speaker.Speak(text, args);
    };

    this.speakTextUsingGoogleSpeaker = function(args) {
        var textToSpeak = args.textToSpeak;
        var targetLanguage = args.targetLanguage;

        textToSpeak = textToSpeak.replace( /%20| /g , '+');
        if (textToSpeak.substr(0, 1) == ' ' || textToSpeak.substr(0, 1) == '+') {
            textToSpeak = textToSpeak.substr(1, textToSpeak.length - 1);
        }

        var audio_url = 'https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=' + textToSpeak.length + '&tl=' + targetLanguage + '&q=' + textToSpeak;

        if (args.callback) args.callback(audio_url);
        else {
            var audio = document.createElement('audio');
            audio.onerror = function(event) {
                audio.onerror = null;
                audio.src = 'https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=' + textToSpeak.length + '&tl=' + targetLanguage + '&q= ' + textToSpeak;
            };
            audio.src = audio_url;
            audio.autoplay = true;
            audio.play();
        }
    };

    this.translateLanguage = function(text, config) {
        config = config || { };
        // please use your own API key; if possible
        var api_key = config.api_key || Google_Translate_API_KEY;

        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';

        var sourceText = encodeURIComponent(text); // escape

        var randomNumber = 'method' + (Math.random() * new Date().getTime()).toString(36).replace( /\./g , '');
        window[randomNumber] = function(response) {
            if (response.data && response.data.translations[0] && config.callback) {
                config.callback(response.data.translations[0].translatedText);
                return;
            }

            if(response.error && response.error.message == 'Daily Limit Exceeded') {
                config.callback('Google says, "Daily Limit Exceeded". Please try this experiment a few hours later.');
                return;
            }

            if (response.error) {
                console.error(response.error.message);
                return;
            }

            console.error(response);
        };

        var source = 'https://www.googleapis.com/language/translate/v2?key=' + api_key + '&target=' + (config.to || 'en-US') + '&callback=window.' + randomNumber + '&q=' + sourceText;
        newScript.src = source;
        document.getElementsByTagName('head')[0].appendChild(newScript);
    };

    this.getListOfLanguages = function (callback, config) {
        config = config || {};

        var api_key = config.api_key || Google_Translate_API_KEY;

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var response = JSON.parse(xhr.responseText);

                if(response && response.data && response.data.languages) {
                    callback(response.data.languages);
                    return;
                }

                if (response.error && response.error.message === 'Daily Limit Exceeded') {
                    console.error('Text translation failed. Error message: "Daily Limit Exceeded."');
                    return;
                }

                if (response.error) {
                    console.error(response.error.message);
                    return;
                }

                console.error(response);
            }
        }
        var url = 'https://www.googleapis.com/language/translate/v2/languages?key=' + api_key + '&target=en';
        xhr.open('GET', url, true);
        xhr.send(null);
    };

    var recognition;

    function initTranscript(callback, language) {
        if (recognition) recognition.stop();

        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        recognition = new SpeechRecognition();

        recognition.lang = language || 'en-US';

        console.log('SpeechRecognition Language', recognition.lang);

        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = function(event) {
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    callback(event.results[i][0].transcript);
                }
            }
        };

        recognition.onend = function() {
            if(recognition.dontReTry === true) {
                return;
            }

            initTranscript(callback, language);
        };

        recognition.onerror = function(e) {
            if(e.error === 'audio-capture') {
                recognition.dontReTry = true;
                alert('Failed capturing audio i.e. microphone. Please check console-logs for hints to fix this issue.');
                console.error('No microphone was found. Ensure that a microphone is installed and that microphone settings are configured correctly. https://support.google.com/chrome/bin/answer.py?hl=en&answer=1407892');
                console.error('Original', e.type, e.message.length || e);
                return;
            }

            console.error(e.type, e.error, e.message);
        };

        recognition.start();
    }

    var self = this;
    self.processInWebWorker = function(args) {
        console.log('Downloading worker file. Its about 2MB in size.');

        if (!self.speakWorker && args.onWorkerFileDownloadStart) args.onWorkerFileDownloadStart();

        var blob = URL.createObjectURL(new Blob(['importScripts("' + (args.workerPath || '//www.webrtc-experiment.com/Robot-Speaker.js') + '");this.onmessage =  function (event) {postMessage(generateSpeech(event.data.text, event.data.args));}; postMessage("worker-file-downloaded");'], {
            type: 'application/javascript'
        }));

        var worker = new Worker(blob);
        URL.revokeObjectURL(blob);
        return worker;
    };

    var Speaker = {
        Speak: function(text, args) {
            var callback = args.callback;
            var onSpeakingEnd = args.onSpeakingEnd;

            if (!speakWorker) {
                self.speakWorker = self.processInWebWorker(args);
            }

            var speakWorker = self.speakWorker;

            speakWorker.onmessage = function(event) {

                if (event.data == 'worker-file-downloaded') {
                    console.log('Worker file is download ended!');
                    if (args.onWorkerFileDownloadEnd) args.onWorkerFileDownloadEnd();
                    return;
                }

                function encode64(data) {
                    var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                    var PAD = '=';
                    var ret = '';
                    var leftchar = 0;
                    var leftbits = 0;
                    for (var i = 0; i < data.length; i++) {
                        leftchar = (leftchar << 8) | data[i];
                        leftbits += 8;
                        while (leftbits >= 6) {
                            var curr = (leftchar >> (leftbits - 6)) & 0x3f;
                            leftbits -= 6;
                            ret += BASE[curr];
                        }
                    }
                    if (leftbits == 2) {
                        ret += BASE[(leftchar & 3) << 4];
                        ret += PAD + PAD;
                    } else if (leftbits == 4) {
                        ret += BASE[(leftchar & 0xf) << 2];
                        ret += PAD;
                    }
                    return ret;
                }

                var audio_url = 'data:audio/x-wav;base64,' + encode64(event.data);

                if (callback) {
                    callback(audio_url);
                } else {
                    var audio = document.createElement('audio');
                    audio.onended = function() {
                        if (onSpeakingEnd) onSpeakingEnd();
                    };
                    audio.src = audio_url;
                    audio.play();
                }
            };

            var _args = args;
            if (_args.onSpeakingEnd) delete _args.onSpeakingEnd;
            if (_args.callback) delete _args.callback;
            if (_args.onWorkerFileDownloadEnd) delete _args.onWorkerFileDownloadEnd;
            if (_args.onWorkerFileDownloadStart) delete _args.onWorkerFileDownloadStart;

            speakWorker.postMessage({ text: text, args: _args });
        }
    };
    
    var Google_Translate_API_KEY = 'AIzaSyCgB5hmFY74WYB-EoWkhr9cAGr6TiTHrEE';
}
