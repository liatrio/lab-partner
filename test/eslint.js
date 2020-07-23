var lint = require("mocha-eslint");

var paths = [
    "*.js",
    "lib/**/*.js",
    "features/**/*.js",
    "plugins/**/*.js",
    "test/**/*.js",
];

var options = {};

// Run the tests
lint(paths, options);
