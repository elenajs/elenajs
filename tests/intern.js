// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define(
        ['node_modules/intern/node_modules/dojo/has'],
        function(has) {
            has.add('dojo-has-api', true);
            var commonDeps = {
                dojo: 'node_modules/dojo',                 
                mimetype: 'node_modules/mimetype',
                formidable: 'node_modules/formidable'
            };
            
            return {
                maxConcurrency: 3,
                loader: {
                    packages: [
                        {name: 'elenajs', location: 'lib'},
                        {name: 'tests', location: 'tests'},
                        {name: 'demo', location: 'demo'}
                    ],
                    map: {
                        'elenajs': commonDeps,
                        'tests': commonDeps,
                        'demo': commonDeps
                    }
                },
                capabilities: { 'idle-timeout': 10 }, 
                // Non-functional test suite(s) to run in each browser
                suites: [ 'tests/all' ],
                // Functional test suite(s) to run in each browser once non-functional tests are completed
//	functionalSuites: [ /* 'myPackage/tests/functional' */ ],

                // A regular expression matching URLs to files that should not be included in code coverage analysis
                excludeInstrumentation: /^tests\//
            }
        });
