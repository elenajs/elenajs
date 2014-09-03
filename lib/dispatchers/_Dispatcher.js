define([
    "dojo/_base/declare",
    "dojo/Stateful",
    "../promise/sync"
], function(declare,
        Stateful,
        sync
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
     * @mixes http://dojotoolkit.org/api/1.9/dojo/Stateful.html
     *
     */
    var _Dispatcher = declare("elenajs.dispatchers._Dispatcher", Stateful, {
        /**
         * Dispatchers are like a sort of filters where the http request passes.
         *
         * @type {dojo.Deferred[]}
         * @instance
         */
        dispatchers: [],
        /**
         * Match method is called to determine if the current dispatcher will
         * be involved into the http-request chain.<br>
         * A dojo/Deferred object it used to allow non blocking io.
         *
         * @param req {http.ClientRequest} Http request object passed during http control flow.
         * @returns {dojo.Deferred}
         * @instance
         */
        match: function(req) {
            throwAbstract();
        },
        /**
         * This method performs the dispatch logic and returns a {@link module:elenajs/HttpDeferred|elenajs/HttpDeferred} object.
         * It's fired only when the deferred object given by the match method has a successful result.
         *
         * @param {!elenajs.HttpDeferred} httpDeferredContext The deferred pointer is used during
         * the dispatch chain to store the result in an asynchronous way.
         *
         * @returns {elenajs.HttpDeferred}
         *
         * @Instance
         */
        dispatch: function(httpDeferredContext) {
            try {
                var matcherPromises = [];

                var dispatchers = [].concat(this.get('dispatchers'));
                dispatchers.forEach(function(dispatcher) {
                    matcherPromises.push(function() {
                        return dispatcher.match(httpDeferredContext.get('httpRequest'));
                    });
                });

                sync(matcherPromises, function(dispatcher) {
                    return dispatcher;
                }).then(function(dispatcher) {
                    if (dispatcher) {
                        dispatcher.dispatch(httpDeferredContext);
                    } else {
                        httpDeferredContext.signal("page not found: " + httpDeferredContext.httpRequest, 404);
                    }
                }, function(err) {
                    httpDeferredContext.signal(err);
                });
            } catch (err) {
                httpDeferredContext.signal(err);
            }
            return httpDeferredContext;
        }

    });
    return _Dispatcher;
});
