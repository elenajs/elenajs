define([
    "./fs/dfs"
], function(
        dfs
        ) {



    var cache = {};

    /**
     * Module returning a function to monitor file changes.
     *
     * @module elenajs/watch
     */

    /**
     * This is the function exported by elenajs/module<br>
     *
     * This function uses a global cache to keep track of every watched file along
     * with its callback and errback functions.<br>
     *
     * To start watching you then have to call
     * its internal function {@link module:elenajs/watch#startWatching|startWatching}
     *
     * @function module:elenajs/watch#function
     *
     * @param {String} fileName The name of the file to watch.
     * @param {Function} callback The function tha will be triggered when the file changes.
     * @param {Function} errback The function tha will be triggered an error occurs.
     *
     */
    var watch = function(fileName, callback, errback) {
        if (!cache[fileName]) {
            cache[fileName] = [false, callback, errback];
        }
    };

    /**
     * This function makes the application to stop watching.
     *
     * @function module:elenajs/watch#stopWatching
     *
     * @param {String} fileName This optional parameter makes the watch function
     * to only start watching a single file instead of all the file registered
     * inside of the watch private cache.
     *
     * @static
     *
     */
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

    /**
     * This function makes the application to stop watching the given file.
     *
     * @function module:elenajs/watch#startWatching
     *
     * @param {String} fileName This optional parameter makes the watch function
     * to only start watching a single file instead of all the file registered
     * inside of the watch private cache.
     *
     * @static
     */
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
