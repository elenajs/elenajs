/**
 * Module returning a class to create an basic request dispatcher. 
 * @module elenajs/dispatchers/_Dispatcher
 * @see elenajs.dispatchers._Dispatcher
 */
define([
    "dojo/_base/declare",
    "dojo/Stateful",
    "../_Router",
    "../_ErrorHandler",
    "../promise/sync",
    "dojo/Deferred"
], function(declare,
        Stateful,
        _Router,
        _ErrorHandler,
        sync,
        Deferred
        ) {

    function throwAbstract() {
        throw new TypeError("abstract");
    }

    /**
     * Class to create ElenaJs sequest diaptcher. This class is abstract 
     * and not meant to be used directly for serving requests.<br>
     * On subclasses remember to implement the match method.
     * @extends dojo.Stateful, elenajs._Router, elenajs._ErrorHandler
     * @class elenajs.dispatchers._Dispatcher
     */
    var _Dispatcher = declare("elenajs.dispatchers._Dispatcher", [Stateful, _Router, _ErrorHandler], {
        matcher: /^.*/,
        antiMatcher: null,
        match: function(req) {
            throwAbstract();
        },
        dispatch: function(req, res, deferredPointer) {
            var self = this;
            var deferred = deferredPointer || new Deferred();

            try {
                var matchers = [];

                var dispatchers = [].concat(this.get('dispatchers'));
                dispatchers.forEach(function(dispatcher) {
                    matchers.push(function() {
                        return dispatcher.match(req);
                    });
                });

                sync(matchers, function(dispatcher) {
                    return dispatcher;
                }).then(function(dispatcher) {
                    if (dispatcher) {
                        dispatcher.dispatch(req, res, deferred);
                    } else {
                        self.handleError(req, res, deferred, 404, "page not found: " + req.url);

                    }
                }, function(err) {
                    self.handleError(req, res, deferred, 500, err);
                });
            } catch (err) {
                self.emit('error', {request: req, response: res, error: err});
            }
            return deferred;
        }

    });
    return _Dispatcher;
});
