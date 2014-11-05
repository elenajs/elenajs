define([
    "../declare",
    "../_base/Mixin"
], function(
        declare,
        Mixin
        ) {

    function throwAbstract() {
        throw new TypeError("abstract");
    }

    /**
     * Module returning the abstract class to create for a renderer object.<br>
     * Renderer is the last
     * link of the dispatcher chain.
     *
     * @mixes http://dojotoolkit.org/api/1.9/dojo/Stateful.html
     *
     * @module elenajs/renderers/Renderer
     *
     */
    var Renderer = declare("elenajs.renderers.Renderer", Mixin, {
        /**
         * While dispatchers are services, renderers are request scoped so the
         * http deferred object is used to interact with the HTTP request and response
         * @type {!elenajs.HttpContext}
         * @instance
         */
        httpContext: null,
        /**
         * This is the function that is in charge of rendering a response.
         * Since it's abstreact every derived module must implement it.
         *
         * @param {!Object} params The context object
         * @returns {undefined}
         */
        render: function(params) {
            throwAbstract();
        }
    });
    return Renderer;
});
