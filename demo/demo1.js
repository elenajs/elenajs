/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// The module to "bootstrap"
var loadModule = "app-server/server";
 
// Configuration Object for Dojo Loader:
dojoConfig = {
    baseUrl: ".", // Where we will put our packages
    async: 1, // We want to make sure we are using the "modern" loader
    hasCache: {
        "host-node": 1, // Ensure we "force" the loader into Node.js mode
        "dom": 0 // Ensure that none of the code assumes we have a DOM
    },
    // While it is possible to use config-tlmSiblingOfDojo to tell the
    // loader that your packages share the same root path as the loader,
    // this really isn't always a good idea and it is better to be
    // explicit about our package map.
    packages: [{
        name: "dojo",
        location: "node_modules/dojo"
    },{
	name: "elenajs",
	location: "lib"
    },{
	name: "setten",
	location: "node_modules/setten"
    },{
	name: "app",
	location: "app"
    },{
	name: "demo1",
	location: "demo/demo1"
    }],
    deps: [ 'demo1/main' ] // And array of modules to load on "boot"
};
 
// Now load the Dojo loader
require("dojo/dojo");


