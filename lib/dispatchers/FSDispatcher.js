define([
    "dojo/_base/declare",
    "./RequestDispatcher",
    "../renderers/FileRenderer",
    "dojo/node!path"
], function(declare,
        RequestDispatcher,
        FileRenderer,
        path) {
    var FSDispatcher = declare("elenajs.dispatchers.FSDispatcher", [RequestDispatcher], {
        matcher: /^.*/,
        path: null,
        findResource: function(req) {
            var matcher = this.matcher;
            if (matcher instanceof RegExp && this.path) {
                var relpath = req.url.replace(matcher, "").replace(/\?.*/, "").replace(/\#.*/, "");
                return path.join(this.path, relpath);
            } else {
                throw new TypeError("matcher not a RegExp");
            }

        },
        render: function(deferredPointer) {
            var resource = this.findResource(deferredPointer.httpRequest);
            new FileRenderer({
                httpDeferred: deferredPointer,
                filename: resource,
                deferred: deferredPointer
            }).render();
        }
    });
    return FSDispatcher;
});
