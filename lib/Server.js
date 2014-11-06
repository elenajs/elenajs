define(["dojo/node!http",
    "./declare",
    "require",
    "./dispatchers/_Dispatcher",
    "./dispatchers/FSDispatcher",
    "./HttpContext",
    "./renderers/HttpErrorsRenderer",
    "./watch",
    "dojo/topic",
    "dojo/Evented"
], function (http, declare, require, _Dispatcher, FSDispatcher, HttpContext, ErrorRenderer, watch, topic, Evented) {

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
            constructor: function () {
                var resourcesUrl = require.toUrl("./resources");
                this._deafaultResourcesDispatcher = new FSDispatcher({
                    matcher: /^\//,
                    path: resourcesUrl
                });
                var self = this;
                topic.subscribe('error', function (event) {
                    self.onHttpError(event);
                });
            },
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
                server.listen(this.port);
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
                    this._server.close();
                }
            },
            onHttpError: function (event) {
                var request = event.target.httpRequest,
                    response = event.target.httpResponse,
                    code = event.status,
                    error = event.error;
                this.emit('error', {
                    request: request,
                    response: response,
                    statusCode: code,
                    error: error
                });                
                this.errorsRenderer.render({statusCode: code});
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
                try {
                    var httpContext = new HttpContext({
                        httpRequest: req,
                        httpResponse: res,
                        server: self
                    });
                    self.dispatch(httpContext);
                    
                } catch (err) {
                    self.emit('error', {request: req, response: res, error: err});
                }
            }
        },
        {
            dispatchers: {
                get: function () {
                    return [].concat(this._dispatchers, this._deafaultResourcesDispatcher);
                },
                set: function(value) {
                    this._dispatchers = value;
                }
            }
        });
    return Server;
});
