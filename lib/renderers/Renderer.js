define([
    "../declare",
    "../_base/Mixin",
    "../_base/_RequestProcessor"
], function(
    declare,
        Mixin,
        RequestProcessor
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
    var Renderer = declare("elenajs.renderers.Renderer", [Mixin. RequestProcessor], {
        /**
         * This is the function that is in charge of rendering a response.
         * Since it's abstreact every derived module must implement it.
         *
         * @param {!elenajs.HttpContext} the http context object.
         * @param {!Object} params Parameters for the render function 
         * @returns {undefined}
         */
        render: function(httpContext, params) {
            throwAbstract();
        }
    });
    return Renderer;
});
