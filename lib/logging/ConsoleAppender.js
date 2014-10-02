define([
    "../declare",
    "./_Appender"
], function(
        declare,
        _Appender) {

    /**
     * This module is the class for elenajs logger.
     * Constructor accepts 'category' as parameter (default category is 'elenajs').
     * 
     *
     * @module elenajs/Logger
     *
     */
    var ConsoleAppender = declare("elenajs.logging.ConsoleAppender", _Appender, {
       writeMessage: function (data) {
            var logFunct = console[data.level.toLowerCase()] || console.log,
                    message = this.messageToString(data);
            
            logFunct(message);
        }
    });
    return ConsoleAppender;
});