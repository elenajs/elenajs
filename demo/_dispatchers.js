define([
    "./dispatchers/StaticResources",
    "./dispatchers/PageIndex",
    "./dispatchers/PageForm"
], function () {
    var result = Array.prototype.slice.call(arguments).map(function (Clazz) { return new Clazz();});
    return result;
});

