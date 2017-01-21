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
                };

                var source = 'https://www.googleapis.com/language/translate/v2?key=' + connection.googKey + '&target=' + (connection.language || 'en-US') + '&callback=window.' + randomNumber + '&q=' + sourceText;
                newScript.src = source;
                document.getElementsByTagName('head')[0].appendChild(newScript);
            },
            getListOfLanguages: function(callback) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        var response = JSON.parse(xhr.responseText);

                        if (response && response.data && response.data.languages) {
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
                var url = 'https://www.googleapis.com/language/translate/v2/languages?key=' + connection.googKey + '&target=en';
                xhr.open('GET', url, true);
                xhr.send(null);
            }
        };
    }

    return {
        handle: handle
    };
})();
