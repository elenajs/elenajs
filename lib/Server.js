define(["dojo/node!http",
    "dojo/_base/declare",
    "./_Router"
], function(http,
        declare,
        _Router
        ) {

    var Server = declare("elenajs.Server", [_Router], {
        port: 3030,
        _sockets: [],
        _server: null,
        start: function() {
            var self = this;
            this._server = http.createServer(
                    function(req, res) {
                        self.dispatch(req, res);
                    }
            );
            var server = this._server,
                    sockets = this._sockets;
            server.on('connection', function(socket) {
                sockets.push(socket);
                socket.setTimeout(4000);
                socket.on('close', function() {
                    console.log('socket closed');
                    sockets.splice(sockets.indexOf(socket), 1);
                });
            });

            server.on('close', function() {
                console.log('Server stopped!');
            });
            server.listen(this.port);
            console.log('Server running on port ' + this.port);
        },
        stop: function() {
            if (this._server) {
                this._server.close();
            }
        }
    });
    return Server;
});
