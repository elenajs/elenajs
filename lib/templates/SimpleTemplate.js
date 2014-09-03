define([
    "dojo/_base/declare",
    "./_Template",
    "dojo/string",
    "dojo/Deferred"
], function(declare, Template, string, Deferred) {
    "use strict";

    /**
     * This module is the base class for elenajs templates.
     * Constructor accepts templateSrc as required parameter.
     * 
     * Implementor as to override compile and render methods
     *
     * @module elenajs/templates/SimpleTemplate
     *
     * @example new Template({ templateSrc: 'Hello {{name}}' });
     */
    var SimpleTemplate = declare("elenajs.templates.SimpleTemplate", Template, {
        render: function(context) {
            var deferred = new Deferred();
            try {
                var resultString = string.substitute(
                        this.template,
                        context,
                        function(value) {
                            return value || "";
                        }
                );

                deferred.resolve(resultString);

            } catch (err) {
                deferred.reject(err);
            }
            return deferred;
        }
    });

    return SimpleTemplate;
});
