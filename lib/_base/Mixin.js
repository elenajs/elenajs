define([
    "../declare",
    "dojo/_base/lang"
], function (
    declare,
    lang) {
    return declare("elenajs._base.Mixin", null, {
        constructor: function (args) {
            lang.mixin(this, args);
        }
    });
});