define([
    "dojo/_base/declare",
    "./Renderer",
    "../_ErrorRendererMixin",
    "../fs/dfs",
    "dojo/node!mimetype"
], function(declare,
        Renderer,
        _ErrorRendererMixin,
        dfs,
        mimetype
        ) {

    var FileRenderer = declare("elenajs.renderers.FileRenderer", [Renderer, _ErrorRendererMixin], {
        filename: null,
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
                                    self.handleError(self.httpDeferred, 500,
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
                                self.handleError(self.httpDeferred, 500, err);
                            }
                        },
                        function(err) {
                            self.handleError(self.httpDeferred, 404, err);
                        }
                );
            }
            catch (e1) {
                self.emit('error', {request: self.request, response: self.response, error: e1});
            }
        }
    });
    return FileRenderer;
});
