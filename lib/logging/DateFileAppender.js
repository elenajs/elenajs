define([
    "../declare",
    "./_MixinFileAppender",
    "../fs/dfs",
    "../promise/async",
    "dojo/date",
    "dojo/date/locale",
    "dojo/Deferred",
    "../node!path"
], function (declare, _MixinFileAppender, dfs, async, date, locale, Deferred, path) {
    /**
     * This module is the class for elenajs logger.
     * Constructor accepts 'category' as parameter (default category is 'elenajs').
     *
     *
     * @module elenajs/Logger
     *
     */
    var DateFileAppender = declare("elenajs.logging.DateFileAppender",
        _MixinFileAppender,
        {
            _logFileDate: new Date(),
            _initialized: false,
            constructor: declare.superCall(function (sup) {
                return function () {
                    var self = this;

                    sup.apply(this, arguments);
                    this.on('create', function () {
                        self._logFileDate = new Date();
                    });
                }
            }),
            isBackupNeeded: function () {
                var maxFileAge = this.maxFileAge;
                if (this.maxFileAge) {
                    var created = new Date(this._logFileDate.valueOf()),
                        now = new Date(),
                        age = maxFileAge.match(/^([0-9]+)([h,d,m]?)$/i);
                    if (!age) {
                        return false;
                    } else {
                        var delta = age[1],
                            interval;
                        if (delta <= 0) {
                            return false;
                        } else if (!this._initialized) {
                            this._initialized = true;
                            return true;
                        }
                        switch (age[2]) {
                            case 'h':
                            case 'H':
                                created.setMinutes(0, 0, 0);
                                now.setMinutes(0, 0, 0);
                                interval = 'hour';
                                break;
                            case 'd':
                            case 'D':
                                created.setHours(0, 0, 0, 0);
                                now.setHours(0, 0, 0, 0);
                                interval = 'day';
                                break;
                            case 'm':
                            case 'M':
                                created.setHours(0, 0, 0, 0);
                                created.setDate(1);
                                now.setHours(0, 0, 0, 0);
                                now.setDate(1);
                                interval = 'month';
                                break;
                            default: //(minutes
                                created.setSeconds(0, 0);
                                now.setSeconds(0, 0);
                                interval = 'minute';
                                break;
                        }
                        return date.difference(created, now, interval) > delta;
                    }
                } else {
                    return false;
                }
            },
            withValidLogs: function (logs) {
                var count = logs.length,
                    dfd = new Deferred(),
                    currentLog = count && logs[0].search(/\.log$/i) >= 0 && logs[0];
                if (currentLog) {
                    this._backupFile(currentLog).then(
                        function () {
                            dfd.resolve();
                        },
                        function (err) {
                            dfd.reject(err);
                        }
                    );
                } else {
                    dfd.resolve();
                }
                return dfd;
            },
            withInvalidLogs: function (logs) {

                var dfd = new Deferred(),
                    pathName = path.dirname(this.fileBaseName),
                    deleteFilesProimiseFuncs = [];
                if (logs.length) {
                    logs.forEach(function (file) {
                        var fileName = path.resolve(pathName, file);
                        deleteFilesProimiseFuncs.push(function () {
                            return dfs.unlink(fileName);
                        });
                    });
                    async(deleteFilesProimiseFuncs).then(
                        function () {
                            dfd.resolve();
                        },
                        function (errs) {
                            dfd.reject(errs);
                        }
                    );
                } else {
                    dfd.resolve();
                }
                return dfd;
            },
            _backupFile: function (file) {
                var self = this,
                    dfd = new Deferred(),
                    pathName = path.dirname(this.fileBaseName),
                    oldName = path.resolve(pathName, file),
                    newIndex = locale.format(new Date(), {
                        selector: 'date',
                        datePattern: this.fileDatePattern}),
                    newName = this.fileBaseName + '.log.' + newIndex;

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

            },
            extractLogs: function (files) {
                var fileName = path.basename(this.fileBaseName),
                    validLogs = [],
                    invalidLogs = [],
                    logs = files.filter(function (f) {
                        return f.lastIndexOf(fileName) >= 0 && f.search(/\.log$|\.log\..*/i) >= 0;
                    }).sort(function(a, b) {
                        if (a.search(/\.log$/i)>=0) {
                            return -1;
                        } else {
                            return (a < b)? 1:-1;
                        }
                    });
                if (this.maxBackup >= 0) {
                    validLogs = logs.slice(0, this.maxBackup);
                    invalidLogs = logs.slice(this.maxBackup);
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
            fileDatePattern: {
                value: 'yyyyMMddHHmm',
                writable: true
            },
            maxFileAge: {
                writable: true
            }
        });
    return DateFileAppender;
});