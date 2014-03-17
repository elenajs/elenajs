/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

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
