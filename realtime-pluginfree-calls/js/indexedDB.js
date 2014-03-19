// this indexed-db code is taken from a repository on github; sorry forgot the link.
// WebRTC realtime Calls!!! (part of WebRTC Experiments by Muaz Khan!) @WebRTCWeb

// https://wwww.webrtc-experiment.com/

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Experiments   - github.com/muaz-khan/WebRTC-Experiment

var imageURL = 'images/video-container.png';

(function () {

    // IndexedDB
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
        dbVersion = 1.0;

    // Create/open database
    var request = indexedDB.open("imageFiles", dbVersion),
        db,
        createObjectStore = function (dataBase) {
            // Create an objectStore
            console.log("Creating objectStore");
            dataBase.createObjectStore("image");
        },
        getImageFile = function () {
            putElephantInDb(null, function () {
                // Create XHR
                var xhr = new XMLHttpRequest(),
                    blob;

                xhr.open("GET", imageURL, true);
                // Set the responseType to blob
                xhr.responseType = "blob";

                xhr.addEventListener("load", function () {
                    if (xhr.status === 200) {
                        console.log("Image retrieved");

                        // Blob as response
                        blob = xhr.response;
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            putElephantInDb(e.target.result);
                        };
                        reader.readAsDataURL(blob);
                    }
                }, false);
                // Send XHR
                xhr.send();
            });
        },
        putElephantInDb = function (blob, failureCallback) {
            var transaction = db.transaction(["image"], 'readwrite');
            if (blob) {
                transaction.objectStore("image").put(blob, "image");
            }
            transaction.objectStore("image").get("image").onsuccess = function (event) {
                if (event.target.result) {
                    var imgElephant = document.getElementById("images-video-container-png");
                    imgElephant.setAttribute("src", event.target.result);
                    imageURL = event.target.result;
                } else if (failureCallback) failureCallback();
            };
        };

    request.onerror = function () {
        console.log("Error creating/accessing IndexedDB database");
    };

    request.onsuccess = function () {
        console.log("Success creating/accessing IndexedDB database");
        db = request.result;

        db.onerror = function () {
            console.log("Error creating/accessing IndexedDB database");
        };

        // Interim solution for Google Chrome to create an objectStore. Will be deprecated
        if (db.setVersion) {
            if (db.version != dbVersion) {
                var setVersion = db.setVersion(dbVersion);
                setVersion.onsuccess = function () {
                    createObjectStore(db);
                    getImageFile();
                };
            } else {
                getImageFile();
            }
        } else {
            getImageFile();
        }
    }; // For future use. Currently only in latest Firefox versions
    request.onupgradeneeded = function (event) {
        createObjectStore(event.target.result);
    };
})();
