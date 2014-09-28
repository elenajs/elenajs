define([
    "dojo/_base/declare",
    "dojo/Stateful",
    "dojo/Evented",
    "dojo/Deferred",
    "dojo/topic",
    "dojo/_base/lang",
    "dojo/string"
], function(
        declare,
        Stateful,
        Evented,
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
    var _Appender = declare("elenajs.logging._Appender", [Stateful, Evented], {
        categories: null,
        levels: null,
        messageFormat: '[${time}] - ${level} - ${message}',
        constructor: function(args) {
            lang.mixin(this, args);
        },
        postscript: function() {
            var self = this;
            this.inherited(arguments);
            topic.subscribe('elenajs/log', function(evt) {
                self.match(evt).then(function(data) {
                    self.onMessage(data);
                });
            });
        },
        match: function(evt) {
            var dfd = new Deferred(),
                    matchCategory = !this.categories || this.categories.indexOf(evt.category),
                    matchLevel = !this.levels || this.levels.indexOf(evt.level);
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
            return string.substitute(this.messageFormat, message);
        },
        writeMessage: function(data) {
            throwAbstract();
        }
    });
    return _Appender;
});