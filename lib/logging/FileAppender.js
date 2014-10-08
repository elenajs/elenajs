define([
    "../declare",
    "./_MixinFileAppender",
    "../fs/dfs",
    "../promise/sync",
    "dojo/Deferred",
    "dojo/node!path"
], function (declare, _MixinFileAppender, dfs, sync, Deferred, path) {
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
            isBackupNeeded: function (statData) {
                return this.maxFileSizeBytes &&
                    this.maxFileSizeBytes > 0 &&
                    statData.size >= this.maxFileSizeBytes;
            },
            withValidLogs: function (logs) {
                var count = logs.length,
                    dfd = new Deferred(),
                    renamePromiseFunctions = [];
                for (var newIdx = count; newIdx > 0; newIdx--) {
                    renamePromiseFunctions.push(this._backupFile(logs[newIdx - 1], newIdx));
                }
                sync(renamePromiseFunctions).then(
                    function () {
                        dfd.resolve();
                    },
                    function (err) {
                        dfd.reject(err);
                    }
                );
                return dfd;
            },
            _backupFile: function (file, newIndex) {
                var self = this,
                    pathName = path.dirname(this.fileBaseName),
                    oldName = path.resolve(pathName, file),
                    newName = this.fileBaseName + '.' + newIndex + '.log';
                return function () {
                    var dfd = new Deferred();

                    dfs.rename(oldName, newName).then(
                        function () {
                            self.emit("rename", {from: oldName, to: newName});
                            dfd.resolve();
                        },
                        function (err) {
                            dfd.reject(err);
                        }
                    );
                    return dfd;
                };
            },
            extractLogs: function (files) {
                var fileName = path.basename(this.fileBaseName),
                    validLogs = [],
                    invalidLogs = [],
                    logs = files.filter(function (f) {
                        return f.lastIndexOf(fileName) >= 0 && f.search(/\.log$/i) >= 0;
                    }).sort(function (f1, f2) {
                        var rgxp = /\.([0-9]*)(\.?log)$/i,
                            ix1 = (f1.match(rgxp)[1] || 0) * 1,
                            ix2 = (f2.match(rgxp)[1] || 0) * 1;
                        return ix1 - ix2; //we need reverse order
                    });
                if (this.maxBackup >= 0) {
                    validLogs = logs.slice(0, this.maxBackup);
                    invalidLogs = logs.slice(this.maxBackup + 1);
                } else {
                    validLogs = logs;
                }

                return {
                    valid: validLogs,
                    invalid: invalidLogs
                };
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