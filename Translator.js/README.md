# [Translator.js](https://github.com/muaz-khan/Translator) | WebRTC Voice & Text Translator

# Demo: https://www.webrtc-experiment.com/Translator/

Translator.js is a JavaScript library built top on Google Speech-Recognition & Translation API to transcript and translate voice and text. It supports many locales and brings globalization in <a href="https://www.webrtc-experiment.com/">WebRTC</a>!

<a href="https://www.webrtc-experiment.com/Translator/">
    <img src="https://cdn.webrtc-experiment.com/images/Translator.js-intro-1.png" />
</a>

# How to use?

```html
<script src="https://cdn.webrtc-experiment.com/Translator.js"> </script>
```

# Facing issues using in your own domain?

* https://github.com/muaz-khan/Translator/issues/1#issuecomment-131100677

# API Reference

```javascript
var translator = new Translator();
```

# `getListOfLanguages`

Get list of all supported languages:

```javascript
translator.getListOfLanguages(function(languages) {
    languages.forEach(function(language) {
        console.log(language.name, langauge.language);
    });
});
```

You can pass your API_Key as well:

```javascript
var config = {
    api_key: 'AIzaSyCUmCjvKRb-kOYrnoL2xaXb8I-_JJeKpf0',
};

translator.getListOfLanguages(function(languages) {
    languages.forEach(function(language) {
        console.log(language.name, langauge.language);
    });
}, config);
```

# `translateLanguage`

Pass English language text, and convert into Arabic or into any other supported language.

This method simply converts text from one language into another.

```javascript
var config = {
    from: 'language-of-the-text',
    to: 'convert-into',
    api_key: 'AIzaSyCUmCjvKRb-kOYrnoL2xaXb8I-_JJeKpf0', // use your own key
    callback: function (translatedText) {
        console.log('translated text', translatedText);
        
        // here you can use "speakTextUsingRobot"
        // see below sections
    }
};

translator.translateLanguage(textToConvert, config);
```

`translateLanguage` method takes two arguments:

1. Text to convert
2. Source and Target Languages; also callback method

Second argument is an object.

What you can do is either display translated text in chat-box; or use `speakTextUsingRobot` or `speakTextUsingGoogleSpeaker` methods to play voice.

# `voiceToText`

This method allows you convert voice into text; whatever you speak is recognized using Google Speech-Recognition API; and converted into text using same API:

```javascript
var convertMyVoiceIntoEnglish = 'en-US'; // select any language
translator.voiceToText(function (text) {
    console.log('Your voice as text!', text);
    
    // here you can use "translateLanguage" method
    // translator.translateLanguage
    // see more info in above section
}, convertMyVoiceIntoEnglish);
```

`voiceToText` method takes two arguments:

1. Callback; used to return recognized text
2. Language; used to suggest Speech-Recognition API to easily recognize speaker's language

If `language` is not passed; then `en-US` will be used as default language.

You can use socket.io, websockets or any other signaling gateway like [WebRTC](https://www.webrtc-experiment.com/) data channels to exchange/share transcripted text with other users.

# `speakTextUsingRobot`

Use a javascript file to speak the text.

This method uses meSpeak.js library to play text using a robot voice. Behind the scene; text is buffered and converted into WAV file; which is played using invisible `<audio>` element.

```javascript
var config = {
    workerPath: '//cdn.webrtc-experiment.com/Robot-Speaker.js',
    callback: function (WAV_File) {},
    amplitude: 100,
    wordgap: 0,
    pitch: 50,
    speed: 175,
    onSpeakingEnd: function() {},
    onWorkerFileDownloadStart: function() {},
    onWorkerFileDownloadEnd: function() {}
};

translator.speakTextUsingRobot(textToPlay, config);
```

`speakTextUsingRobot` method accepts two arguments; first one is mandatory and last one is optional:

1. Text to Speak i.e. convert text into voice file (WAV)
2. Options like worker-file path etc.

Default worker file's path is `https://www.webrtc-experiment.com/Robot-Speaker.js`. It is strongly recommended to download and link it from your own domain.

If you want to play WAV file yourself or you want to POST/store WAV file; then you can use `callback` parameter to override default behaviour:

```javascript
translator.speakTextUsingRobot(textToPlay, {
    callback: function (WAV_File) {
        HTTP_POST_using_FormData( WAV_File );
    }
});
```

`onSpeakingEnd` is useful in text-chat apps; where you can disable text box until text is translated and spoken; then you can enable it again.

# `speakTextUsingGoogleSpeaker`

Use Google Servers (Translation API) to speak the text.

This method uses Google Non-Official Translation API to convert text into mp3 sound. API Key used is taken from someone on the web; and there is no guarantee of its availability; that's why it is strongly suggested to buy your own KEY and pass using `api_key` parameter:

```javascript
translator.speakTextUsingGoogleSpeaker({
    textToSpeak: 'text-to-convert',
    targetLanguage: 'your-language',

    // Google Translation service's API Key
    api_key: 'Your-Private-API-Key'
});
```

Both `textToSpeak` and `targetLanguage` are mandatory. Only `api_key` is optional.

# Use Cases

1. You can use it in any [WebRTC](https://www.webrtc-experiment.com/) application to support globalization!
2. You can use WebRTC data channels to share transcripted text among users
3. You can mute original voice; and play translated one. Though, voice and video will NOT be sync

It is really useful in text-chat apps!

# Demo

* https://www.webrtc-experiment.com/Translator/

# Languages Supported

102+ languages are supported. Please check above demo link for the list.

# License

[Translator.js](https://github.com/muaz-khan/Translator) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
