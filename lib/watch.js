define([
    "./fs/dfs",
    "dojo/Deferred"
], function(
        dfs,
        Deferred
        ) {

    var cache = {};
    var watch = function(fileName, callback, errback) {
        if (!cache[fileName]) {
            cache[fileName] = [false, callback, errback];
        }
    };
    watch.stopWatching = function(fileName) {
        if (fileName) {
            try {
                if (cache[fileName]) {
                    dfs.unwatchFile(fileName);
                    cache[fileName][0] = false;
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            Object.keys(cache).forEach(function(currFileName) {
                watch.stopWatching(currFileName);
            });
        }
    };
    watch.startWatching = function(fileName) {
        if (fileName) {
            try {
                var watchObj = cache[fileName];
                if (watchObj && !watchObj[0]) {
                    watchObj[0] = true;
                    dfs.watchFile(fileName, watchObj[1], watchObj[2]);
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            Object.keys(cache).forEach(function(currFileName) {
                watch.startWatching(currFileName);
            });
        }
    };

    return watch;
});
