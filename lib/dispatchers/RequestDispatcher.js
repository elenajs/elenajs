define([
    "../declare",
    "./_Dispatcher",
    "./../_base/_RequestProcessor",
    "dojo/Deferred",
    "../node!url"
], function(declare,
        _Dispatcher,
        _RequestProcessor,
        Deferred,
        url
        ) {
    function throwAbstract(){
		throw new TypeError("abstract");
	}
    /**
     * This module extends a dojo/Deferred object adding http request and response
     * informations in constructor.
     * Constructor accepts http request and http response as required parameters.
     *
     * @module elenajs/dispatchers/RequestDispatcher
     *
     * @mixes module:elenajs/dispatchers/_Dispatcher
     * @mixes module:elenajs/_base/_RequestProcessor
     *
     * @example
     * define([
            "dojo/_base/declare",
            "elenajs/dispatchers/RequestDispatcher",
            "elenajs/renderers/TemplateRenderer",
            "elenajs/http/swig!./templates/Page1.html"
        ], function(
                declare,
                RequestDispatcher,
                TemplateRenderer,
                HTMLTemplate
                ) {


            return declare('demo/dispatchers/Page1', RequestDispatcher, {
                matcher: /^\/pages\/page1.html$/i,
                title: 'Page 1',
                render: function(httpContext) {
                    var self = this;
                    new TemplateRenderer({
                        httpContext: httpContext,
                        templateObj: HTMLTemplate
                    }).render(self);
                }
            });
        });
     */
    var RequestDispatcher = declare("elenajs.dispatchers.RequestDispatcher", [_Dispatcher, _RequestProcessor], {
        /**
         * This attribute is a regular expression used by the {@link module:elenajs/dispatchers/RequestDispatcher#match|match} method
         * over the pathname of the request url.
         *
         * @default /^.*\/
         * @type {!regexp}
         * @instance
         */
        matcher: /^.*/,
        /**
         * This attribute is a regular expression used by the {@link module:elenajs/dispatchers/RequestDispatcher#match|match} method
         * in its negation over the pathname of the request url.
         *
         * @default null
         * @type {!regexp}
         * @instance
         */
        antiMatcher: null,
        /**
         * This method is used by ElenaJs to check if the current dispatcher can be
         * used to dispatch the incoming request.<br>
         * {@link module:elenajs/dispatchers/RequestDispatcher#matcher|matcher} and
         * {@link module:elenajs/dispatchers/RequestDispatcher#antiMatcher|antiMatcher} are used
         * to compute this task.<br>
         * This method is the implementation of the inherited {@link module:elenajs/dispatchers/_Dispatcher#match}
         *
         * @param req {http.ClientRequest} Http request object passed during http control flow.
         * @returns {dojo.Deferred}
         *
         * @instance
         */
        match: function(req) {
            var deferred = new Deferred();
            try {
                var pathname = url.parse(req.url).pathname;
                var isMatching = (!this.matcher || pathname.match(this.matcher)) &&
                        (!this.antiMatcher || !pathname.match(this.antiMatcher));
                deferred.resolve(isMatching && this);
            } catch (e) {
                deferred.reject(e);
            }
            return deferred;
        },
        /**
         * This method overrides the one defined by {@link module:elenajs/dispatchers/_Dispatcher#dispatch}
         * It a proxy to the {@link module:elenajs/dispatchers/RequestDispatcher#render|render} method that is used
         * to render an HTTP response.<br>
         * If the render method fails throwing an exception ElenaJs will handle it as a
         * 500 status error.
         *
         * @param {!elenajs.HttpContext} httpContext It's the deferred context passed to the
         * {@link module:elenajs/dispatchers/RequestDispatcher#render|render} method.
         *
         * @returns {elenajs.HttpContext}
         *
         * @Instance
         */
        dispatch: function(httpContext) {
            var self = this;

            try {
                self.render(httpContext);
            } catch (err) {
                httpContext.signal(err,500);
            }
            return httpContext;
        },
        /**
         *
         * @param {elenajs.HttpContext} httpContext It's the deferred context that stores
         * HTTP request and response and used to act asynchronously.<br>
         * This method is abstract and must be overridden.
         */
        render: function(httpContext) {
            throwAbstract();
        }
    });
    return RequestDispatcher;
});
