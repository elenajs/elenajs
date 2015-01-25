define([
    "../declare",
    "dojo/_base/lang",
    "../_base/Mixin",
    "dojo/Deferred",
    "../fs/dfs",
    "../node!formidable",
    "../node!url"
], function(declare,
        lang,
        Mixin,
        Deferred,
        dfs,
        formidable,
        url
        ) {
    /**
     * Module returning _RequestProcessor class.<br>
     * This class is the base class for Request dispatcher services and
     * holds the logic to handle and parse request parameters.<br>
     * Url decomposition rules are defined here:
     * {@link http://sling.apache.org/documentation/the-sling-engine/url-decomposition.html}
     *
     * @module elenajs/_base/_RequestProcessor
     *
     * @mixes http://dojotoolkit.org/api/1.9/dojo/Stateful.html
     *
     */
    var _RequestProcessor = declare("elenajs._base._RequestProcessor", Mixin, {
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
         * into the {@link module:elenajs/HttpContext#requestData}.
         * These parsed parameters are resolved by the deferred object.<br>
         * If a parameter appears more then once, the value is transformed into an array.<br>
         * If the request is a multipart/form-data when the response is served, the module
         * will take care of cleaning data.<br>
         * When the request method is GET request parameters coincide with the one
         * obetained parsing the request URL.
         *
         * @param {elenajs/HttpContext} httpContext The instance of the HttpContext object
         * thet ElenaJs server creates when a HTTP request arrives.
         *
         * @returns {elenajs/HttpContext} returns the httpContext passed as parameter
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
         *                     httpContext: requestContext,
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
        processRequest: function(httpContext) {
            var self = this,
                    server = httpContext.server,
                    req = httpContext.httpRequest,
                    res = httpContext.httpResponse,
                    method = req.method,
                    requestData = httpContext.requestData,
                    dfd = new Deferred();
            if (requestData && Object.keys(requestData).length > 0) {
                dfd.resolve(requestData);
            } else if (method.search(/^post$|^put$/i) === 0) {
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
                    dfd.progress({request: req, response: res,
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
                    server.emit('access', {request: req, response: res, data: requestData});
                    dfd.resolve(requestData);
                });
                _form.on('aborted', function(err) {
                    res.statusCode = 299;
                    dfd.reject(err);
                    server.emit('error', {request: req, response: res, error: err});
                    self._cleanupFormData(req, res);
                });
                _form.on('error', function(err) {
                    dfd.reject(err);
                    server.emit('error', {request: req, response: res, error: err});
                    self._cleanupFormData(req, res);
                });
                _form.parse(req);
            } else {
                requestData = url.parse(req.url, true).query;
                dfd.resolve(requestData);
                server.emit('access', {request: req, response: res, data: requestData});
            }
            return dfd;
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
        },
        /**
         * This method returns the resource path.
         *
         * @param req {http.ClientRequest} Http request object passed during http control flow (usually extracted from
         * requestContext).
         * @returns Returns the resourcePath String
         *
         * @instance
         */
        getResourcePath: function(req){
            if (!req.__resourcePath) {

                var pathname = url.parse(req.url).pathname;
                req.__resourcePath = pathname.split('.')[0];
            }
            return req.__resourcePath;
        },
        _resourceSelectorsAndExtension: function(req){
            if (req.__extension === undefined) {
                var resourcePath = this.getResourcePath(req),
                    selectorsAndExtension = url.parse(req.url).pathname.substr(resourcePath.length);

                if (!selectorsAndExtension.indexOf('.') !== 0) {
                    req.__extension = null;
                    req.__selectors = [];
                } else {
                    var selectorsAndExtensionArr = selectorsAndExtension.replace(/^(\.)([^\/]+)(.*)/, '$2').split('.');
                    req.__extension = selectorsAndExtensionArr.pop();
                    req.__selectors = selectorsAndExtensionArr;
                }
            }
        },
        /**
         * This method returns the extension of the resource.
         *
         * @param req {http.ClientRequest} Http request object passed during http control flow (usually extracted from
         * requestContext).
         * @returns Returns the extension of the resource. When no extension is defined result is undefined
         *
         * @instance
         */
        getResourceExtension: function(req){
            this._resourceSelectorsAndExtension(req);
            return req.__extension;
        },
        /**
         * This method returns the list of req path selectors.
         *
         * @param req {http.ClientRequest} Http request object passed during http control flow (usually extracted from
         * requestContext).
         * @returns Returns an array of selectors or an empty array when no selector is defined
         *
         * @instance
         */
        getRequestSelectors: function(req){
            this._resourceSelectorsAndExtension(req);
            return req.__selectors;
        },
        /**
         * This method returns the list of req path suffix.
         *
         * @param req {http.ClientRequest} Http request object passed during http control flow (usually extracted from
         * requestContext).
         * @returns Returns the request path suffix if present or null.
         *
         * @instance
         */
        getRequestSuffix: function(req){
            if (req.__suffix === undefined) {
                var resourcePath = this.getResourcePath(req),
                    restOfPath = url.parse(req.url).pathname.substr(resourcePath.length);
                 req.__suffix = /\//.test(restOfPath) && restOfPath.replace(/^([^\/]*)(.*)/, '$2');
            }
            return req.__suffix;
        }
    });
    return _RequestProcessor;
});
