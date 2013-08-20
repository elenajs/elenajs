define([
    "dojo/_base/declare",
    "./Stateful",
    "../_SignalEmitter"
], function(
        declare,
        Stateful,
        _SignalEmitter
        ) {

    var Renderer = declare("elenajs.renderers.FormRenderer", [Stateful, _SignalEmitter], {
        request: null,
        response: null,
        signal: function(statsCode, log) {
            this.inherited(arguments, [this.request, this.response, statsCode, log]);
        },
        render: function() {
            throw "this is an abstract method";
        }
    });
    return Renderer;
});
