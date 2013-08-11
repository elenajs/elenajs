define(["dojo/require",
	"dojo/_base/declare",
	"dojo/node!path",
	"dojo/node!swig"
       ], function (require, declare, path, swig) {
	   var cache = {};
	   return {
	       module: 'swig',
	       load: function (id, require, load) {		   
		   var parts = id.split("!"),
		   absMid= parts[0],
		   url = path.resolve(require.toUrl(parts[0])),
		   result;
		   
		   if (url in cache) {
		       result = cache[url];
		   } else {
		       result = {
			   template: swig.compileFile(url),
			   render: function (params) {
			       template.render(params);
			   }
		       }
		       cache[url] = result;
		   }
		   fs.watchFile(url, function (curr) {
		       try {
			   result.templateString = fs.readFileSync(url,'utf8');
		       }
		       catch (e) {
			   console.error(e);
		       }
		   });
		   
		   return load(result); 
	       }
	   }
});
