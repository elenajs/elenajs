/**
 * This module extends the standard RequestDispatcher to serve static files.<br>
 * It replaces the matcher expression attribute with the FSDispatcher path attribute
 * to resolve the requested resources.<br>
 * If the resource is found, an instance of {@link elenajs/renderers/FileRenderer} module object is
 * used to serve the resource.<br>
 * If the resource is not found a 404 status message is signaled.
 *
 * @module elenajs/dispatchers/FSDispatcher
 *
 * @mixes module:elenajs/dispatchers/RequestDispatcher
 *
 * @example define([
 "dojo/_base/declare",
 "elenajs/dispatchers/FSDispatcher",
 "require"
 ], function(
 declare,
 FSDispatcher,
 require
 ) {
    var resourcesUrl = require.toUrl("../resources");
    return declare('demo/dispatchers/StaticResources', FSDispatcher, {
        matcher: /^\/resources\//,
        path: resourcesUrl
    });
});
 */
define([
    "../declare",
    "./RequestDispatcher",
    "../renderers/FileRenderer",
    "../node!path",
    "../node!url"
], function (declare,
             RequestDispatcher,
             FileRenderer,
             path,
             url) {
    var fileRenderer = new FileRenderer({}),
        FSDispatcher = declare("elenajs.dispatchers.FSDispatcher", RequestDispatcher, {
            /**
             * This member attribute is where the resources are located for this
             * dispatcher
             *
             * @type {String}
             * @instance
             *
             * @see module:elenajs/dispatchers/FSDispatcher#matcher
             */
            path: null,
            _render: fileRenderer.render,
            constructor: declare.superCall(function (sup) {
                return function () {
                    var args = Array.prototype.slice.call(arguments);
                    this._render = fileRenderer.render;
                    sup.apply(this, args);
                }
            }),
            /**
             * Used inside the {@link module:/elenajs/sipatchers/FSDisplatcher#render|render} method, it resolves the asked resources replacing the matcher with
             * the path attribute.
             *
             * @param {http.ClientRequest} req The HTTP request passed by the elenajs framework.
             * @returns {String}
             *
             * @instance
             */
            findResource: function (req) {
                var matcher = this.matcher;
                if (matcher instanceof RegExp && this.path) {
                    var pathname = url.parse(req.url).pathname,
                        relpath = pathname.replace(matcher, "");
                    return path.join(this.path, relpath);
                } else {
                    throw new TypeError("matcher not a RegExp");
                }

            },


            /**
             * This method uses an instance of {@link module:elenajs/renderers/FileRenderer}
             * to render a requested resource.<br>
             * {@link module:elenajs/renderers/FileRenderer#render|FileRenderer.render} method is a non
             * blocking method and it can handle 404 status messages for not found resources and
             * 302 not modified status messages.
             *
             * @param {module:elenajs/HttpContext} httpContext This is the context that is passed
             * at the beginning of the dispatch process.
             *
             * @instance
             */
            render: function (httpContext) {
                var resource = this.findResource(httpContext.httpRequest);
                this._render(httpContext, {filename: resource});
            }
        });
    return FSDispatcher;
});
