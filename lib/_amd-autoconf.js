var fs = require('fs');
var path = require('path');

var amdConfigFactory = {
    propertyResolve: function(obj, properties) {
        var l = properties.length;
        var result = obj;
        for (var i = 0; i < l; i++) {
            result = result[properties[i]];
            if (result === undefined) {
                break;
            }
        }
        return result;
    },
    _getPackageLib: function(packageJson) {
        if (fs.existsSync(packageJson)) {
            var package = JSON.parse(fs.readFileSync(packageJson, {encoding: 'utf8'}));
            return path.resolve(path.dirname(packageJson), this.propertyResolve(package, ["directories", "lib"]) || "./");
        }

    },
    _getNodeModulesPath: function(packageJsonPath) {
        var result = path.resolve(packageJsonPath, 'node_modules');
        if (fs.existsSync(result)) {
            return result;
        } else {
            var newPath = path.resolve(packageJsonPath, '..');
            if (packageJsonPath === newPath) {
                return newPath;
            } else {
                return this._getNodeModulesPath(newPath);
            }

        }
    },
    resolveAmdPackage: function(packageJson, packageJsonPath, amdName) {
        var amdLocationValue = packageJson.amdDependencies[amdName];
        if (amdLocationValue.match(/^\/|^\.\.?[^\.]/)) {
            // It's a directory
            if (amdLocationValue.match(/^\./)) {
                // directory is relative
                var pkgPath = path.resolve(packageJsonPath, amdLocationValue);
                amdLocationValue = this._getPackageLib(path.resolve(pkgPath, 'package.json')) || pkgPath;
            }
            if (fs.existsSync(amdLocationValue)) {
                return amdLocationValue;
            } else {
                console.info("Could not resolve " + amdName + ":" + amdLocationValue);
                return;
            }
        } else if (amdLocationValue.match(/^http(s)?\:/i)) {
            // It's a url
            return amdLocationValue;
        } else {
            // It's a package.json link
            for (var packageDep in packageJson.dependencies) {
                if (packageDep === amdLocationValue) {
                    var nodeModulesPath = this._getNodeModulesPath(packageJsonPath);
                    var location = path.resolve(nodeModulesPath, packageDep);
                    if (fs.existsSync(location)) {

                        return this._getPackageLib(path.resolve(location, 'package.json')) || location;
                    }
                }
            }
            throw new Error("Could not resolve " + amdName + ":" + amdLocationValue + " (global folders are not supported)");
        }
    },
    getAmdName: function(package, libName) {
        return this.propertyResolve(package, ['amdMappings', libName]);
    },
    queryObjectsArray: function(array, queryObject) {
        for (var i = 0; i < array.length; i++) {
            var matches = true, obj = array[i];
            for (var key in queryObject) {
                if (obj[key] !== queryObject[key]) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                return obj;
            }
        }
    },
    _getPackagePath: function(packagePath) {
        var result = path.resolve(packagePath, 'package.json');
        if (fs.existsSync(result)) {
            return result;
        } else {
            var newPath = path.resolve(packagePath, '..');
            if (packagePath === newPath) {
                return newPath;
            } else {
                return this._getPackagePath(newPath);
            }

        }
    },
    _buildAmdEligibleDependencies: function(package, module_path) {
        var directDependencies = Array.prototype.concat(
                Object.keys(package.dependencies || {}),
                Object.keys(package.devDependencies || {}));

        package.amdDependencies = package.amdDependencies || {};
        directDependencies.forEach(function(dep) {
            var packageDepPath = path.resolve(module_path, dep, 'package.json');
            var packageDep = fs.existsSync(packageDepPath) &&
                    JSON.parse(fs.readFileSync(packageDepPath, {encoding: 'utf8'})) || {};
            if (packageDep.amdName && !package.amdDependencies[packageDep.amdName]) {
                package.amdDependencies[packageDep.amdName] = dep;
            }
        });

    },
    createAmdPackageDependencies: function(params) {

        var userConfig = params.config;
        var packageJson, directory;
        var index = params.index || 0;
        var statsLocation = fs.statSync(params.location);
        if (statsLocation.isFile()) {
            packageJson = params.location;
            directory = path.dirname(packageJson);
        } else {
            directory = params.location;
            packageJson = this._getPackagePath(directory);
        }
        if (fs.existsSync(packageJson)) {
            var package = JSON.parse(fs.readFileSync(packageJson, {encoding: 'utf8'}));

            if (!index) {
                var mainAmdPackage = {};
                mainAmdPackage.name = package.amdName || package.name;
                mainAmdPackage.location = path.resolve(directory,
                        this.propertyResolve(package, ["directories", "lib"]) || "./");
                userConfig.baseUrl = userConfig.baseUrl ||
                        mainAmdPackage.location;
                userConfig.packages.push(mainAmdPackage);
            }
            var packages = [];
            this._buildAmdEligibleDependencies(package, path.resolve(path.dirname(packageJson), 'node_modules'));
            if (package.amdDependencies) {
                for (var moduleName in package.amdDependencies) {
                    var amdPackage = {};
                    var location = this.resolveAmdPackage(package, directory, moduleName);
                    if (location) {
                        amdPackage.name = moduleName;
                        //if a module with the given name exists in userConfig.map,
                        //create a new identifier
                        if (this.queryObjectsArray(userConfig.packages, {name: amdPackage.name})) {
                            amdPackage.name += '__' + index;
                        }
                        //Create a new module mapping, if needed
                        try {
                            if (!userConfig.map[amdPackage.name]) {
                                userConfig.map[amdPackage.name] = {};
                            }
                        } catch (e) {
                            console.error('.........', e);
                            console.error(JSON.stringify(userConfig, null, 4));
                        }
                        amdPackage.location = location;

                        if (params.parentPackage) {
                            if (params.parentPackage && moduleName !== amdPackage.name) {
                                userConfig.map[params.parentPackage.name][moduleName] = amdPackage.name;
                            }
                        }
                        packages.push(amdPackage);
                    }
                }
            }

            if (packages.length > 0) {

                if (userConfig.packages) {
                    userConfig.packages = userConfig.packages.concat(packages);
                } else {
                    userConfig.packages = packages;
                }
                var nextIndex = index + 1;
                for (var i = 0; i < packages.length; i++) {
                    var location = packages[i].location;
                    this.createAmdPackageDependencies({
                        config: userConfig,
                        location: location,
                        index: nextIndex,
                        parentPackage: packages[i]
                    });
                }
            }
        }
    },
    addDefaultRequires: function(cfg) {
        cfg.require = cfg.require || [];
        var nodeOverride = 'elenajs/node';
        if (cfg.require.indexOf(nodeOverride) < 0) {
            cfg.require.push(nodeOverride);
        }
    },
    createConfig: function(userConfig, packageLocation) {

        userConfig = userConfig || {};

        if (userConfig.packages === undefined) {
            userConfig.packages = [];
        }
        if (userConfig.map === undefined) {
            userConfig.map = {};
        }
        var params = {
            location: packageLocation || path.dirname(process.argv[1]),
            config: userConfig
        };
        this.createAmdPackageDependencies(params);
      
        for (var key in params.config.map) {
            if (!Object.keys(params.config.map[key]).length) {
                delete params.config.map[key];
            }
        }
        
        if (!Object.keys(params.config.map).length) {
            delete params.config.map;
        }
        this.addDefaultRequires(params.config);
        return params.config;
    }


};

module.exports = {
    createConfig: function(userConfig, packageLocation) {
        return amdConfigFactory.createConfig(userConfig, packageLocation);
    }
};
