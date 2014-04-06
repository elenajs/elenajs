define([
    "dojo/_base/declare",
    "dojo/Stateful",
    "../fs/dfs",
    "dojo/node!formidable",
    "dojo/node!url"
], function(declare,
        Stateful,
        dfs,
        formidable,
        url
        ) {

    var PageRenderer = declare("elenajs.renderers.PageRenderer", [Stateful], {
        _serverSignal: function(req, res, err) {
            req.httpServer.emit('error', {request: req, response: res, error: err});
        },
        processRequest: function(deferredPointer) {
            var self = this,
                    req = deferredPointer.get('httpRequest'),
                    res = deferredPointer.get('httpResponse'),
                    method = req.method;
            req.requestData = {};
            if (method.search(/^post$|^put$/i) === 0) {
                var _form = new formidable.IncomingForm(),
                        addFieldValue = function(name, value) {
                            if (req.requestData[name] === undefined) {
                                req.requestData[name] = value;
                            } else {
                                req.requestData[name] = [].concat(req.requestData[name], value);
                            }
                        };

                _form.on('progress', function(bytesReceived, bytesExpected) {
                    deferredPointer.progress({request: req, response: res,
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
                    deferredPointer.resolve(req.requestData);
                });
                _form.on('aborted', function(err) {
                    res.statusCode = 299;
                    deferredPointer.reject(err);
                    self._cleanupFormData(req, res);
                });
                _form.on('error', function(err) {
                    deferredPointer.reject(err);
                    self._cleanupFormData(req, res);
                });
                _form.parse(req);
            } else {
                req.requestData = url.parse(req.url, true).query;
                deferredPointer.resolve(req.requestData);
            }
            return deferredPointer;
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
    return PageRenderer;
});
