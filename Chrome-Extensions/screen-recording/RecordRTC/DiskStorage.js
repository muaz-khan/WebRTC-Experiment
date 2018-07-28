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
        DiskStorage.Fetch('files-list', function(list) {
            if (!list || list === 'success') {
                list = [];
            }

            list.push({
                name: file.name,
                display: file.name,
                youtube: '',
                php: ''
            });

            DiskStorage.Store({
                key: 'files-list',
                value: list
            }, function() {
                DiskStorage.Store({
                    key: file.name,
                    value: file
                }, callback);
            });
        });
    },
    RemoveFile: function(fName, callback) {
        DiskStorage.Fetch('files-list', function(list) {
            if (!list || list === 'success') {
                list = [];
            }

            var newNames = [];
            list.forEach(function(item) {
                if(typeof item === 'string') {
                    if (item !== fName) {
                        newNames.push({
                            name: item,
                            display: item,
                            youtube: '',
                            php: ''
                        });
                    }
                }
                else if(typeof item.name === 'string') {
                    if (item.name !== fName) {
                        newNames.push(item);
                    }
                }
            });
            list = newNames;

            DiskStorage.Store({
                key: 'files-list',
                value: list
            }, function() {
                DiskStorage.Remove(fName, callback);
            });
        });
    },
    GetFilesList: function(callback) {
        DiskStorage.Fetch('files-list', function(list) {
            if (!list || list === 'success') {
                list = [];
            }

            var newList = [];
            list.reverse().forEach(function(item) {
                if(typeof item === 'string') {
                    newList.push({
                        name: item,
                        display: item,
                        youtube: '',
                        php: ''
                    });
                }
                else {
                    newList.push({
                        name: item.name,
                        display: item.display || item.name,
                        youtube: item.youtube,
                        php: item.php
                    });
                }
            })

            callback(newList);
        });
    },
    GetLastSelectedFile: function(fName, callback) {
        DiskStorage.GetFilesList(function(list) {
            if (!list.length) {
                callback();
                return;
            }

            if(!fName) {
                DiskStorage.Fetch(list[0].name || list[0], callback);
                return;
            }

            var found;
            list.forEach(function(item) {
                if(typeof item === 'string') {
                    if(item === fName) {
                        found = {
                            name: item,
                            display: item,
                            php: '',
                            youtube: ''
                        };
                    }
                }
                else if(item.name === fName) {
                    found = item;
                }
            });

            if(!found) {
                DiskStorage.Fetch(list[0].name || list[0], callback);
                return;
            }

            DiskStorage.Fetch(found.name, callback);
        });
    },
    UpdateFileName: function(fileName, newFileName, callback) {
        if(!newFileName || !newFileName.replace(/ /g, '').length) {
            newFileName = 'unknown.webm';
        }
        
        if(newFileName.split('.').length <= 1) {
            newFileName = newFileName.split('.')[0] + '.webm';
        }

        DiskStorage.Fetch('files-list', function(list) {
            if (!list || list === 'success') {
                list = [];
            }

            var alreadyTaken;
            list.forEach(function(item, idx) {
                if(item.name === newFileName || /* fallback */ item === newFileName) {
                    alreadyTaken = true;
                }
            });

            if(alreadyTaken) {
                newFileName = newFileName.split('.')[0] + '_.' + newFileName.split('.')[1];
                DiskStorage.UpdateFileName(fileName, newFileName, callback);
                return;
            }

            var updated;
            list.forEach(function(item, idx) {
                if(typeof item === 'string') {
                    if(item !== fileName) {
                        return;
                    }
                }
                else if(typeof item.name === 'string') {
                    if(item.name !== fileName) {
                        return;
                    }
                }

                updated = true;

                item.name = newFileName;
                list[idx] = item;
            });

            DiskStorage.Store({
                key: 'files-list',
                value: list
            }, function() {
                DiskStorage.Fetch(fileName, function(blob) {
                    var file = new File([blob], newFileName, {
                        type: blob.type
                    });

                    DiskStorage.Store({
                        key: file.name,
                        value: file
                    }, function() {
                        callback(file);
                    });
                });
            });
        });
    },
    UpdateFileInfo: function(fileName, info, callback) {
        DiskStorage.Fetch('files-list', function(list) {
            if (!list || list === 'success') {
                list = [];
            }

            var updated;
            list.forEach(function(item, idx) {
                if(typeof item === 'string') {
                    if(item !== fileName) {
                        return;
                    }
                }
                else if(typeof item.name === 'string') {
                    if(item.name !== fileName) {
                        return;
                    }
                }

                updated = true;

                Object.keys(info).forEach(function(key) {
                    item[key] = info[key];
                })
                list[idx] = item;
            });

            DiskStorage.Store({
                key: 'files-list',
                value: list
            }, callback);
        });
    }
};
