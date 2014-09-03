define([
    "dojo/_base/declare",
    "./templates/SimpleTemplate",
    "./fs/dfs",
    "dojo/node!path",
    "./watch",
    "dojo/topic"
], function(declare, Template, dfs, path, watch, topic) {
    var cache = {};
    var DynamicTemplate = declare("elenajs.template", Template, {
        constructor: function(params) {
            var self = this;
            this.url = params.url;
            this.compile(dfs.readFileSync(this.url, 'utf8'));
            watch(self.url,
                    function() {
                        this.compile(dfs.readFileSync(self.url, 'utf8'));
                    },
                    function(err) {
                        console.error(err);
                    }
            );
        }
    });
    return {
        module: 'template',
        load: function(id, require, load) {
            var parts = id.split("!"),
                    url = path.resolve(require.toUrl(parts[0])),
                    result;

            if (url in cache) {
                result = cache[url];
            } else {
                result = new DynamicTemplate({url: url});
                cache[url] = result;
            }

            load(result);
        }
    };
});
