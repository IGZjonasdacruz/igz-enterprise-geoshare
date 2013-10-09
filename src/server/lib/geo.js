var user = require('./dao/user'),
    logger = require('./logger')(__filename);

var request = require('request');
module.exports.init = function (app) {
	app.get('/my_location',
		function (req, res) {
			var headers = {
				authorization : req.headers['authorization']
			};

			var url = "https://www.googleapis.com/oauth2/v3/userinfo";

			var query = {
				alt: "json"
			};

			request(
			{
				headers : headers,
				url : url,
				qs: query,
				method: "GET",
				jar: false
			},
			function(err, r, body){
				var b = JSON.parse(body);
				if(err){
					logger.error('error:', err);
					b = 'error:' + err + " body: " + body;
				}
				var statusCode = 500;
				var headers = "";
				res.type('application/json');
				if(r) {
					statusCode = r.statusCode;
					headers =  r.headers;
				}

				if(!err && statusCode === 200 && b.email) {
					user.saveLocation(b.sub, b.email, [
							parseFloat(req.body.latitude),
							parseFloat(req.body.longitude)
						]
					, function(err, result) {
						res.send(statusCode, {
							error: err,
							statusCode: statusCode,
							body: b,
							headers: headers
						});
					});
				} else {
					res.send(statusCode, {
						error: err,
						statusCode: statusCode,
						body: b,
						headers: headers
					});
				}
			}
			);
		}
		);
}