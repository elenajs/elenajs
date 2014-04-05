define([
    "dojo/Deferred",
    "dojo/_base/lang"
], function(Deferred, lang) {
    "use strict";

    /**
     * This module extends a dojo/Deferred object adding http request and response
     * informations in constructor.
     * Constructor accepts http request and http response as required parameters.
     *
     * @module elenajs/HttpDeferred
     * @mixes http://dojotoolkit.org/api/1.9/dojo/Deferred.html
     */
    var HttpDeferred = function(httpRequest, httpResponse) {
        Deferred.call(this);
        /**
         * HTTP request object.
         * @default true
         * @type {!http.ClientRequest}
         * @instance
         */
        this.httpRequest = httpRequest;
        /**
         * HTTP response object.
         * @default true
         * @type {!http.ServerResponse}
         * @instance
         */
        this.httpResponse = httpResponse;
    };

    lang.mixin(HttpDeferred.prototype, Deferred.prototype);

    /**
     * Implementation of the toString method for this module
     * @returns {String} returns `[object HttpDeferred]`.
     * @instance
     */
    HttpDeferred.prototype.toString = function() {
        return "[object HttpDeferred]";
    };

    return HttpDeferred;
});