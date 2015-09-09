define(["./node!http",
    "./declare",
    "require",
    "./dispatchers/_Dispatcher",
    "./dispatchers/FSDispatcher",
    "./HttpContext",
    "./renderers/HttpErrorsRenderer",
    "./watch",
    "dojo/topic",
    "dojo/Evented"
], function (http,
             declare,
             require,
             _Dispatcher,
             FSDispatcher,
             HttpContext,
             ErrorRenderer,
             watch,
             topic,
             Evented) {

    /**
     * Module returning a class to create an ElenaJs server,
     * it's built around http nodejs module.
     * @module elenajs/Server
     * @mixes elenajs/dispatchers/_Dispatcher
     */
    var Server = declare("elenajs.Server", [_Dispatcher, Evented],
        {
            /**
             * The port where this server will listen
             * @default 3030
             * @type {!int}
             * @instance
             */
            port: 3030,
            bindAddress: '0.0.0.0',
            /**
             * When true templates will be recompiled when their source file changes
             * @default true
             * @type {!boolean}
             * @instance
             */
            watchingTemplate: true,
            _sockets: [],
            _server: null,
            _deafaultResourcesDispatcher: null,

            constructor: declare.superCall(function (sup) {
                return function () {
                    var self = this,
                        resourcesUrl = require.toUrl("./resources"),
                        args = Array.prototype.slice.call(arguments);
                    this._sockets = [];

                    this._deafaultResourcesDispatcher = new FSDispatcher({
                        matcher: /^\//,
                        path: resourcesUrl
                    });

                    sup.apply(this, args);

                    topic.subscribe('error', function (event) {
                        self.onHttpError(event);
                    });
                    ['SIGTERM', 'SIGINT', 'exit'].forEach(function (signal) {
                        process.on(signal, function () {
                            self.stop();
                        });
                    });
                };
            }),
            errorsRenderer: (new ErrorRenderer({})),
            /**
             * Starts the http server
             * @instance
             */
            start: function () {
                var self = this;
                if (this._server) {
                    return;
                }
                this._server = http.createServer(
                    function (req, res) {
                        self.serveRequest(req, res);
                    }
                );


                var server = this._server,
                    sockets = this._sockets;

                server.on('connection', function (socket) {
                    sockets.push(socket);
                    socket.setTimeout(4000);
                    socket.on('close', function () {
                        self.emit('socketClose', {socket: socket});
                        sockets.splice(sockets.indexOf(socket), 1);
                    });
                });

                server.on('close', function () {
                    self.emit('stop', {});
                    if (self.watchingTemplate) {
                        watch.stopWatching();
                    }
                });
                server.listen(this.port, this.bindAddress);
                self.emit('start', {});
                if (self.watchingTemplate) {
                    watch.startWatching();
                }
            },
            /**
             * Stops the http server
             * @instance
             */
            stop: function () {
                if (this._server) {
                    //toobusy.shutdown();
                    this._server.close();
                }
            },
            onHttpError: function (event) {
                var self = this,
                    request = event.target.httpRequest,
                    response = event.target.httpResponse,
                    code = event.status,
                    error = event.error;
                this.emit('error', {
                    request: request,
                    response: response,
                    statusCode: code,
                    error: error
                });

                var httpContext = new HttpContext({
                    httpRequest: request,
                    httpResponse: response,
                    server: self
                });
                this.errorsRenderer.render(httpContext, {
                    statusCode: code
                });
            },
            serveRequest: function (req, res) {
                var self = this;
                req.parameters = {};
                req.httpServer = self;
                var deferredDispatch;
                req.on('end', function () {
                    self.emit('request', {request: req, response: res});
                });
                res.on('finish', function () {
                    if (deferredDispatch && !deferredDispatch.isFulfilled()) {
                        deferredDispatch.resolve({});
                    }
                });

                [res, req].forEach(function (emitter) {
                    emitter.on('error', function (err) {
                        if (deferredDispatch && !deferredDispatch.isFulfilled()) {
                            deferredDispatch.reject(err);
                        }
                    });
                });
                var httpContext = new HttpContext({
                    httpRequest: req,
                    httpResponse: res,
                    server: self
                });
                try {
                    self.dispatch(httpContext);
                } catch (err) {
                    httpContext.signal(err);
                }
            }
        },
        {
            dispatchers: {
                get: function () {
                    return [].concat(this._dispatchers, this._deafaultResourcesDispatcher);
                }
            }
        });
    return Server;
});
