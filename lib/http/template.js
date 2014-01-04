define([
    "../fs/dfs",
    "dojo/node!path",
    "dojo/string",
    "dojo/Deferred"
], function(dfs, path, string, Deferred) {
    var cache = {};
    return {
        load: function(id, require, load) {
            var parts = id.split("!"),
                    url = path.resolve(require.toUrl(parts[0])),
                    result;

            if (id in cache) {
                result = cache[url];
            } else {
                var template = dfs.readFileSync(url, 'utf8');
                result = {
                    templateString: template,
                    render: function(params) {
                        var deferred = new Deferred();
                        try {
                            var resultString = string.substitute(
                                    this.templateString,
                                    params,
                                    function(value) {
                                        return value || "";
                                    }
                            );

                            deferred.resolve(resultString);

                        } catch (err) {
                            deferred.reject(err);
                        }
                        return deferred;
                    }
                };

                cache[url] = result;
            }
            return load(result);
        }
    };
});
