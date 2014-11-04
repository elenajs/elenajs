define([
    "../declare",
    "dojo/_base/lang",
    "../_base/Mixin",
    "../fs/dfs",
    "dojo/node!formidable",
    "dojo/node!url"
], function(declare,
        lang,
        Mixin,
        dfs,
        formidable,
        url
        ) {
    /**
     * Module returning _RequestProcessor class.<br>
     * This class is the base class for Request dispatcher services and
     * holds the logic to handle and parse request parameters.<br>
     *
     * @module elenajs/dispatchers/_RequestProcessor
     *
     * @mixes http://dojotoolkit.org/api/1.9/dojo/Stateful.html
     *
     */
    var _RequestProcessor = declare("elenajs.dispatchers._RequestProcessor", Mixin, {
        /**
         * _RequestProcessor is based on {@link https://github.com/felixge/node-formidable|formidable}, refer to
         * its documentation if you want to set properties different from the default ones
         * (for example uploadDir or encoding).
         * @default {}
         * @type {!Object}
         * @instance
         */
        options: {},
        _serverSignal: function(req, res, err) {
            req.httpServer.emit('error', {request: req, response: res, error: err});
        },
        /**
         * This method is used to serve an HTTP request and collect all request parameters
         * into the {@link module:elenajs/HttpDeferred#requestData}.
         * These parsed parameters are resolved by the deferred object.<br>
         * If a parameter appears more then once, the value is transformed into an array.<br>
         * If the request is a multipart/form-data when the response is served, the module
         * will take care of cleaning data.<br>
         * When the request method is GET request parameters coincide with the one
         * obetained parsing the request URL.
         *
         * @param {elenajs/HttpDeferred} httpDeferredContext The instance of the HttpDeferred object
         * thet ElenaJs server creates when a HTTP request arrives.
         *
         * @returns {elenajs/HttpDeferred} returns the httpDeferredContext passed as parameter
         *
         * @instance
         *
         * @example
         *
         * define([
         *     "dojo/_base/declare",
         *     "dojo/_base/lang",
         *     "elenajs/dispatchers/RequestDispatcher",
         *     "elenajs/renderers/TemplateRenderer",
         *     "elenajs/http/swig!./templates/Page3.html"
         * ], function(
         *         declare,
         *         lang,
         *         RequestDispatcher,
         *         TemplateRenderer,
         *         template
         *         ) {
         *     return declare('demo/dispatchers/Page3', RequestDispatcher, {
         *         matcher: /^\/pages\/page3.html$/i,
         *         title: 'Page 3',
         *         render: function(requestContext) {
         *             var self = this;
         *             var renderer = new TemplateRenderer({
         *                     httpDeferred: requestContext,
         *                     templateObj: template
         *                 });
         *             this.processRequest(requestContext).then(function(data) {
         *                 renderer.render(lang.mixin({}, data, self));
         *             }, function(err) {
         *                 if (!requestContext.isFulfilled()) {
         *                     requestContext.reject(err);
         *                 }
         *             });
         *         }
         *     });
         * });
         */
        processRequest: function(httpDeferredContext) {
            var self = this,
                    req = httpDeferredContext.httpRequest,
                    res = httpDeferredContext.httpResponse,
                    method = req.method,
                    requestData = httpDeferredContext.requestData;

            if (method.search(/^post$|^put$/i) === 0) {
                var _form = new formidable.IncomingForm(),
                        addFieldValue = function(name, value) {
                            if (requestData[name] === undefined) {
                                requestData[name] = value;
                            } else {
                                requestData[name] = [].concat(requestData[name], value);
                            }
                        };

                lang.mixin(_form, self.options);
                _form.on('progress', function(bytesReceived, bytesExpected) {
                    httpDeferredContext.progress({request: req, response: res,
                        data: {bytesReceived: bytesReceived, bytesExpected: bytesExpected}});
                });
                _form.on('field', function(name, value) {
                    addFieldValue(name, value);
                });
                _form.on('file', function(name, value) {
                    addFieldValue(name, value);
                });

                res.once('finish', function() {
                    self._cleanupFormData(req, res);
                });
                _form.on('end', function() {
                    httpDeferredContext.resolve(requestData);
                });
                _form.on('aborted', function(err) {
                    res.statusCode = 299;
                    httpDeferredContext.reject(err);
                    self._cleanupFormData(req, res);
                });
                _form.on('error', function(err) {
                    httpDeferredContext.reject(err);
                    self._cleanupFormData(req, res);
                });
                _form.parse(req);
            } else {
                requestData = url.parse(req.url, true).query;
                httpDeferredContext.resolve(requestData);
            }
            return httpDeferredContext;
        },
        _deleteTmpFile: function(req, res, path) {
            var self = this;
            dfs.unlink(path).then(
                    function() {
                    },
                    function(err) {
                        self._serverSignal(req, res, err);
                    }
            );
        },
        _cleanupFormData: function(req, res) {
            if (req.method.search(/^post$|^put$/i) === 0) {
                var File = formidable.File,
                        requestData = req.requestData,
                        self = this;

                for (var key in requestData) {
                    var value = requestData[key];

                    if (value instanceof Array) {
                        value.forEach(function(item) {
                            if (typeof item !== 'string' && item instanceof File) {
                                self._deleteTmpFile(req, res, item.path);
                            }
                        });
                    } else {
                        if (typeof value !== 'string' && value instanceof File) {
                            self._deleteTmpFile(req, res, value.path);
                        }
                    }
                }
            }
        }
    });
    return _RequestProcessor;
});
