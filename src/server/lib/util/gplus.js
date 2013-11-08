var logger = require('../util/logger')(__filename),
		request = require('request'),
		util = require('../util/util');


var BASE_URL = 'https://www.googleapis.com/plus/v1/';


function people(accessToken, done) {
	util.doCall('GET', BASE_URL, 'people/me/people/visible', accessToken, done);
}


module.exports = {
	people: people
};
