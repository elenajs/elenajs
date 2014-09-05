define([
    "dojo/_base/declare",
    "elenajs/dispatchers/FSDispatcher",
    "require"
], function(
        declare,
        FSDispatcher,
        require
        ) {
    var resourcesUrl = require.toUrl("../resources");
    return declare('demo/dispatchers/StaticResources', FSDispatcher, {
        matcher: /^\/resources\//,
        path: resourcesUrl
    });
});
