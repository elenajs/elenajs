define([
    "dojo/node!path",
    "dojo/node!swig",
    "dojo/Deferred",
    "dojo/node!fs"
], function(path, swig, Deferred, fs) {
    var cache = {};
    return {
        module: 'swig',
        load: function(id, require, load) {
            var parts = id.split("!"),
                    url = path.resolve(require.toUrl(parts[0])),
                    options = {},
                    result;

            if (url in cache) {
                result = cache[url];
            } else {

                try {
                    var template = swig.compileFile(url, options);

                    result = {
                        template: template,
                        render: function(params) {
                            var deferred = new Deferred();
                            try {
                                var output = this.template(params);
                                deferred.resolve(output);
                            } catch (err) {
                                deferred.reject(err);
                            }
                            return deferred;
                        }
                    };
                    cache[url] = result;
                } catch (err) {
                    console.error("rendering: " + url, err);
                }
            }
//            fs.watchFile(url, function(curr) {
//                try {
//                    loadedResult.template = swig.compileFile(url, options);
//                } catch (err) {
//                    console.error(err);
//                }
//            });

            load(result);
        }
    };
});
