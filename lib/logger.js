define([
    "./_base/Logger"
], function(Logger) {
    var cache = {};
    
    return {
        module: 'logger',
        load: function(id, require, load) {
            var parts = id.split("!"),
                    category = parts[0] || 'elenajs',
                    result;

            if (category in cache) {
                result = cache[category];
            } else {
                
                result = new Logger({category:category});
                cache[category] = result;
            }

            load(result);
        }
    };
});
