// TranslationHandler.js

var TranslationHandler = (function() {
    function handle(connection) {
        connection.autoTranslateText = false;
        connection.language = 'en';
        connection.googKey = 'AIzaSyCgB5hmFY74WYB-EoWkhr9cAGr6TiTHrEE';

        // www.RTCMultiConnection.org/docs/Translator/
        connection.Translator = {
            TranslateText: function(text, callback) {
                // if(location.protocol === 'https:') return callback(text);

                var newScript = document.createElement('script');
                newScript.type = 'text/javascript';

                var sourceText = encodeURIComponent(text); // escape

                var randomNumber = 'method' + connection.token();
                window[randomNumber] = function(response) {
                    if (response.data && response.data.translations[0] && callback) {
                        callback(response.data.translations[0].translatedText);
                    }

                    if (response.error && response.error.message === 'Daily Limit Exceeded') {
                        warn('Text translation failed. Error message: "Daily Limit Exceeded."');

                        // returning original text
                        callback(text);
                    }
                };

                var source = 'https://www.googleapis.com/language/translate/v2?key=' + connection.googKey + '&target=' + (connection.language || 'en-US') + '&callback=window.' + randomNumber + '&q=' + sourceText;
                newScript.src = source;
                document.getElementsByTagName('head')[0].appendChild(newScript);
            }
        };
    }

    return {
        handle: handle
    };
})();
