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
     * Module returning a class to create ElenaJs request diaptcher.<br>
     * This class should be considered abstract and it's not meant to be
     * directly used for serving requests.<br>
     * In ElenaJs dispatchers work so that when an http-request arrives the
     * match function is called.<br>
     * If the match method return value is not false then the
     * dispatch method is called by the caller. <br>
     * The caller is usually the ElenaJs Server itself or another dispatcher.
     *
     * @module elenajs/dispatchers/_Dispatcher
     *
     * @mixes module:elenajs/_Router
     * @mixes module:elenajs/_ErrorHandler
     * @mixes http://dojotoolkit.org/api/1.9/dojo/Stateful.html
     *
     */
    var _Dispatcher = declare("elenajs.dispatchers._Dispatcher", [Stateful, _Router, _ErrorHandler], {
        /**
         * This method implements the one inherited (and abstract) defined by the method
         * in elenajs/_Router.
         * @see {@link module:elenajs/_Router#dispatch}
         *
         * @returns {dojo.Deferred}
         * @Instance
         */
        dispatch: function(httpDeferredPointer) {
            var self = this;
            try {
                var matcherPromises = [];

                var dispatchers = [].concat(this.get('dispatchers'));
                dispatchers.forEach(function(dispatcher) {
                    matcherPromises.push(function() {
                        return dispatcher.match(httpDeferredPointer.get('httpRequest'));
                    });
                });

                sync(matcherPromises, function(dispatcher) {
                    return dispatcher;
                }).then(function(dispatcher) {
                    if (dispatcher) {
                        dispatcher.dispatch(httpDeferredPointer);
                    } else {
                        self.handleError(httpDeferredPointer, 404, "page not found: " + req.url);
                    }
                }, function(err) {
                    self.handleError(httpDeferredPointer, 500, err);
                });
            } catch (err) {
                self.emit('error', {
                    request: httpDeferredPointer.get('httpRequest'),
                    response: httpDeferredPointer.get('httpResponse'),
                    error: err});
            }
            return httpDeferredPointer;
        }

    });
    return _Dispatcher;
});
