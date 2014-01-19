define(["dojo/node!http",
    "dojo/_base/declare",
    "require",
    "./dispatchers/_Dispatcher",
    "./dispatchers/FSDispatcher",
    "./_ErrorRendererMixin",
    "dojo/node!path"
], function(http,
        declare,
        require,
        _Dispatcher,
        FSDispatcher,
        _ErrorRendererMixin,
        path
        ) {


    /**
     * This is the interface class for user related modules
     * @constructor
     * @exports elenajs/Server
     */
    var Server = declare("elenajs.Server", [_Dispatcher, _ErrorRendererMixin], {
        /**
         * The port where this server will listen
         * @default 3030
         * @type {!int}
         */
        port: 3030,
        _sockets: [],
        _server: null,
        _deafaultResourcesDispatcher: null,
        postscript: function() {
            this.inherited(arguments);
            var resourcesUrl = require.toUrl("elenajs", "resources");

            this._deafaultResourcesDispatcher = new FSDispatcher({
                matcher: /^\//,
                path: resourcesUrl
            });
        },
        _dispatchersGetter: function() {
            return [].concat(this.dispatchers, this._deafaultResourcesDispatcher);
        },
        /**
         * This function starts the http server
         * @type function
         */
        start: function() {
            var self = this;
            this._server = http.createServer(
                    function(req, res) {
                        self.serveRequest(req, res);
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
        /**
         * This function stops the http server
         * @type function
         */
        stop: function() {
            if (this._server) {
                this._server.close();
            }
        },
        serveRequest: function(req, res) {
            var self = this;
            req.parameters = {};
            req.httpServer = self;
            var deferredDispatch;
            req.on('end', function() {
                self.emit('request', {request: req, response: res});
            });
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
    });
    return Server;
});
