define([
    "dojo/Stateful",
    "dojo/Evented",
    "dojo/_base/declare"
], function(
        Stateful,
        Evented,
        declare
        ) {
    /**
     * This module return a class used as interface for error and exceptions handling.
     *
     * @mixes http://dojotoolkit.org/api/1.9/dojo/Stateful.html
     * @mixes http://dojotoolkit.org/api/1.9/dojo/Evented.html
     *
     * @module elenajs/_ErrorHandler
     */
    var _ErrorHandler = declare("elenajs._ErrorHandler", [Stateful, Evented], {
        /**
         * This method hanldeles error and exceptions in
         *
         * @param {elenajs.HttpDeferred} deferred The deferred object used during the
         * http request control flow
         * @param {int} status the http status code
         * @param {type} error A string or an Error instance
         */
        handleError: function(deferred, status, error) {
            var err = (error instanceof Error) ? error : new Error(error);
            if (status) {
                deferred.httpResponse.statusCode = parseInt(status);
            }
            deferred.reject(err);
        }
    });
    return _ErrorHandler;
});
