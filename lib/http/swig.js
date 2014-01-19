define([
    "dojo/node!path",
    "dojo/node!swig",
    "dojo/Deferred",
    "dojo/node!fs"
], function(path, swig, Deferred, fs) {
    var cache = {};
//    swig.setDefaults({ cache: false });
    var SwigTemplate = function(url) {
        var self = this;
        this.modified = new Date();
        this.template = swig.compileFile(url);
        
        this.render = function(params) {
            var deferred = new Deferred();
            try {
                var output = this.template(params);
                deferred.resolve(output);
            } catch (err) {
                deferred.reject(err);
            }
            return deferred;
        };
    };
    return {
        module: 'swig',
        load: function(id, require, load) {
            var parts = id.split("!"),
                    url = path.resolve(require.toUrl(parts[0])),
                    result;

            if (url in cache) {
                result = cache[url];
            } else {

                try {
                    result = new SwigTemplate(url);
                    cache[url] = result;
                } catch (err) {
                    console.error("rendering: " + url, err);
                }
            }

            load(result);
        }
    };
});
