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
                        var deferredDispatch;
                        res.on('finish', function() {
                            if (deferredDispatch && !deferredDispatch.isFulfilled()) {
                                deferredDispatch.resolve({});
                            }
                        });
                        [res, req].forEach(function(emitter) {
                            emitter.on('error', function(err) {
                                if (deferredDispatch && !deferredDispatch.isFulfilled()) {
                                    deferredDispatch.reject(err);
                                }
                            });
                        });

                        try {
                            deferredDispatch = self.dispatch(req, res);
                            deferredDispatch.then(
                                    function(data) {
                                        self.emit('request', {request: req, response: res});
                                        return data;
                                    },
                                    function(err) {
                                        self.emit('error', {request: req, response: res, error: err});
                                        return err;
                                    });
                        } catch (err) {
                            self.emit('error', {request: req, response: res, error: err});
                        }
                    }
            );
            var server = this._server,
                    sockets = this._sockets;
            server.on('connection', function(socket) {
                sockets.push(socket);
                socket.setTimeout(4000);
                socket.on('close', function() {
                    self.emit('socketClose', {socket: socket});
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
