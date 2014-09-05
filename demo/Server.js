define([
    "dojo/_base/declare",
    "elenajs/Server",
    "./_dispatchers"
], function(declare, _Server, dispatchers) {
    return declare('demo/Server', _Server, {
        dispatchers: dispatchers
    });
});