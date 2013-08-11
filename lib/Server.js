define(["dojo/node!http",
    "./renderers/HttpErrorsRenderer",
    "dojo/Stateful",
    "./promise/sync",
    "dojo/_base/declare",
    "dojo/_base/array"
], function(http,
        ErrorRenderer,
        Stateful,
        sync,
        declare,
        array
        ) {
    var Server = declare("elenajs.Server", [Stateful], {
        port: 3030,
        dispatchers: [],
        _server: null,
        start: function() {
            var dispatchers = this.dispatchers;

            this._server = http.createServer(function(req, res) {
                //var currDispatcher;
                var _rendererParams = {
                    request: req,
                    response: res
                };
                var Error = declare([ErrorRenderer], _rendererParams);
                
                var signal = function(code, log) {
                    log && console.log(log);
                    var r = new Error({statusCode: code});
                    r.render();
                };

                var matchers = [];
                
                array.forEach(dispatchers, function(dispatcher) {
                    matchers.push(function () {
                       return dispatcher.match(req); 
                    });
                });

                sync(matchers, function (dispatcher) {return dispatcher;}).then(function (dispatcher) {
                    if (dispatcher) {
                        dispatcher.dispatch(req, res);
                    } else {
                        signal(404);
                    }
                }, function (err) {
                   signal(500, err); 
                });
                
            }).listen(this.port);
            console.log('Server running on port ' + this.port);
        }
    });
    return Server;
});
