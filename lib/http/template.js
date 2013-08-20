define([
    "dojo/node!path",
    "dojo/node!fs",
    "dojo/string"
], function(path, fs, string) {
    var cache = {};
    return {
        load: function(id, require, load) {
            var parts = id.split("!"),
                    url = path.resolve(require.toUrl(parts[0])),
                    result;

            if (id in cache) {
                result = cache[url]
            } else {
                var template = fs.readFileSync(url, 'utf8');
                result = {
                    templateString: template,
                    render: function(params) {
                        return string.substitute(
                                this.templateString,
                                params,
                                function(value) {
                                    return value || "";
                                }
                        );
                    }
                }
                fs.watchFile(url, function(curr) {
                    fs.readFile(url, 'utf8').then(
                            function (data) {
                                result.templateString = data;
                            },
                            function (err) {
                                console.error(err);
                            });
                });
                cache[url] = result;
            }
            return load(result);
        }
    }
});
