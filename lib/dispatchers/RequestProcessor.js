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
        processRequest: function(req, res, deferredPointer) {
            var self = this,
                    method = req.method,
                    requestData = {};

            if (method.search(/^post$|^put$/i) === 0) {
                var _form = new formidable.IncomingForm(),
                        addFieldValue = function(name, value) {
                            if (requestData[name] === undefined) {
                                requestData[name] = value;
                            } else {
                                requestData[name] = [].concat(requestData[name], value);
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
                    self._cleanupFormData(req, res, requestData);
                });
                _form.on('end', function() {
                    deferredPointer.resolve(requestData);
                });
                _form.on('aborted', function(err) {
                    res.statusCode = 299;
                    deferredPointer.reject(err);
                    self._cleanupFormData(req, res, requestData);
                });
                _form.on('error', function(err) {
                    deferredPointer.reject(err);
                    self._cleanupFormData(req, res, requestData);
                });
                _form.parse(req);
            } else {
                requestData = url.parse(req.url, true).query;
                deferredPointer.resolve(requestData);
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
        _cleanupFormData: function(req, res, requestData) {
            if (req.method.search(/^post$|^put$/i) === 0) {
                var File = formidable.File,
                        self = this;
                for (var key in requestData) {
                    var value = requestData[key];
                    if (value instanceof Array) {
                        value.forEach(function(item) {
                            if (item instanceof File) {
                                if (item.path !== undefined) {
                                    self._deleteTmpFile(req, res, item.path);
                                }
                            }
                        });
                    } else {
                        if (value.path !== undefined) {
                            self._deleteTmpFile(req, res, value.path);
                        }
                    }
                }
            }
        }
    });
    return PageRenderer;
});
