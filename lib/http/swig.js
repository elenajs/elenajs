define([
    "dojo/node!path",
    "dojo/node!fs",
    "dojo/node!swig"
], function(path, fs, swig) {
    var cache = {};
    return {
        module: 'swig',
        load: function(id, require, load) {
            var parts = id.split("!"),
                    url = path.resolve(require.toUrl(parts[0])),
                    result;

            if (url in cache) {
                result = cache[url];
            } else {
                result = {
                    template: swig.compileFile(url),
                    render: function(params) {
                        template.render(params);
                    }
                }
                cache[url] = result;
            }
            fs.watchFile(url, function(curr) {
                try {
                    result.template = swig.compileFile(url);
                } catch (err) {
                    console.error(err);
                }                
            });

            return load(result);
        }
    }
});
