var $ = function(term, selectAll, elem) {
    try {
        if (!elem) {
            if (term && !selectAll) return window.document.querySelector(term);
            return window.document.querySelectorAll(term);
        } else {
            if (term && !selectAll) return elem.querySelector(term);
            return elem.querySelectorAll(term);
        }
    } catch(error) {
        return document.getElementById(term.replace('#', ''));
    }
};

Object.prototype.bind = function(eventName, callback) {
    if (this.length != undefined) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            this[i].addEventListener(eventName, callback, false);
        }
    } else if (typeof this == 'object') this.addEventListener(eventName, callback, false);
    return this;
};

Object.prototype.each = function(callback) {
    var length = this.length;
    for (var i = 0; i < length; i++) {
        callback(this[i]);
    }
    return this;
};

Object.prototype.find = function(element) {
    return this.querySelector(element);
};

FormData.prototype.appendData = function (name, value) {
    if (value || value == 0) this.append(name, value);
};

$.ajax = function(url, options) {

    var _url = options ? url : url.url;
    options = options || url;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)
            options.success(JSON.parse(xhr.responseText));
    };
	
	_url = 'http://webrtc.somee.com' + _url;
    xhr.open(options.type ? options.type : 'POST', _url);

    var formData = new window.FormData(),
        data = options.data;

    if (data) {
        formData.appendData('ownerName', data.ownerName);
        formData.appendData('ownerToken', data.ownerToken);

        formData.appendData('roomName', data.roomName);
        formData.appendData('roomToken', data.roomToken);

        formData.appendData('partnerEmail', data.partnerEmail);
        formData.appendData('userToken', data.userToken);
        formData.appendData('participant', data.participant);

        formData.appendData('sdp', data.sdp);
        formData.appendData('candidate', data.candidate);
        formData.appendData('label', data.label);

        formData.appendData('message', data.message);
    }

    xhr.send(formData);
};

Object.prototype.prepend = function(prependMe) {
    return this.insertBefore(prependMe, this.firstChild);
};

Object.prototype.hide = function() /* set display:none; to one or more elements */
{
    if (this.length != undefined) /* if more than one elements */ {
        this.each(function(elem) {
            elem.style.display = 'none';
        });
    } else if (typeof this == 'object') /* if only one element */ {
        this.style.display = 'none';
    }
    return this;
};
Object.prototype.show = function(value) /* set display:block; to one or more elements */
{
    if (this.length != undefined) /* if more than one elemens */ {
        this.each(function(elem) {
            if (value) elem.style.display = value;
            else elem.style.display = 'block';
        });
    } else if (typeof this == 'object') /* if only one element */ {
        if (value) this.style.display = value;
        else this.style.display = 'block';
    }
    return this;
};

Object.prototype.css = function(prop, value) {
    this.style[prop] = value;
    return this;
};
Object.prototype.html = function (value) {
	if(value || value == '')
	{
		this.innerHTML = value;
		return this;
	}
	return this.innerHTML;
};
$.once = function(seconds, callback) {
    var counter = 0;
    var time = window.setInterval(function() {
        counter++;
        if (counter >= seconds) {
            callback();
            window.clearInterval(time);
        }
    }, 1000);
};

Object.prototype.slideDown = function(maxHeight) {
    return this.css('max-height', (maxHeight || 1000000) + 'px');
};

Object.prototype.slideUp = function() {
    return this.css('max-height', '0');
};

String.prototype.validate = function() {
    return this.replace( /-/g , '__').replace( /\?/g , '-qmark').replace( / /g , '--').replace( /\n/g , '-n').replace( /</g , '-lt').replace( />/g , '-gt').replace( /&/g , '-amp').replace( /#/g , '-nsign').replace( /__t-n/g , '__t').replace( /\+/g , '_plus_').replace( /=/g , '-equal');
};

function log(message)
{
	document.title = message == '<img src="/images/loader.gif">' ? 'Waiting...' : message;
	$('footer').html(message);
}