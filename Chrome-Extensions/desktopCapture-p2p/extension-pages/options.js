function querySelectorAll(selector, element) {
    element = element || document;
    return Array.prototype.slice.call(element.querySelectorAll(selector));
}

var elements_ids = querySelectorAll('input, select').map(function(item) {
    return item.id;
});

var changes = document.getElementById('changes');

chrome.storage.sync.get(null, function(items) {
    elements_ids.forEach(function(id) {
        if (!items[id]) return;

        var element = document.getElementById(id);
        if (items[id]) {
            if (element.type === 'checkbox') {
                element.checked = items[id] === 'true';
            } else {
                element.value = items[id];
            }
        } else {
            var item = {};
            item[element.id] = element.type === 'checkbox' ?
                (element.checked === true ? 'true' : 'false') :
                element.value;

            try {
                chrome.storage.sync.set(item);
            }
            catch(e) {
                location.reload();
            }
        }
    });
    setCustomSelectElements();
    setTimeout(function() {
        changes.style.display = 'none';
    }, 600);
});

elements_ids.forEach(function(id) {
    var element = document.getElementById(id);
    element.onchange = function(e) {
        e && e.stopPropagation();
        element.disabled = true;

        changes.querySelector('span').innerHTML = 'Saving Changes';
        changes.style.display = 'block';

        var item = {};
        item[element.id] = element.type === 'checkbox' ?
            (element.checked === true ? 'true' : 'false') :
            element.value;

        try {
            chrome.storage.sync.set(item, function() {
                element.disabled = false;
                setTimeout(function() {
                    changes.style.display = 'none';
                }, 600);
            });
        }
        catch(e) {
            location.reload();
        }
    };

    if (element.type) {
        element.parentNode.onclick = function() {
            if (element.type !== 'checkbox') {
                element.focus();
            } else {
                element.checked = !element.checked;
            }
        };

        element.onclick = element.onfocus = function(e) {
            e && e.stopPropagation();
        };
    }
});

querySelectorAll('.help-icon').forEach(function(helpIcon) {
    var shown = false;
    helpIcon.onclick = function(e) {
        e.stopPropagation();

        var small = helpIcon.parentNode.querySelector('small');
        if(shown) {
            small.style.marginTop = '0px';
            setTimeout(function() {
                small.style.height = '0px';
            }, 500);
            shown = false;
        }
        else {
            small.style.height = 'auto';
            small.style.marginTop = '10px';
            shown = true;
        }
    };
});

/* custom select */
function setCustomSelectElements() {
    var x, i, j, selElmnt, a, b, c;
    x = document.getElementsByClassName('custom-select');
    for (i = 0; i < x.length; i++) {
        selElmnt = x[i].getElementsByTagName('select')[0];
        a = document.createElement('DIV');
        a.setAttribute('class', 'select-selected');
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        b = document.createElement('DIV');
        b.setAttribute('class', 'select-items select-hide');

        for (j = 0; j < selElmnt.length; j++) {
            c = document.createElement('DIV');
            c.innerHTML = selElmnt.options[j].innerHTML;

            c.setAttribute('data-value', selElmnt.options[j].value);
            c.setAttribute('data-target', selElmnt.id);

            c.onclick = function(e) {
                var y, i, k, s, h;
                s = this.parentNode.parentNode.getElementsByTagName('select')[0];
                h = this.parentNode.previousSibling;
                for (i = 0; i < s.length; i++) {
                    if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName('same-as-selected');
                        for (k = 0; k < y.length; k++) {
                            y[k].removeAttribute('class');
                        }
                        this.setAttribute('class', 'same-as-selected');
                        break;
                    }
                }
                h.click();

                var value = this.getAttribute('data-value');
                var target = this.getAttribute('data-target');
                document.getElementById(target).value = value;
                document.getElementById(target).onchange();
            };
            b.appendChild(c);
        }
        x[i].appendChild(b);
        a.onclick = function(e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle('select-hide');
            this.classList.toggle('select-arrow-active');
        };
    }

    function closeAllSelect(elmnt) {
        var x, y, i, arrNo = [];
        x = document.getElementsByClassName('select-items');
        y = document.getElementsByClassName('select-selected');
        for (i = 0; i < y.length; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i)
            } else {
                y[i].classList.remove('select-arrow-active');
            }
        }
        for (i = 0; i < x.length; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add('select-hide');
            }
        }
    }
    document.onclick = closeAllSelect;
}
