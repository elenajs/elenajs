define(["dojo/_base/declare",
    "./RequestDispatcher",
    "elenajs/renderers/FileRenderer",
    "elenajs/renderers/HttpErrorsRenderer",
    "dojo/node!path",
    "setten/dfs"
], function(declare,
        RequestDispatcher,
        FileRenderer,
        HttpErrorsRenderer,
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
            var _rendererParams = {
                request: req,
                response: res
            };
            
            
            var Renderer = declare([FileRenderer], _rendererParams),
                Error = declare([HttpErrorsRenderer], _rendererParams);
            
            var signal = function(code, log) {
                log && console.log(log);
                (new Error({statusCode: code})).render()
            };
            try {
            var resource = this.findResource(req);
            console.log(resource);
            dfs.exists(resource).then(function(present) {                
                if (present) {
                    (new Renderer({filename: resource})).render();
                } else {
                    signal(404);
                }
            }, function(err) {
                signal(500, err);
            });
            } catch (e) {
                signal(500, e); 
            }
        }
    });
    return FSDispatcher;
});
