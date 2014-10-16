define([
    '../node!fs-extra',
    'dojo/Deferred'], function (fs, Deferred) {

    /*
     * Code in this module is forked from https://github.com/kitsonk/setten     
     */
    
    var asDeferred = function (fn, self, noError) {
		// summary:
		//		Converts a function that utilises a callback and converts it into a dojo/Deferred that resolves with
		//		either a single argument or an array of arguments that would have been passed to the callback.
		// fn: Function
		//		The function to convert into a function that returns a dojo/Deferred.
		// self: Object
		//		The object to use as scope when invoking the function.  Typically the object which the function
		//		belongs to.  Defaults to `this` if not passed.
		// noError: Boolean
		//		If the callback does not have an err value as the first argument passed to the callback.
		// returns: dojo/promise/Promise

		self = self || this;
		return noError ? function () {
			var dfd = new Deferred(),
				args = Array.prototype.slice.call(arguments);
			args.push(function () {
				var a = Array.prototype.slice.call(arguments);
				dfd.resolve(a.length > 1 ? a : a.length ? a[0] : null);
			});
			fn.apply(self, args);
			return dfd.promise;
		} : function () {
			var dfd = new Deferred(),
				args = Array.prototype.slice.call(arguments);
			args.push(function () {
				var a = Array.prototype.slice.call(arguments),
					err = a.shift();
				if (err) {
					dfd.reject(err);
				} else {
					dfd.resolve(a.length > 1 ? a : a.length ? a[0] : null);
				}
			});
			fn.apply(self, args);
			return dfd.promise;
		};
	};
    
    var dfs = {},
		singleArgFunctions = ['exists'];

	// Iterate through each property of the module
	for (var f in fs) {
		if (typeof fs[f] === 'function' && !/(^[_A-Z]|^create|^(un)?watch|Sync$)/.test(f)) { // It is something we want to convert
			dfs[f] = asDeferred(fs[f], fs, ~singleArgFunctions.indexOf(f)); // Create a deferred
		} else {
			dfs[f] = fs[f]; // Leave alone
		}
	}
    return dfs;
});
