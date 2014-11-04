define([
    "../declare",
    "./Renderer",
], function(declare,
        Renderer
        ) {
    /**
     * Module returning a standard template Renderer.<br>
     *
     * @mixes elenajs/renderers/Renderer
     *
     * @module elenajs/renderers/TemplateRenderer
     * 
     * @example
     * define([
     *     "dojo/_base/declare",
     *     "elenajs/dispatchers/RequestDispatcher",
     *     "elenajs/renderers/TemplateRenderer",
     *     "elenajs/http/swig!./templates/Page1.html"
     * ], function(
     *         declare,
     *         RequestDispatcher,
     *         TemplateRenderer,
     *         template
     *         ) {
     *
     *
     *     return declare('demo/dispatchers/Page1', RequestDispatcher, {
     *         matcher: /^\/pages\/page1.html$/i,
     *         title: 'Page 1',
     *         render: function(requestContext) {
     *             var self = this;
     *             new TemplateRenderer({
     *                 httpDeferred: requestContext,
     *                 templateObj: template
     *             }).render(self);
     *         }
     *     });
     * });
     */
    var TemplateRenderer = declare("elenajs.renderers.TemplateRenderer", Renderer, {
        /**
         * The response mime-type
         * @default "text/html"
         * @type {!String}
         * @instance
         */
        mimetype: "text/html",
        /**
         * The template to be rendered
         * @type {!Function}
         * @instance
         */
        templateObj: null,
        render: function(params) {
            this._renderTemplate(params);
        },
        _renderTemplate: function(params) {

            var self = this,
                    res = this.httpDeferred.httpResponse;
            if (this.templateObj) {

                this.templateObj.render(params || this).then(
                        function(data) {
                            res.writeHead(res.statusCode, {
                                'Content-Type': self.mimetype
                            });
                            res.end(data);
                        },
                        function(err) {
                            self.httpDeferred.signal(err);
                        }
                );
            } else {
                self.httpDeferred.signal(new TypeError("No template defined"));
            }


        }
    });
    return TemplateRenderer;
});
