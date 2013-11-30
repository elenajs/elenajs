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

    var FileRenderer = declare("elenajs.renderers.FileRenderer", [Renderer], {
        filename: null,
        mimetype: null,
        render: function() {
            var mime = this.mimetype || mimetype.lookup(this.filename);
            var self = this;
            try {
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
                                console.log('000000000000000', stat.mode);
                                fileStream.on('error', function (err) {
                                    self.signal(500,err);
                                })
                                
                                fileStream.pipe(res);             
                            } catch (e) {
                                self.signal(500,e);
                            }
                        }

                    },
                    function(err) {
                        self.signal(500, err);
                    }
            );
        }
        catch (e1) {
            console.log(e1);
        }
        }
    });
    return FileRenderer;
});
