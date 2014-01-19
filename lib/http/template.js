define([
    "../fs/dfs",
    "dojo/node!path",
    "dojo/string",
    "dojo/Deferred",
    "../watch"
], function(dfs, path, string, Deferred, watch) {
    var cache = {};
    var SimpleTemplate = function(url) {
        var self = this;
        this.templateString = dfs.readFileSync(url, 'utf8');

        watch(url,
                function() {
                    self.templateString = dfs.readFileSync(url, 'utf8');
                },
                function(err) {
                    console.error(err);
                }
        );

        this.render = function(params) {
            var deferred = new Deferred();
            try {
                var resultString = string.substitute(
                        self.templateString,
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
    return {
        module: 'template',
        load: function(id, require, load) {
            var parts = id.split("!"),
                    url = path.resolve(require.toUrl(parts[0])),
                    result;

            if (url in cache) {
                result = cache[url];
            } else {

                try {
                    result = new SimpleTemplate(url);
                    cache[url] = result;
                } catch (err) {
                    console.error("rendering: " + url, err);
                }
            }

            load(result);
        }
    };
});
