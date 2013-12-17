/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "dojo/has",
    "dojo/require"/*,
    "dojo/_base/declare",
    "elenajs/Server",
    "./_dispatchers"*/
], function(has, declare, _Server, dispatchers) {
    has.add('host-node',true);
    has.add('host-browser',false);
//    return declare('demo/Server', _Server, {
//        dispatchers: dispatchers
//    });
    return require('./Server');
});