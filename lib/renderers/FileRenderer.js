define([
    "dojo/_base/declare",
    "./Renderer",
    "setten/dfs",
    "dojo/node!mimetype"
], function(declare,
        Renderer,
        dfs,
        mimetype
        ) {

    var FileRenderer = declare("elenajs.renderers.FileRenderer", [Renderer], {
        filename: null,
        mimetype: null,
        render: function() {
            var mime = this.mimetype || mimetype.lookup(this.filename);
            var self = this;
            dfs.stat(this.filename).then(
                    function(stat) {
                        var res = self.response,
                                req = self.request,
                                fileStream = dfs.createReadStream(self.filename),
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
                            try {
                                fileStream.pipe(res);                                
                            } catch (e) {
                                self.signal(500,e);
                            }
                        }

                    },
                    function(err) {
                        console.error(err);
                        self.signal(500, err);
                    }
            );
        }
    });
    return FileRenderer;
});
