
var request = require('request'),
		logger = require('../util/logger')(__filename);

const GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";


/**
 * Check if the session user exists, in other case FORBIDDEN
 */
function ensureAuthenticated (req, res, next) {


	var reqAuth = req.headers['authorization'];

	if ( !reqAuth ) {
		logger.info('No authorization header found');
		res.send(401); // Unauthorized
		return;
	}

	var accessToken = reqAuth.replace('Bearer ', '');
	logger.info('Acess token = ' + accessToken);

	var headers = {
		authorization : reqAuth
	};

	var params = {
		alt: "json"
	};

	logger.info('Requesting user info...');
	request({
		headers : headers,
		url : GOOGLE_USER_INFO_URL,
		qs: params,
		method: "POST",
		jar: false //  Set to true if you want cookies to be remembered for future use, or define your custom cookie jar (see examples section)
	},
	function (err, response, body) {

		if ( err ) {
			logger.error('Request google user info: ' + err);
			return res.send(500);
		}

		if ( response.statusCode === 401 ) {
			logger.info('Request google user info: status=401');
			return res.send(401);

		} else if ( response.statusCode !== 200 ) {
			// Unexpected response status code
			logger.warn('The request to ' + GOOGLE_USER_INFO_URL + ' returns statusCode=' + response.statusCode + ', body=' + body);
			return res.send(500);
		}

		var resJson = JSON.parse(body);

		// sub = An identifier for the user, unique among all Google accounts and never reused. A Google account can have multiple
		// emails at different points in time, but this value is never changed. You should use this within your application as
		// the unique-identifier key for the user.

		// hd = The hosted domain e.g. example.com if the user is Google apps user.

		if ( !resJson.hasOwnProperty('email') || !resJson.hasOwnProperty('sub') || !resJson.hasOwnProperty('hd') ) {
			logger.warn('The request to ' + GOOGLE_USER_INFO_URL + ' doesn\'t returns email, hd or sub field. body=' + body);
			return res.send(500);
		}

		// Expose user for next middelwares
		logger.info('Loaded user info', resJson);
		req.user = { _id: resJson.sub, name: resJson.name,
			photo: resJson.picture,
			profile: resJson.profile,
			gender: resJson.gender,
			locale: resJson.locale,
			email: resJson.email,
			domain: resJson.hd,
			accessToken: accessToken
		};
		next(null);

	});
}

module = module.exports = ensureAuthenticated;
