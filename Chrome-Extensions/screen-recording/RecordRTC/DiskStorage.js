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

            if (typeof self.data.key !== 'undefined') {
                var request;

                if (self.data.remove === true) {
                    request = transaction.objectStore(self.dataStoreName).delete(self.data.key);
                } else if (self.data.get === true) {
                    request = transaction.objectStore(self.dataStoreName).get(self.data.key);
                } else {
                    request = transaction.objectStore(self.dataStoreName).put(self.data.value, self.data.key);
                }

                var key = self.data.key;
                request.onsuccess = function() {
                    if (typeof self.callback === 'function') {
                        if (self.data.get === true) {
                            var cb = self.callback;
                            self.callback = null;
                            cb(event.target.result, key);
                            return;
                        }

                        var cb = self.callback;
                        self.callback = null;
                        cb('success', key);
                    }
                };
                request.onerror = function(error) {
                    if (typeof self.callback === 'function') {
                        self.callback(null, key, error);
                        var cb = self.callback;
                        self.callback = null;
                        cb(null, key, error);
                    }
                };
            }
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
            key: key,
            get: true
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
    Remove: function(key, callback) {
        this.data = {
            key: key,
            remove: true
        };

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
    },
    StoreFile: function(file, callback) {
        DiskStorage.Fetch('files-list', function(fileNames) {
            if (!fileNames || fileNames === 'success') {
                fileNames = [];
            }

            fileNames.push(file.name);

            DiskStorage.Store({
                key: 'files-list',
                value: fileNames
            }, function() {
                DiskStorage.Store({
                    key: file.name,
                    value: file
                }, callback);
            });
        });
    },
    RemoveFile: function(fName, callback) {
        DiskStorage.Fetch('files-list', function(fileNames) {
            if (!fileNames || fileNames === 'success') {
                fileNames = [];
            }

            var newNames = [];
            fileNames.forEach(function(name) {
                if (name !== fName) {
                    newNames.push(name);
                }
            });
            fileNames = newNames;

            DiskStorage.Store({
                key: 'files-list',
                value: fileNames
            }, function() {
                DiskStorage.Remove(fName, callback);
            });
        });
    },
    GetFilesList: function(callback) {
        DiskStorage.Fetch('files-list', function(fileNames) {
            if (!fileNames || fileNames === 'success') {
                fileNames = [];
            }

            callback(fileNames.reverse());
        });
    },
    GetRecentFile: function(callback) {
        DiskStorage.GetFilesList(function(fileNames) {
            if (!fileNames.length) {
                callback();
                return;
            }

            DiskStorage.Fetch(fileNames[0], callback);
        });
    }
};
