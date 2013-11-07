var logger = require('../util/logger')(__filename),
	request = require('request');


const BASE_URL = 'https://www.googleapis.com/plus/v1/';

function doCall (method, path, accessToken, done) {

	request({
		headers : {
			authorization : 'Bearer ' + accessToken
		},
		url : BASE_URL + path,
		method: method

	}, function (err, res, body) {

		//logger.info('err=' + err + ', method=' + method + ', path=' + path + ', res.statusCode=' + res.statusCode + ', accessToken=' + accessToken);

		if ( err ) {
			return done(err, null);
		}

		if (res.statusCode == 200) {
			var json = JSON.parse(body);
			done(null, json);
		}
	});
}

function people (accessToken, done) {
	doCall('GET', 'people/me/people/visible', accessToken, done);
}


module.exports = {
	people : people
};
