define(["dojo/_base/declare",
    "dojo/Stateful",
    "./HttpErrorsRenderer"
], function(
        declare,
        Stateful,
        HttpErrorsRenderer
        ) {

    var Renderer = declare("elenajs.renderers.Renderer", [Stateful], {
        request: null,
        response: null,
        signal: function(statsCode, log) {
            log && console.log(log);
            var _rendererParams = {
                request: this.request,
                response: this.response,
                statusCode: statsCode
            };
            var Error = declare([HttpErrorsRenderer], _rendererParams);
            (new Error()).render();
        },
        render: function() {
            throw "this is an abstract method";
        }
    });
    return Renderer;
});
