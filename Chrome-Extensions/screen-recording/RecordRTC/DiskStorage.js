// via: https://github.com/muaz-khan/RecordRTC/blob/master/dev/DiskStorage.js

var DiskStorage = {
    init: function() {
        var self = this;

        var dbVersion = 1;
        var dbName = this.dbName || location.href.replace(/\/|:|#|%|\.|\[|\]/g, ''),
            db;
        var request = indexedDB.open(dbName, dbVersion);

        function createObjectStore(dataBase) {
            dataBase.createObjectStore(self.dataStoreName);
        }

        function putInDB() {
            var transaction = db.transaction([self.dataStoreName], 'readwrite');

            if(typeof self.data.value !== 'undefined') {
                var request = transaction.objectStore(self.dataStoreName).put(self.data.value, self.data.key);
                var key = self.data.key;
                request.onsuccess = function() {
                    if (typeof self.callback === 'function') {
                        self.callback('succes', key);
                        self.callback = null;
                    }
                };
                request.onerror = function(error) {
                    if (typeof self.callback === 'function') {
                        self.callback(null, key, error);
                        self.callback = null;
                    }
                };
            }

            function getFromStore(key) {
                var request = transaction.objectStore(self.dataStoreName).get(key);
                request.onsuccess = function(event) {
                    if (typeof self.callback === 'function') {
                        self.callback(event.target.result, key);
                        self.callback = null;
                    }
                };

                request.onerror = function(error) {
                    if (typeof self.callback === 'function') {
                        self.callback(null, key, error);
                        self.callback = null;
                    }
                };
            }

            getFromStore(self.data.key);
        }

        request.onerror = self.onError;

        request.onsuccess = function() {
            db = request.result;
            db.onerror = self.onError;

            if (db.setVersion) {
                if (db.version !== dbVersion) {
                    var setVersion = db.setVersion(dbVersion);
                    setVersion.onsuccess = function() {
                        createObjectStore(db);
                        putInDB();
                    };
                } else {
                    putInDB();
                }
            } else {
                putInDB();
            }
        };
        request.onupgradeneeded = function(event) {
            createObjectStore(event.target.result);
        };
    },
    Fetch: function(key, callback) {
        this.data = {
            key: key
        };

        this.callback = callback;
        this.init();

        return this;
    },
    Store: function(data, callback) {
        this.data = data;
        this.callback = callback;
        this.init();

        return this;
    },
    onError: function(error) {
        console.error(error);
    },
    dataStoreName: 'DiskStorage',
    dbName: 'DiskStorage',
    data: {
        value: '',
        key: 'key'
    }
};
