define([
    "dojo/_base/declare",
    "./Renderer",
    "../fs/dfs",
    "dojo/node!mimetype"
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
    var FileRenderer = declare("elenajs.renderers.FileRenderer", [Renderer], {
        filename: null,
        /**
         * Overrides default mimetype gussing capabilities if not null
         * @default null
         * @type {!string}
         * @instance
         */
        mimetype: null,
        render: function() {
            var mime = this.mimetype || mimetype.lookup(this.filename);
            var self = this,
                    req = this.httpDeferred.get('httpRequest'),
                    res = this.httpDeferred.get('httpResponse');
            try {
                dfs.stat(this.filename).then(
                        function(stat) {
                            try {
                                if (stat.isDirectory()) {
                                    self.httpDeferred.signal(
                                            self.filename + " is a directory");
                                }
                                else {
                                    var fileStream = dfs.createReadStream(self.filename),
                                            etag = stat.size.toString(16) + '-' + Date.parse(stat.mtime).toString(16);
                                    if (req.headers['if-none-match'] === etag) {
                                        res.writeHead(304, {
                                            'Last-Modified': stat.mtime
                                        });
                                        res.end();
                                    } else {
                                        var head = {
                                            'Last-Modified': stat.mtime,
                                            'Content-Length': stat.size,
                                            'Content-Type': mime,
                                            'ETag': etag
                                        };
                                        res.writeHead(200, head);

                                        fileStream.pipe(res);

                                    }
                                }
                            } catch (err) {
                                self.httpDeferred.signal(err);
                            }
                        },
                        function(err) {
                            self.httpDeferred.signal(err, 404);
                        }
                );
            } catch (err) {
                self.httpDeferred.signal(err);
            }
        }
    });
    return FileRenderer;
});
