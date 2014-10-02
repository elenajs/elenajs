define([
    "../declare",
    "./_Template",
    "dojo/string",
    "dojo/Deferred",
    "../fs/dfs",
    "../watch"
], function(
        declare,
        Template,
        string,
        Deferred,
        dfs,
        watch) {
    "use strict";

    /**
     * This module is the base class for elenajs templates.
     * Constructor accepts templateSrc as required parameter.
     * 
     * Implementor as to override compile and render methods
     *
     * @module elenajs/templates/SimpleTemplate
     *
     * @example new Template({ templateSrc: 'Hello {{name}}' });
     */
    var SimpleTemplate = declare("elenajs.templates.SimpleTemplate", Template, {
        _deferred: new Deferred(),
        compile: function(src) {
            var self = this;
            var resolve = function() {
                if (!self._deferred.isFulfilled()) {
                    self._deferred.resolve();
                }
            };
            dfs.stat(src).then(function(stats) {
                if (stats.isFile()) {
                    self.template = dfs.readFileSync(src, 'utf8');
                    resolve();
                    watch(src,
                            function() {
                                self.template = dfs.readFileSync(src, 'utf8');
                            },
                            function(err) {
                                console.error(err);
                            }
                    );
                } else {
                    self.template = src;
                    resolve();
                }
            }, function() {
                self.template = src;
                resolve();
            });


        },
        render: function(context) {
            var self = this;
            var deferred = new Deferred();
            var getResultString = function() {
                return string.substitute(
                        self.template,
                        context,
                        function(value) {
                            return value || "";
                        }
                );
            };
            try {
                if (this._deferred.isFulfilled()) {
                    deferred.resolve(getResultString());
                } else {
                    this._deferred.then(function() {
                        deferred.resolve(getResultString());
                    }, function(err) {
                        deferred.reject(err);
                    });
                }
            } catch (err) {
                deferred.reject(err);
            }
            return deferred;
        }

    });
    return SimpleTemplate;
});
