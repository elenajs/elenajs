
define(["dojo/node!http",
    "dojo/_base/declare",
    "require",
    "./dispatchers/_Dispatcher",
    "./dispatchers/FSDispatcher",
    "./HttpDeferred",
    "./renderers/HttpErrorsRenderer",
    "./watch",
    "dojo/topic",
    "dojo/Evented"
], function(http,
        declare,
        require,
        _Dispatcher,
        FSDispatcher,
        HttpDeferred,
        ErrorRenderer,
        watch,
        topic,
        Evented
        ) {

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
                postscript: function() {
                    this.inherited(arguments);
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
                _dispatchersGetter: function() {
                    return [].concat(this.dispatchers, this._deafaultResourcesDispatcher);
                },
                /**
                 * Starts the http server
                 * @instance
                 */
                start: function() {
                    var self = this;
                    if (this._server) {
                        return;
                    }
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
                stop: function() {
                    if (this._server) {
                        this._server.close();
                    }
                },
                onHttpError: function(event) {
                    var request = event.target.httpRequest,
                            response = event.target.httpResponse,
                            code = event.status;
                    var r = new ErrorRenderer({
                        httpDeferred: new HttpDeferred({
                            httpRequest: request,
                            httpResponse: response}),
                        statusCode: code});
                    r.render();
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
                        var httpDeferredContext = new HttpDeferred({
                            httpRequest: req,
                            httpResponse: res});
                        self.dispatch(httpDeferredContext);
                        httpDeferredContext.then(
                                function(data) {
                                    self.emit('access', {request: req, response: res, data: data});
                                },
                                function(err) {
                                    self.emit('error', {request: req, response: res, error: err});
                                });
                    } catch (err) {
                        self.emit('error', {request: req, response: res, error: err});
                    }
                }
            });
    return Server;
});
