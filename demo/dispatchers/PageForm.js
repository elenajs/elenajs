/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "elenajs/dispatchers/RequestDispatcher",
    "elenajs/renderers/TemplateRenderer",
    "elenajs/template!./templates/Form.html",
    "elenajs/template!./templates/_menu.html"
], function(
        declare,
        lang,
        RequestDispatcher,
        TemplateRenderer,
        template,
        menu
        ) {
    return declare('demo/dispatchers/Page3', RequestDispatcher, {
        matcher: /^\/form.html$/i,
        title: 'ElenaJS Demo Form',
        render: function(deferredPointer) {
            var self = this;
            menu.render().then(function (data) {
                self._renderTemplate(deferredPointer, {title: self.title, menu: data, greerings: ''});
            }, function (err) {
                deferredPointer.signal(err);
            });
        },
        _renderTemplate: function (deferredPointer, params) {
            var self = this;
            var renderer = new TemplateRenderer({
                    httpDeferred: deferredPointer,
                    templateObj: template
                });
            this.processRequest(deferredPointer).then(function(data) {
                if (data.name) {
                    data.greetings= '<p>Hello ' + escape(data.name) + '</p>'; 
                }
                renderer.render(lang.mixin({}, data, params));
            }, function(err) {
                if (!deferredPointer.isFulfilled()) {
                    deferredPointer.reject(err);
                }
            });
        }
    });
});
