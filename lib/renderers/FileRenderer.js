define([
    "../declare",
    "./Renderer",
    "../fs/dfs",
    "../node!mimetype"
], function(declare,
        Renderer,
        dfs,
        mimetype
        ) {

    /**
     * Module that retuns a class to render files static resources.<br>
     * This module is able to geuss file mime types and can return a 304
     * response of unmodified resources.
     *
     * @mixes module:elenajs/renderers/Renderer
     *
     * @module elenajs/renderers/FileRenderer
     *
     */
    var FileRenderer = declare("elenajs.renderers.FileRenderer", Renderer, {
        
        /**
         * This is the function that is in charge of rendering a response.
         * Since it's abstreact every derived module must implement it.
         *
         * @param {!elenajs.HttpContext}
         * @param {!Object} params An object with filename and mimetype(optional) keys
         * @returns {undefined}
         */
        render: function(httpContext, params) {
            var self = this,
                filename = params.filename,
                mime = params.mimetype || mimetype.lookup(filename),            
                req = httpContext.httpRequest,
                res = httpContext.httpResponse;
            try {
                dfs.stat(filename).then(
                        function(stat) {
                            try {
                                if (stat.isDirectory()) {
                                    httpContext.signal(
                                            filename + " is a directory");
                                }
                                else {
                                    var fileStream = dfs.createReadStream(filename),
                                            etag = stat.size.toString(16) + '-' + Date.parse(stat.mtime).toString(16);
                                    if (req.headers['if-none-match'] === etag) {
                                        res.writeHead(304, {
                                            'Content-Length': 0
                                        });
                                        res.end();
                                    } else {
                                        var head = {
                                            'Content-Length': stat.size,
                                            'Content-Type': mime,
                                            'ETag': etag
                                        };
                                        res.writeHead(200, head);

                                        fileStream.pipe(res);

                                    }
                                }
                            } catch (err) {
                                httpContext.signal(err);
                            }
                        },
                        function(err) {
                            httpContext.signal(err, 404);
                        }
                );
            } catch (err) {
                httpContext.signal(err);
            }
        }
    });
    return FileRenderer;
});
