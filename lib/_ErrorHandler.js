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
        handleError: function(req, res, deferred, status, error) {
            var err = (error instanceof Error)?error:new Error(error);
            res.statusCode = parseInt(status);
            deferred.reject(err);
        }
    });
    return _ErrorHandler;
});
