define([
    "dojo/_base/declare"
], function(declare) {
    "use strict";

    function throwAbstract() {
        throw new TypeError("abstract");
    }
    /**
     * This module is the base class for elenajs templates.
     * Constructor accepts templateSrc as required parameter.
     * 
     * Implementor as to override compile and render methods.
     * This module is abstract
     *
     * @module elenajs/_base/_Template
     *
     */
    var Template = declare("elenajs.templates._Template", null, {
        template: null,
        constructor: function(params) {
            this.compile(params.templateSrc);
        },
        /**
         * This method sets the template to be rendered from the source string.
         *
         * @param src {string} The template source.
         * @instance
         */
        compile: function(src) {
            this.template = src;
        },
        /**
         * This abstrct method will return a Deferred object. If resolved the 
         * callback will receive the rendered template as a string.
         *
         * @param context {Object} The template context that holds attributes used 
         * during the rendering phase.
         * @instance
         */
        render: function(context) {
            throwAbstract();
        }
    });

    return Template;
});