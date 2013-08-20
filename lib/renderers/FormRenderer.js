define([
    "dojo/_base/declare",
    "./Renderer",
    "dojo/node!formidable",
    "dojo/promise/Promise"
], function(
        declare,
        Renderer,
        formidable,
        Promise
        ) {

    var FormRenderer = declare("elenajs.renderers.FormRenderer", [Renderer], {
        data: [],
        render: function() {
            var req = this.request;
            var method = req.method;
            if (method.match(/^POST$/i)) {
                var form = new formidable.IncomingForm();
                form.on('file', function())
                .
            }
            throw "this is an abstract method";
        }
    });
    return FormRenderer;
});
