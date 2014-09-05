define([
    "dojo/_base/declare",
    "elenajs/dispatchers/RequestDispatcher",
    "elenajs/renderers/TemplateRenderer",
    "elenajs/template!./templates/Index.html",
    "elenajs/template!./templates/_menu.html"
], function(
        declare,
        RequestDispatcher,
        TemplateRenderer,
        template,
        menu
        ) {


    return declare('demo/dispatchers/Page1', RequestDispatcher, {
        matcher: /^\/$|^\/index.html$/i,
        title: 'ElenaJs Demo Home',
        menu: '',
        render: function(deferredPointer) {
            var self = this;
            menu.render().then(function (data) {
                self._renderTemplate(deferredPointer, {title: self.title, menu: data});                
            }, function (err) {
               deferredPointer.signal(err);               
            });
            
        }, 
        _renderTemplate: function (deferredPointer, params) {
            new TemplateRenderer({
                httpDeferred: deferredPointer,
                templateObj: template
            }).render(params);
        }
    });
});
