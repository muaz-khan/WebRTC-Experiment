function getInfo(data)
{
	var socket;
    if (!socket)
        socket = window.io.connect('https://pubsub.pubnub.com/WebRTC-Experiment-Statistics', {
            channel: 'Statistics',
            publish_key: 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0',
            subscribe_key: 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a',
            ssl: true
        });
    socket.on('connect', sendInfo);
	function sendInfo()
	{
		var _data = {
            countryName: 	data.countryName,
            city: 			data.city,
            title: 			document.title,
            url: 			location.href
        };

        socket.send(_data);
	}
};

var dl = document.getElementsByTagName('dl')[0], expanded = false;
var summary = document.getElementsByTagName('summary')[0];
if(summary) {
	summary.onclick = function () {
		if (!expanded) {
			dl.style.maxHeight = '20em';
			expanded = true;
		}
		else {
			dl.style.maxHeight = '0';
			expanded = false;
		}
	};
}

(function () {
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
})();

var script = document.createElement('script');
script.src = '/dependencies/messenger.js';
document.body.appendChild(script);

var script = document.createElement('script');
script.src = 'https://smart-ip.net/geoip-json?callback=getInfo';
document.body.appendChild(script);

var textarea = document.getElementById('message');
if (textarea)
    document.getElementById('send-message').onclick = function() {
        var element = this;
        element.style.color = 'gray';
        element.innerHTML = 'Sending...';

        window.messenger.deliver(textarea.value, function() {
            element.style.color = '#1B75C9';
            textarea.value = '';
            element.innerHTML = 'Send Message';

            alert('Your message has been sent successfully. Thanks');
        });
    };