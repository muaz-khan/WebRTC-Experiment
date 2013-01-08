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
document.getElementsByTagName('summary')[0].onclick = function () {
    if (!expanded) {
        dl.style.maxHeight = '20em';
        expanded = true;
    }
    else {
        dl.style.maxHeight = '0';
        expanded = false;
    }
};

(function () {
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
})();