
var env = process.env.ENV || 'local';

var configPath = './config/' + env + '.json';
var config = require(configPath);

console.log('Configuration loaded for enviroment: "' + env + '"');

module.exports = config;
