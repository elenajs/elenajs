define([
    "dojo/Deferred"
], function (Deferred) {
    "use strict";


    // module:
    //		elenajs/promise/async
    return function async(functionsArray) {
        // summary:
        //		Takes multiple functions returning promises and executes them
        //		asynchrounously.
        //		The iteration is ended before its
        // description:
        //		Takes an array of functions and executes them
        //		asynchrounously.
        //		If a function returned promise will fail, async promise will fail too with an array of failed conditions.
        //		It's up to the logic of you code to take care of the correct action.
        //      This function is exception safe so unhandled exceptions will be handled with a promise failure.
        // functionsArray: Array
        //		Array of non-blocking functions that return promises.
        //		Every function will be executed and async returned promise will fail or succeed only when every returned promise
        //      will fulfill..
        // returns: dojo/promise/Promise
        var dfd = new Deferred(),
            fails = [],
            functionsArrayLength = functionsArray.length,
            checkCompletion = function () {
                var fails = [];

                for (var i = 0; i < functionsArrayLength; i++) {
                    if (functionsArray[i].isFulfilled) {
                        return false;
                    }
                }
                if (!fails.length) {
                    dfd.resolve();
                } else {
                    dfd.reject(fails);
                }
                return true;
            },
            success = function () {
                checkCompletion();
            },
            fail = function (err) {
                fails.push(err);
                checkCompletion();
            };

        for (var i = 0; i < functionsArrayLength; i++) {
            try {
                functionsArray[i].call().then(
                    success,
                    fail);
            } catch (err) {
                fails.push(err);
                checkCompletion();
            }
        }

        return dfd;
    };
});
