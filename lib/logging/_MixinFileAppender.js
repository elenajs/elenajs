define([
    "../declare",
    "./_Appender",
    "dojo/Evented",
    "../fs/dfs",
    "dojo/Deferred"
], function (declare, _Appender, Evented, dfs, Deferred) {
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
                            self.emit("message", {target: this, message: messageString})
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