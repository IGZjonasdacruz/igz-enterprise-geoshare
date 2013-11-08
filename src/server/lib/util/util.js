var logger = require('../util/logger')(__filename),
		request = require('request');


function doCall(method, BASE_URL, path, accessToken, done) {

	var options = {
		url: BASE_URL + path,
		method: method

	};

	if (accessToken) {
		options.headers = {
			authorization: 'Bearer ' + accessToken
		};
	}


	request(options, function(err, res, body) {
		//logger.info('err=' + err + ', method=' + method + ', path=' + path + ', res.statusCode=' + res.statusCode + ', accessToken=' + accessToken);

		if (err) {
			return done(err, null);
		}

		if (res.statusCode === 200) {
			var json = JSON.parse(body);
			done(null, json);
		} else {
			done('status code ' + res.statusCode, null);
		}
	});
}

module.exports = {
	doCall: doCall
};
