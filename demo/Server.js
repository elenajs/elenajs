/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "dojo/_base/declare",
    "elenajs/Server",
    "./_dispatchers"
], function(declare, _Server, dispatchers) {
    return declare('demo/Server', _Server, {
        dispatchers: dispatchers
    });
});