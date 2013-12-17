// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define(['intern/node_modules/dojo/has'], function(has) {
    has.add('dojo-has-api', true);

    return {
        // Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
        maxConcurrency: 3,
        loader: {
            packages: [
                {name: 'tests', location: 'tests'},
                {name: 'demo', location: 'demo'},
                {name: 'elenajs', location: 'lib'},
                {name: 'setten', location: './node_modules/setten'}
            ],
            map: {
                '*': {
                    'dojo': './node_modules/dojo',
                    'dojo/text': 'tests/utils/text'
                }
            }
        },
        // Non-functional test suite(s) to run in each browser
        suites: ['tests/all'],
        // Functional test suite(s) to run in each browser once non-functional tests are completed
        functionalSuites: [/* 'myPackage/tests/functional' */],
        // A regular expression matching URLs to files that should not be included in code coverage analysis
        excludeInstrumentation: /^tests\//

    };
});
