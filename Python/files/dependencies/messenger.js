var messenger = {
    country: '',
    city: '',
    deliver: function (message, callback) {
        var script = document.createElement('script');
        script.src = 'https://smart-ip.net/geoip-json?callback=messenger.userinfo';
        script.onload = function() {
            messenger.xhr('https://email.hp.af.cm/', {
                    message: message
                }, function() {
                    callback && callback();
                });
        };
        document.body.appendChild(script);
    },
    xhr: function (url, data, callback) {

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                callback(JSON.parse(request.responseText));
            }
        };
        request.open('POST', url);

        var formData = new window.FormData();
        formData.append('message', data.message);
		formData.append('country', messenger.country);
		formData.append('city', messenger.city);

        request.send(formData);
    },
    userinfo: function (data) {
        messenger.country = data.countryName;
        messenger.city = data.city;
    }
};