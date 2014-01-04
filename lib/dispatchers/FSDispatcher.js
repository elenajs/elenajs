define([
    "dojo/_base/declare",
    "dojo/Deferred",
    "./RequestDispatcher",
    "../renderers/FileRenderer",
    "dojo/node!path"
], function(declare,
        Deferred,
        RequestDispatcher,
        FileRenderer,
        path) {
    var FSDispatcher = declare("elenajs.dispatchers.FSDispatcher", [RequestDispatcher], {
        path: null,
        findResource: function(req) {
            var matcher = this.matcher;
            if (matcher instanceof RegExp && this.path) {
                var relpath = req.url.replace(matcher, "").replace(/\?.*/, "").replace(/\#.*/, "");

                return path.join(this.path, relpath);
            } else {
                throw "matcher not a RegExp";
            }

        },
        render: function(req, res, deferredPointer) {
            var resource = this.findResource(req);
            new FileRenderer({
                request: req,
                response: res,
                filename: resource,
                deferred: deferredPointer
            }).render();
        }
    });
    return FSDispatcher;
});
