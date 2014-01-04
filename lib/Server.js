define(["dojo/node!http",
    "dojo/_base/declare",
    "./dispatchers/_Dispatcher",
    "./_ErrorRendererMixin"
], function(http,
        declare,
        _Dispatcher,
        _ErrorRendererMixin
        ) {

    var Server = declare("elenajs.Server", [_Dispatcher, _ErrorRendererMixin], {
        port: 3030,
        _sockets: [],
        _server: null,
        start: function() {
            var self = this;
            this._server = http.createServer(
                    function(req, res) {
                        req.parameters = {};
                        req.httpServer = self;
                        res.on('finish', function() {
                            self.emit('request', {request: req, response: res});
                        });

                        self.dispatch(req, res).then(
                                function(data) {
                                },
                                function(data) {
                                    self.emit('error', data);
                                    return data;
                                });
                    }
            );
            var server = this._server,
                    sockets = this._sockets;
            server.on('connection', function(socket) {
                sockets.push(socket);
                socket.setTimeout(4000);
                socket.on('close', function() {
                    self.emit('socketClose', socket);
                    sockets.splice(sockets.indexOf(socket), 1);
                });
            });

            server.on('close', function() {
                self.emit('stop', {});
            });
            server.listen(this.port);
            self.emit('start', {});
        },
        stop: function() {
            if (this._server) {
                this._server.close();
            }
        }
    });
    return Server;
});
