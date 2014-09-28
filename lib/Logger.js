define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/string"
], function(declare, topic, string) {
    "use strict";

    /**
     * This module is the class for elenajs logger.
     * Constructor accepts 'category' as parameter (default category is 'elenajs').
     * 
     *
     * @module elenajs/Logger
     *
     */
    var Logger = declare("elenajs.Logger", null, {
        category: null,
        constructor: function(params) {
            this.category = params.category || 'elenajs';
        },
        _log: function(level, message, args) {
            var self = this,
                    logMessage = {
                        time: new Date(),
                        category: self.category,
                        level: level,
                        message: message
                    };
            if (typeof message === 'string' && args) {
                try {
                    logMessage.message = string.substitute(message, args);
                } catch (e) {
                    console.error(e);
                }
            }
            topic.publish('elenajs/log', logMessage);
            return logMessage;
        },
        /**
         * This method sets the template to be rendered from the source string.
         *
         * @param src {string} The template source.
         * @instance
         */
        log: function(message, args) {            
            return this._log('log', message, args);
        },
        info: function(message, args) {            
            return this._log('info', message, args);
        },
        debug: function(message, args) {            
            return this._log('debug', message, args);
        },
        warn: function(message, args) {            
            return this._log('warn', message, args);
        },
        error: function(message, args) {            
            return this._log('error', message, args);
        }
    });

    return Logger;
});