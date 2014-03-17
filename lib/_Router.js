/**
 * Module returning a class to create an basic class/interface needed to implement dispatcher. 
 * @module elenajs/_Router
 * @see elenajs._Router
 */
define([
    "./_ErrorHandler",
    "dojo/_base/declare"
], function(
        _ErrorHandler,
        declare
        ) {
    function throwAbstract() {
        throw new TypeError("abstract");
    }
    /**
     * Interface for every elenajs routers..
     * @extends elenajs._ErrorHandler
     * @class elenajs._Router
     */
    var _Router = declare("elenajs._Router", _ErrorHandler, {
        dispatchers: [],
        match: function(req) {
            throwAbstract();
        },
        dispatch: function(req, res, deferredPointer) {
            throwAbstract();
        }
    });
    return _Router;
});
