define([
    "dojo/Deferred"
], function(Deferred) {
    "use strict";

    var _sync = function(functionsArray, exitContition, deferred) {
        deferred = deferred || new Deferred();
        if (!deferred.isCanceled()) {
            var fn = functionsArray.shift();
            if (!fn) {
                if (functionsArray.length > 0) {
                    _sync(functionsArray, exitContition, deferred);
                } else {
                    deferred.resolve(undefined);
                }
            } else {
                fn.call(this).then(function(data) {
                    if (exitContition.call(this, data)) {
                        deferred.resolve(data);
                    } else {
                        _sync(functionsArray, exitContition, deferred);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            }

            return deferred.promise;	// dojo/promise/Promise
        }
    };

    // module:
    //		elenajs/promise/sync
    return function sync(functionsArray, exitContition) {
        // summary:
        //		Takes multiple functions returning promises and executes them
        //		synchrounously.
        //		The iteration is ended before its
        // description:
        //		Takes an array of functions and executes them
        //		synchrounously.
        //		The chain is ended before its natural cycle if the exit condition
        //		returns a true value or an exception is met.
        // functionsArray: Array
        //		Array of non-blocking functions that return a promise.
        //		If no promise fulfills the exit condition, the
        //		returned promise is resolved with an undefined value.
        // exitCondition: Function
        //              the exit condition resolves the promise.
        // returns: dojo/promise/Promise
        return _sync(functionsArray, exitContition, null);
    }
});
