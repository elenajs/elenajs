define([
    "../declare",
    "./_Appender",
    "dojo/Evented",
    "../fs/dfs",
    "../promise/async",
    "dojo/Deferred",
    "../node!path"
], function (declare, _Appender, Evented, dfs, async, Deferred, path) {
    function throwAbstract() {
        throw new TypeError("abstract");
    }

    /**
     * This module is the class for elenajs logger.
     * Constructor accepts 'category' as parameter (default category is 'elenajs').
     *
     *
     * @module elenajs/Logger
     *
     */
    var _MixinFileAppender = declare("elenajs.logging._MixinFileAppender", [Evented, _Appender], {
        fileBaseName: null,
        maxBackup: 0,
        _buffer: [],
        os: null,
        _busy: false,
        writeMessage: function (data) {
            this._buffer.push(data);
            this._popMessage();

        },
        _popMessage: function () {
            if (!this._busy) {
                var self = this,
                    messageData = this._buffer.shift(),
                    writeLastMessage = function () {
                        var messageString = self.messageToString(messageData);
                        self.os.write(messageString + '\n', 'utf8', function () {
                            self._busy = false;
                            self.emit("message", {target: this, message: messageString});
                            self._popMessage();
                        });
                    };
                if (messageData) {
                    this._busy = true;
                    this._rotate().then(
                        function () {
                            writeLastMessage();
                        },
                        function (err) {
                            console.error(err);
                        });
                }
            }
        },
        extractLogs: function (files) {
            throwAbstract();
        },
        isBackupNeeded: function (statData) {
            return false;
        },
        _backupLogs: function () {
            var self = this,
                pathName = path.dirname(this.fileBaseName),
                dfd = new Deferred();
            dfs.readdir(pathName).then(
                function (files) {
                    var logs = self.extractLogs(files);
                    async([
                        function () {
                            return self.withInvalidLogs(logs.invalid);
                        },
                        function () {
                            return self.withValidLogs(logs.valid);
                        }]).then(
                        function () {
                            dfd.resolve();
                        },
                        function (errs) {
                            dfd.reject(errs);
                        });
                },
                function (err) {
                    dfd.reject(err);
                }
            );
            return dfd;
        },
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


            dfs.stat(this.fileBaseName + '.log').then(function (statData) {
                if (self.isBackupNeeded(statData)) {
                    //backup logs
                    self._backupLogs().then(
                        createFileOrOpen,
                        function (errs) {
                            console.warn(errs);
                            if (self.os) {
                                dfd.resolve(self.os);
                            } else {
                                createFileOrOpen();
                            }
                        }
                    );
                } else {
                    if (self.os) {
                        dfd.resolve(self.os);
                    } else {
                        createFileOrOpen();
                    }
                }
            }, function () {
                createFileOrOpen();
            });

            return dfd;
        },
        withValidLogs: function (logs) {
            var dfd = new Deferred();
            dfd.resolve();
            return dfd;
        },
        withInvalidLogs: function (logs) {
            var dfd = new Deferred();
            dfd.resolve();
            return dfd;
        },
        _createFileOrOpen: function () {
            var self = this,
                dfd = new Deferred();
            try {
                var fileName = this.fileBaseName + '.log',
                    os = dfs.createWriteStream(fileName, {flags: 'a',
                        encoding: 'utf8',
                        mode: 0644});
                self.emit("create", {filename: fileName});
                dfd.resolve(os);
            } catch (err) {
                dfd.reject(err);
            }
            return dfd;

        }
    });
    return _MixinFileAppender;
});