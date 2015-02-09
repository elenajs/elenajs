define([
    "../declare",
    "../_base/Mixin",
    "../promise/sync"
], function (declare,
             Mixin,
             sync) {

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
    var _Dispatcher = declare("elenajs.dispatchers._Dispatcher", Mixin, {
            /**
             * Dispatchers are like a sort of filters where the http request passes.
             *
             * @type {dojo.Deferred[]}
             * @instance
             */
            _dispatchers: null,
            constructor: declare.superCall(function (sup) {
                return function () {
                    var args = Array.prototype.slice.call(arguments);
                    if (args.length > 0 && args[0].dispatchers !== undefined) {
                        this._dispatchers = args[0].dispatchers;
                        delete args[0].dispatchers;
                    } else {
                        this._dispatchers = [];
                    }
                    sup.apply(this, args);
                }
            }),
            /**
             * Match method is called to determine if the current dispatcher will
             * be involved into the http-request chain.<br>
             * A dojo/Deferred object it used to allow non blocking io.
             *
             * @param req {http.ClientRequest} Http request object passed during http control flow.
             * @returns {dojo.Deferred}
             * @instance
             */
            match: function (req) {
                throwAbstract();
            },
            /**
             * This method performs the dispatch logic and returns a {@link module:elenajs/HttpContext|elenajs/HttpContext} object.
             * It's fired only when the deferred object given by the match method has a successful result.
             *
             * @param {!elenajs.HttpContext} httpContext The deferred pointer is used during
             * the dispatch chain to store the result in an asynchronous way.
             *
             * @returns {elenajs.HttpContext}
             *
             * @Instance
             */
            dispatch: function (httpContext) {
                try {
                    var matcherPromises = [];

                    var dispatchers = [].concat(this.dispatchers);
                    dispatchers.forEach(function (dispatcher) {
                        matcherPromises.push(function () {
                            return dispatcher.match(httpContext.httpRequest);
                        });
                    });

                    sync(matcherPromises, function (dispatcher) {
                        return dispatcher;
                    }).then(function (dispatcher) {
                        if (dispatcher) {
                            dispatcher.dispatch(httpContext);
                        } else {
                            httpContext.signal("page not found: " + httpContext.httpRequest, 404);
                        }
                    }, function (err) {
                        httpContext.signal(err);
                    });
                } catch (err) {
                    httpContext.signal(err);
                }
                return httpContext;
            },
            /**
             * This a new dispatcher to the list of dispatcher.
             *
             * @param {!elenajs/dispatchers/_Dispatcher | Array<elenajs/dispatchers/_Dispatcher>} dispatchers The dispatchers to be added. It can be a
             * single instance or an array if dispatchers
             * @param {!boolean} first When true the dispatcher is appended to the beginning of the already defined ones.
             * @returns {undefined}
             */
            addDispatchers: function (dispatchers, first) {
                if (first) {
                    this._dispatchers = [].concat(dispatcher, this._dispatchers);
                } else {
                    this._dispatchers = [].concat(this._dispatchers, dispatcher);
                }
            }
        },
        {
            dispatchers: {
                get: function () {
                    return [].concat(this._dispatchers);
                }
            }
        });
    return _Dispatcher;
});
