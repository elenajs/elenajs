define([
    "dojo/_base/declare",
    "dojo/Stateful",
    "dojo/Deferred"
], function(declare, Stateful, Deferred) {
    "use strict";

    /**
     * This module extends a dojo/Deferred object adding http request and response
     * informations in constructor.
     * Constructor accepts http request and http response as required parameters.
     *
     * @module elenajs/HttpDeferred
     * @mixes http://dojotoolkit.org/api/1.9/dojo/Deferred.html
     */
    var HttpDeferred = declare("elenajs.HttpDeferred", [Stateful,Deferred], {
        /**
         * HTTP request object.
         * @default true
         * @type {!http.ClientRequest}
         * @instance
         */
        httpRequest: null,
        /**
         * HTTP response object.
         * @default true
         * @type {!http.ServerResponse}
         * @instance
         */
        httpResponse: null
    });

    return HttpDeferred;
});