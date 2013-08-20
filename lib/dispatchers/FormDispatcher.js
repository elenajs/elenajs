define([
    "dojo/_base/declare",
    "./RequestDispatcher",
    "dojo/node!formidable",
    "dojo/Evented",
    "dojo/Deferred",
    "dojo/promise/Promise",
    "setten/dfs"
], function(declare,
        RequestDispatcher,
        formidable,
        Evented,
        Deferred,
        Promise,
        dfs
        ) {
    var FormDispatcher = declare("elenajs.dispatchers.FormDispatcher", [RequestDispatcher, Evented], {
        processRequest: function(req) {
            var requestData = {},
                    _form = new formidable.IncomingForm(),
                    dfd = new Deferred();
            _form.on('field', function(name, value) {
                dfd.progress({field: name, value: value});
                if (requestData[name] === undefined) {
                    requestData[name] = value;
                } else {
                    requestData[name] = [].concat(requestData[name], value);
                }
            });
            _form.on('file', function(name, value) {
                dfd.progress({field: name, value: value});
                if (requestData[name] === undefined) {
                    requestData[name] = value;
                } else {
                    requestData[name] = [].concat(requestData[name], value);
                }
            });
            _form.on('end', function() {
                dfd.resolve(requestData);
            });
            _form.on('aborted', function() {
                dfd.reject({reason: 'aborted', requestData: requestData});
            });
            _form.on('error', function() {
                dfd.reject({reason: 'error', requestData: requestData});
            });
            return dfd.promise;
        },
        _deleteTmpFile: function(path) {
            dfs.exists(path).then(function(exists) {
                if (exists) {
                    dfs.unlink(path).then(
                            function() {
                            },
                            function(err) {
                                console.log(err);
                            }
                    );
                }
            });
        },
        cleanupFormData: function(requestData) {
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
        },
        dispatch: function(req, res) {
            var self = this;
            this.processRequest(req, res).then(
                    function(requestData) {
                        try {
                            var result = self.render(req, res, requestData);
                            if (result instanceof Promise) {
                                result.then(function() {
                                    self.cleanupFormData(requestData);
                                });
                            } else {
                                self.cleanupFormData(requestData);
                            }
                        } catch (err) {
                            self.signal(req, res, 500, err);
                        }
                    },
                    function(error) {
                        self.signal(req, res, 500, error.reason);
                        self.cleanupFormData(error.requestData);
                    },
                    function(progress) {
                        self.emit('data', progress);
                    });
        },
        render: function(req, res, requestData) {
            throw "this is an abstract method";
        }
    });
    return FormDispatcher;
});
