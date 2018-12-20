var pdfHandler = {
    lastPdfURL: null,
    lastIndex: 0,
    lastPointIndex: 0,
    removeWhiteBackground: false,
    pdfPageContainer: document.getElementById('pdf-page-container'),
    pdfPagesList: document.getElementById('pdf-pages-list'),
    pdfNext: document.getElementById('pdf-next'),
    pdfPrev: document.getElementById('pdf-prev'),
    pdfClose: document.getElementById('pdf-close'),
    pageNumber: 1,

    images: [],
    ismousedown: false,
    prevX: 0,
    prevY: 0,
    getPage: function(pageNumber, callback) {
        pageNumber = parseInt(pageNumber) || 1;

        if (!pdfHandler.pdf) {
            pdfjsLib.disableWorker = false;
            pdfjsLib.getDocument(pdfHandler.lastPdfURL).then(function(pdf) {
                pdfHandler.pdf = pdf;
                pdfHandler.getPage(pageNumber, callback);
            });
            return;
        }

        var pdf = pdfHandler.pdf;
        pdf.getPage(pageNumber).then(function(page) {
            pdfHandler.pageNumber = pageNumber;

            var scale = 1.5;
            var viewport = page.getViewport(scale);

            var cav = document.createElement('canvas');
            var ctx = cav.getContext('2d');
            cav.height = viewport.height;
            cav.width = viewport.width;

            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            if (pdfHandler.removeWhiteBackground === true) {
                renderContext.background = 'rgba(0,0,0,0)';
            }

            page.render(renderContext).then(function() {
                if (pdfHandler.removeWhiteBackground === true) {
                    var imgd = ctx.getImageData(0, 0, cav.width, cav.height);
                    var pix = imgd.data;
                    var newColor = {
                        r: 0,
                        g: 0,
                        b: 0,
                        a: 0
                    };

                    for (var i = 0, n = pix.length; i < n; i += 4) {
                        var r = pix[i],
                            g = pix[i + 1],
                            b = pix[i + 2];

                        if (r == 255 && g == 255 && b == 255) {
                            pix[i] = newColor.r;
                            pix[i + 1] = newColor.g;
                            pix[i + 2] = newColor.b;
                            pix[i + 3] = newColor.a;
                        }
                    }
                    ctx.putImageData(imgd, 0, 0);
                }

                pdfHandler.lastPage = cav.toDataURL('image/png');
                callback(pdfHandler.lastPage, cav.width, cav.height, pdf.numPages);
            });
        });
    },
    load: function(lastPdfURL) {
        pdfHandler.lastPdfURL = lastPdfURL;
        pdfHandler.getPage(parseInt(pdfHandler.pdfPagesList.value || 1), function(lastPage, width, height, numPages) {
            pdfHandler.prevX = canvas.width - width - parseInt(width / 2);

            var t = pdfHandler;
            pdfHandler.lastIndex = pdfHandler.images.length;
            var point = [lastPage, 60, 20, width, height, pdfHandler.lastIndex];

            pdfHandler.lastPointIndex = points.length;
            points[points.length] = ['pdf', point, drawHelper.getOptions()];

            pdfHandler.pdfPagesList.innerHTML = '';
            for (var i = 1; i <= numPages; i++) {
                var option = document.createElement('option');
                option.value = i;
                option.innerHTML = 'Page #' + i;
                pdfHandler.pdfPagesList.appendChild(option);

                if (pdfHandler.pageNumber.toString() == i.toString()) {
                    option.selected = true;
                }
            }

            pdfHandler.pdfPagesList.onchange = function() {
                pdfHandler.load(lastPdfURL);
            };

            pdfHandler.pdfNext.onclick = function() {
                pdfHandler.pdfPagesList.selectedIndex++;
                pdfHandler.pdfPagesList.onchange();
            };

            pdfHandler.pdfPrev.onclick = function() {
                pdfHandler.pdfPagesList.selectedIndex--;
                pdfHandler.pdfPagesList.onchange();
            };

            pdfHandler.pdfClose.onclick = function() {
                pdfHandler.pdfPageContainer.style.display = 'none';
            };

            document.getElementById('drag-last-path').click();

            pdfHandler.pdfPrev.src = data_uris.pdf_next;
            pdfHandler.pdfNext.src = data_uris.pdf_prev;
            pdfHandler.pdfClose.src = data_uris.pdf_close;

            pdfHandler.pdfPageContainer.style.top = '20px';
            pdfHandler.pdfPageContainer.style.left = (point[3] - parseInt(point[3] / 2)) + 'px';
            pdfHandler.pdfPageContainer.style.display = 'block';

            // share to webrtc
            syncPoints(true);
        });
    },
    mousedown: function(e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;

        t.prevX = x;
        t.prevY = y;

        t.ismousedown = true;
    },
    mouseup: function(e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;
        if (t.ismousedown) {
            if (points[pdfHandler.lastPointIndex]) {
                points[pdfHandler.lastPointIndex] = ['pdf', [pdfHandler.lastPage, t.prevX, t.prevY, x - t.prevX, y - t.prevY, pdfHandler.lastIndex], drawHelper.getOptions()];
            }

            t.ismousedown = false;
        }
    },
    mousemove: function(e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;
        if (t.ismousedown) {
            tempContext.clearRect(0, 0, innerWidth, innerHeight);
            drawHelper.pdf(tempContext, [pdfHandler.lastPage, t.prevX, t.prevY, x - t.prevX, y - t.prevY, pdfHandler.lastIndex]);
        }
    },
    reset_pos: function(x, y) {
        pdfHandler.pdfPageContainer.style.top = y + 'px';
        if (!points[pdfHandler.lastPointIndex]) return;
        var point = points[pdfHandler.lastPointIndex][1];
        pdfHandler.pdfPageContainer.style.left = (point[1] + point[3] - parseInt(point[3] / 2) - parseInt(pdfHandler.pdfPageContainer.clientWidth / 2)) + 'px';
    },
    end: function() {
        // pdfHandler.pdfPageContainer.style.display = 'none';
    }
};
