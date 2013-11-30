define([
    "dojo/_base/declare",
    "./RequestDispatcher",
    "../renderers/FileRenderer",
    "dojo/node!path",
    "../fs/dfs"
], function(declare,
        RequestDispatcher,
        FileRenderer,
        path,
        dfs) {
    var FSDispatcher = declare("elenajs.dispatchers.FSDispatcher", [RequestDispatcher], {
        path: null,
        findResource: function(req) {
            var matcher = this.matcher;
            if (matcher instanceof RegExp && this.path) {
                var relpath = req.url.replace(matcher, "");
                console.log('relpath', relpath);

                return path.join(this.path, relpath);
            } else {
                throw "matcher not a RegExp";
            }

        },
        dispatch: function(req, res) {
            var self = this;

            try {
                var resource = this.findResource(req);
                console.log(resource);
                dfs.exists(resource).then(function(present) {
                    console.debug(000000, present, resource);
                    if (present) {
                        (new FileRenderer({
                            request: req,
                            response: res,
                            filename: resource
                        })).render();
                    } else {
                        console.debug(111111);
                        self.signal(req, res, 404);
                    }
                }, function(err) {
                    console.debug(222222);
                    self.signal(req, res, 500, err);
                });
            } catch (e) {
                console.debug(3333333);
                self.signal(req, res, 500, e);
            }
        }
    });
    return FSDispatcher;
});
