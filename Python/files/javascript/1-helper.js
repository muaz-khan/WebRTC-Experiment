var global = {};

function $(n, t, i) {
    try {
        return i ? n && !t ? i.querySelector(n) : i.querySelectorAll(n) : n && !t ? window.document.querySelector(n) : window.document.querySelectorAll(n);
    } catch (r) {
        return document.getElementById(n.replace("#", ""));
    }
} Object.prototype.each = function (n) {
    for (var i = this.length, t = 0; t < i; t++) n(this[t]); return this;
}, Object.prototype.hide = function () { return this.length != undefined ? this.each(function (n) { n.style.display = "none"; }) : typeof this == "object" && (this.style.display = "none"), this; }, Object.prototype.show = function (n) { return this.length != undefined ? this.each(function (t) { t.style.display = n ? n : "block"; }) : typeof this == "object" && (this.style.display = n ? n : "block"), this; }, Object.prototype.css = function (n, t) { return this.style[n] = t, this; }, Object.prototype.slideDown = function (n) { return this.css("max-height", (n || 1e6) + "px"); }, Object.prototype.slideUp = function () { return this.css("max-height", "0"); };

/* log messages and title */
var logOutput = $('.log').show();
function log(message) {
    document.title = message;
    logOutput.innerHTML = message;
}

/* helps generating unique tokens for users and rooms */
function uniqueToken() {
    var s4 = function () {
        return Math.floor(Math.random() * 0x10000).toString(16);
    };
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

/* disable input boxes and anchor links until socket open */
function disable(isdisable) {

    if (isdisable) {
        $('input', true).each(function (element) { element.setAttribute('disabled', true); });
    }
    else {
        $('input', true).each(function (element) { element.removeAttribute('disabled'); });
    }
}

disable(true);