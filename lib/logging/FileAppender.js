define([
    "../declare",
    "./_MixinFileAppender",
    "../fs/dfs",
    "../promise/sync",
    "dojo/Deferred",
    "dojo/node!path"
], function (
    declare,
    _MixinFileAppender,
    dfs,
    sync,
    Deferred,
    path) {
    /**
     * This module is the class for elenajs logger.
     * Constructor accepts 'category' as parameter (default category is 'elenajs').
     *
     *
     * @module elenajs/Logger
     *
     */
    var FileAppender = declare("elenajs.logging.FileAppender",
        _MixinFileAppender,
        {
            maxBackup: 0,
            maxFileSize: 0,
            _rotate: function () {
                var self = this,
                    dfd = new Deferred(),
                    withNewOutputStream = function (os) {
                        if (self.os) {
                            self.os.end();
                        }
                        self.os = os;
                        self.os.on('error', function (err) {
                            console.error(err);
                        });
                        dfd.resolve(self.os);
                    },
                    reject = function (err) {
                        dfd.reject(err);
                    },
                    createFileOrOpen = function () {
                        self._createFileOrOpen().then(
                            withNewOutputStream,
                            reject
                        );
                    };


                if (!this.maxBackup || !this.maxFileSize || !this.os) {
                    createFileOrOpen();
                } else if (this.maxBackup && this.maxFileSize) {
                    dfs.stat(this.fileBaseName + '.log').then(function (statData) {
                        var currentFileSize = statData.size;
                        if (currentFileSize >= self.maxFileSizeBytes) {
                            //backup logs
                            self._backupLogs().then(
                                createFileOrOpen,
                                reject
                            );
                        } else {
                            dfd.resolve(self.os);
                        }
                    }, function () {
                        createFileOrOpen();
                    });
                } else {
                    dfd.resolve(self.os);
                }
                return dfd;
            },
            _backupLogs: function () {
                var self = this,
                    renamePromiseFunctions = [],
                    pathName = path.dirname(this.fileBaseName),
                    dfd = new Deferred();
                dfs.readdir(pathName).then(
                    function (files) {
                        var logs = self._extractLogs(files),
                            count = logs.length;
                        for (var newIdx = count; newIdx > 0; newIdx--) {
                            renamePromiseFunctions.push(self._backupFile(logs[newIdx - 1], newIdx));
                        }
                        sync(renamePromiseFunctions).then(
                            function () {
                                dfd.resolve();
                            },
                            function (err) {
                                dfd.reject(err);
                            }
                        );
                    },
                    function (err) {
                        dfd.reject(err);
                    }
                );
                return dfd;
            },
            _extractLogs: function (files) {
                var fileName = path.basename(this.fileBaseName),
                    logs = files.filter(function (f) {
                        return f.lastIndexOf(fileName) >= 0 && f.search(/\.log$/i) >= 0;
                    }).sort(function (f1, f2) {
                        var rgxp = /\.([0-9]*)(\.?log)$/i,
                            ix1 = (f1.match(rgxp)[1] || 0) * 1,
                            ix2 = (f2.match(rgxp)[1] || 0) * 1;
                        return ix1 - ix2; //we need reverse order
                    }).slice(0, this.maxBackup);

                return logs;
            },
            _backupFile: function (file, newIndex) {
                var pathName = path.dirname(this.fileBaseName),
                    oldName = path.resolve(pathName, file),
                    newName = this.fileBaseName + '.' + newIndex + '.log';
                 return function () {
                     return dfs.rename(oldName, newName);
                 }
            }
        },
        {
            maxFileSize: {
                get: function () {
                    return this._maxFileSize;
                },
                set: function (value) {
                    this._maxFileSize = value;
                    var sizeStr = value + '',
                        sz = sizeStr.match(/^([0-9]+)([k,m,g]?)$/i);
                    if (!sz) {
                        this.maxFileSizeBytes = 0;
                    } else {
                        switch (sz[2]) {
                            case 'k':
                            case 'K':
                                this.maxFileSizeBytes = sz[1] * 1024;
                                break;
                            case 'm':
                            case 'M':
                                this.maxFileSizeBytes = sz[1] * 1048576;
                                break;
                            case 'g':
                            case 'G':
                                this.maxFileSizeBytes = sz[1] * 1073741824;
                                break;
                            default:
                                this.maxFileSizeBytes = sz[1] * 1;
                                break;
                        }
                    }
                }
            }
        });
    return FileAppender;
});