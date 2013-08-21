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
            var self = this;
           
            this._server = http.createServer(
                    function (req, res) {
                        self.dispatch(req, res);
                    }
            ).listen(this.port);
            console.log('Server running on port ' + this.port);
        },
        stop: function() {
            this._server && this._server.close();
            console.log('Server stopped');            
        }
    });
    return Server;
});
