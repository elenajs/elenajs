define(["dojo/node!http",
    "dojo/_base/declare",
    "./_Router"
], function(http,
        declare,
        _Router
        ) {
    var Server = declare("elenajs.Server", [_Router], {
        port: 3030,
        _server: null,
        start: function() {            
            this._server = http.createServer(this.dispatch).listen(this.port);
            console.log('Server running on port ' + this.port);
        }
    });
    return Server;
});
