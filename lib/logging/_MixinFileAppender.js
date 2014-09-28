define([
    "dojo/_base/declare",
    "./_Appender",
    "../fs/dfs",
    "dojo/Deferred",
    "dojo/node!path",
    "../logger!"
], function (declare, _Appender, dfs, Deferred, path, logger) {
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
    var _MixinFileAppender = declare("elenajs.logging._MixinFileAppender", [_Appender], {
        fileBaseName: null,
        _buffer: [],
        os: null,
        _writingMessage: false,
        writeMessage: function (data) {
            var self = this;
            data && this._buffer.push(data);
            this._rotate().then(
                function () {
                    self._popMessage();
                },
                function (err) {
                    console.error(err);
                });
        },
        _popMessage: function () {
            if (!this._writingMessage) {
                var self = this,
                    messageData = this._buffer.shift();
                if (messageData) {
                    this._writingMessage = true;
                    this.os.write(this.messageToString(messageData) + '\n', 'utf8', function () {
                        self._writingMessage = false;
                        self.writeMessage();
                    });
                }
            }
        },
        _rotate: function () {
            throwAbstract();
        },
        _createFileOrOpen: function () {
            var self = this,
                    dfd = new Deferred();
            try {
                var os = dfs.createWriteStream(this.fileBaseName + '.log', { flags: 'a',
                    encoding: 'utf8',
                    mode: 0644 });
                dfd.resolve(os);
            } catch (err) {
                dfd.reject(err);
            }
            return dfd;

        }
    });
    return _MixinFileAppender;
});