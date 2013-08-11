define(["dojo/require",
	"dojo/_base/declare",
	"dojo/node!path",
	"dojo/node!fs",
	"dojo/string"
       ], function (require, declare, path, fs, string) {	   
	   var cache = {};
	   return {	       
	       load: function (id, require, load) {
		   var parts = id.split("!"),
		   url = path.resolve(require.toUrl(parts[0])),
		   result;
		   
		   if (id in cache) {
		       result = cache[url]
		   } else {
		       var template = fs.readFileSync(url,'utf8');
		       result = {
			   templateString: template,
			   render: function (params) {
			       return string.substitute(
				   this.templateString, 
				   params,
				   function (value) {
				       return value || "";
				   }
			       );
			   }
		       }
		       fs.watchFile(url, function (curr) {
			   result.templateString = fs.readFileSync(url,'utf8');
		       });
		       cache[url] = result;
		   }
		   return load(result);
	       }
	   }
});
