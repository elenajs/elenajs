define([
    "./fs/dfs"
], function(dfs) {
    var cache = {};

    return {
        module: 'text',
        normalize: function(id, toAbsMid){
            // id is something like (path may be relative):
            //
            //	 "path/to/text.txt"
            var parts= id.split("!"),
                url= parts[0];
            return (/^\./.test(url) ? toAbsMid(url) : url);
        },
        load: function(id, require, load) {
            var parts = id.split("!"),
                    resourcePath = require.toUrl(parts[0]),
                    result;

            if (resourcePath in cache) {
                result = cache[resourcePath];
            } else {

                result = dfs.readFileSync(resourcePath, {encoding: 'utf8'});
                cache[resourcePath] = result;
            }

            load(result);
        }
    };
});
