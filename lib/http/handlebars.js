define([
    "dojo/node!path",
    "dojo/node!handlebars",
    "dojo/Deferred",
    "../fs/dfs",
    "../watch"
], function(path, handlebars, Deferred, dfs, watch) {
    var cache = {};
    var HandlebarsTemplate = function(url) {
        var self = this;
        var fileContent = dfs.readFileSync(url);
        this.template = handlebars.compile(fileContent);
        watch(url,
                function() {
                    var fileContent = dfs.readFileSync(url);
                    self.template = handlebars.compile(fileContent);
                },
                function(err) {
                    console.error(err);
                }
        );


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
        module: 'handlebars',
        load: function(id, require, load) {
            var parts = id.split("!"),
                    url = path.resolve(require.toUrl(parts[0])),
                    result;

            if (url in cache) {
                result = cache[url];
            } else {

                try {
                    result = new HandlebarsTemplate(url);
                    cache[url] = result;
                } catch (err) {
                    console.error("rendering: " + url, err);
                }
            }

            load(result);
        }
    };
});
