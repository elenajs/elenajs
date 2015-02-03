define([
    "../declare",
    "../_base/Mixin",
    "dojo/Deferred",
    "dojo/topic",
    "dojo/_base/lang",
    "dojo/string"
], function(
        declare,
        Mixin,
        Deferred,
        topic,
        lang,
        string) {

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
    var _Appender = declare("elenajs.logging._Appender", Mixin, {
        categories: null,
        levels: null,
        messageFormat: '[${time}] - ${level} - ${message}',
        constructor: declare.superCall(function (sup) {
            return function () {

                sup.apply(this, arguments);
                var self = this;
                topic.subscribe('elenajs/log', function (evt) {
                    self.match(evt).then(function (data) {
                        self.onMessage(data);
                    }, function () {
                    });
                });
            }
        }),
        match: function(evt) {
            var dfd = new Deferred(),
                    matchCategory = !this.categories || this.categories.indexOf(evt.category) >= 0,
                    matchLevel = !this.levels || this.levels.indexOf(evt.level) >= 0;
            if (matchCategory && matchLevel) {
                dfd.resolve(evt);
            } else {
                dfd.reject(evt);
            }
            return dfd;
        },
        onMessage: function(evt) {

            var msg = evt.message;
            if (msg instanceof Error) {
                msg = msg.message + '\n' + msg.stack;
            }

            this.writeMessage({
                time: evt.time,
                level: evt.level.toUpperCase(),
                message: msg
            });
        },
        messageToString: function (message) {
            if (message.message === undefined) {
                message.message = 'undefined';
            }
            return string.substitute(this.messageFormat, message);
        },
        writeMessage: function(data) {
            throwAbstract();
        }
    });
    return _Appender;
});