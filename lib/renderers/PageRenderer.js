define([
    "dojo/_base/declare",
    "./Renderer",
    "./TemplateRenderer",
    "../fs/dfs",
    "dojo/node!formidable",
    "dojo/node!url"
], function(declare,
        Renderer,
        TemplateRenderer,
        dfs,
        formidable,
        url
        ) {

    var PageRenderer = declare("elenajs.renderers.PageRenderer", [Renderer, TemplateRenderer], {
        _serverSignal: function(err) {
            var self = this;
            this.request.httpServer.signal('error', {request: self.request, response: self.response, error: err});
        },
        _processRequest: function() {
            var self = this,
                    req = this.request,
                    method = req.method,
                    requestData = self.requestData,
                    dfd = new Deferred();
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
                    dfd.progress({bytesReceived: bytesReceived, bytesExpected: bytesExpected});
                });
                _form.on('field', function(name, value) {
                    addFieldValue(name, value);
                });
                _form.on('file', function(name, value) {
                    addFieldValue(name, value);
                });
                _form.on('end', function() {
                    dfd.resolve();
                });
                _form.on('aborted', function() {
                    dfd.reject({reason: 'aborted', requestData: self.requestData});
                });
                _form.on('error', function() {
                    dfd.reject({reason: 'error', requestData: self.requestData});
                });
                _form.parse(req);
            } else {
                self.requestData = url.parse(req.url, true).query;
                dfd.resolve();
            }
            return dfd.promise;
        },
        _deleteTmpFile: function(path) {
            var self = this;
            dfs.unlink(path).then(
                    function() {
                    },
                    function(err) {
                        self._serverSignal(err);
                    }
            );
        },
        _cleanupFormData: function(requestData) {
            var File = formidable.File,
                    self = this;
            for (var key in requestData) {
                var value = requestData[key];
                if (value instanceof Array) {
                    value.forEach(function(item) {
                        if (item instanceof File) {
                            self._deleteTmpFile(item.path);
                        }
                    });
                } else {
                    self._deleteTmpFile(value.path);
                }
            }
        }

    });
    return PageRenderer;
});
