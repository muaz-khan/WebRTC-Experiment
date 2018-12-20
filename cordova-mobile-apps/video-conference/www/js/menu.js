(function menuLooper() {
    var menuExplorer = document.querySelector('.menu-explorer');

    if (!menuExplorer) {
        setTimeout(menuLooper, 500);
        return;
    }

    menuExplorer.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var nav = document.querySelector('nav');
        nav.style.display = 'block';

        document.documentElement.onclick = function() {
            document.body.onclick = null;
            nav.style.display = 'none';
        };
    };
})();
