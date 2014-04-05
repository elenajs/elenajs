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
     * Module returning a clhte interface needed to implement dispatcher object.
     *
     * @mixes elenajs/_ErrorHandler
     * @module elenajs/_Router
     */
    var _Router = declare("elenajs._Router", _ErrorHandler, {
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
         * This method performs the dispatch logic and returns a dojo/Deferred object.
         * It's fired only when the deferred object given by the match method has a successful result.
         *
         * @param {!elenajs.HttpDeferred} httpDdeferredPointer The deferred pointer is used during
         * the dispatch chain to store the result in an asynchronous way.
         *
         * @returns {dojo.Deferred}
         * @Instance
         */
        dispatch: function(httpDeferredPointer) {
            throwAbstract();
        }
    });
    return _Router;
});
