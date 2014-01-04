define([
    "dojo/Stateful",
    "dojo/Evented",
    "dojo/_base/declare"
], function(
        Stateful,
        Evented,
        declare
        ) {
    var _ErrorHandler = declare("elenajs._ErrorHandler", [Stateful, Evented], {
        handleError: function(deferred, req, res, status, error) {
            var err = (error instanceof Error)?error:new Error(error);
            res.statusCode = parseInt(status);
            deferred.reject({request: req, response: res, error: err});
        }
    });
    return _ErrorHandler;
});
