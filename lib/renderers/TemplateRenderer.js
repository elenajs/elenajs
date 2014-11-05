define([
    "../declare",
    "./Renderer",
    "../node!crypto",
    "../node!url"
], function (
    declare,
    Renderer,
    crypto,
    url) {
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
         * Determine if the page is static and cacheable
         * @default false
         * @type {!boolean}
         * @instance
         */
        cacheable: false,
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
        render: function (params) {
            this._renderTemplate(params);
        },
        getEtag: function (pathname, data) {
            if (this._etag === undefined) {

                var md5sum = crypto.createHash('md5');
                md5sum.update(pathname + data);
                this._etag = md5sum.digest('hex');
            }
            return this._etag;
        },
        _renderTemplate: function (params) {

            var self = this,
                req = this.httpDeferred.httpRequest,
                res = this.httpDeferred.httpResponse;
            if (this.templateObj) {
                var parsedRequest = url.parse(req.url);
                this.templateObj.render(params || this).then(
                    function (data) {
                        if ((!self.cacheable || res.statusCode !== 200) &&
                            !parsedRequest.query) {
                            res.writeHead(res.statusCode, {
                                'Content-Type': self.mimetype,
                                'Content-Length': Buffer.byteLength(data, 'utf8')
                            });
                            res.end(data);
                        } else {
                            var etag = self.getEtag(parsedRequest.pathname, data);


                            if (req.headers['if-none-match'] === etag) {
                                res.writeHead(304, {
                                    'Content-Length': 0
                                });
                                res.end();
                            } else {
                                var head = {
                                    'Content-Type': self.mimetype,
                                    'Content-Length': Buffer.byteLength(data, 'utf8'),
                                    'ETag': etag
                                };
                                res.writeHead(200, head);
                                res.end(data);

                            }
                        }
                    },
                    function (err) {
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
