define([
    "./templates/SimpleTemplate",
    "dojo/node!path"
], function(Template, path) {
    var cache = {};
    
    return {
        module: 'template',
        load: function(id, require, load) {
            var parts = id.split("!"),
                    url = path.resolve(require.toUrl(parts[0])),
                    result;

            if (url in cache) {
                result = cache[url];
            } else {
                result = new Template({templateSrc: url});
                cache[url] = result;
            }

            load(result);
        }
    };
});
