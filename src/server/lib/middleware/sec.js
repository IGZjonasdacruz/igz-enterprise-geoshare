
var request = require('request');

const GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";


/**
 * Check if the session user exists, in other case FORBIDDEN
 */
function ensureAuthenticated (req, res, next) {

  var reqAuth = req.headers['authorization'];

  if ( !reqAuth ) {
    res.send(401); // Unauthorized
    return;
  }

  var headers = {
    authorization : reqAuth
  };

  var params = {
    alt: "json"
  };

  request({
    headers : headers,
    url : GOOGLE_USER_INFO_URL,
    qs: params,
    method: "GET",
    jar: false //  Set to true if you want cookies to be remembered for future use, or define your custom cookie jar (see examples section)
  },
  function (err, res, body) {

    if ( err ) {
      logger.error(err); // TODO Improve error sending stack trace and util information
      res.send(500);
      return;
    }

    if ( res.statusCode !== 200 ) {
      logger.error('The request to ' + GOOGLE_USER_INFO_URL + ' returns statusCode=' + res.statusCode + ', body=' + body);
      res.send(500);
      return;
    }

    var resJson = JSON.parse(body);

    // sub = An identifier for the user, unique among all Google accounts and never reused. A Google account can have multiple
    // emails at different points in time, but this value is never changed. You should use this within your application as
    // the unique-identifier key for the user.

    if ( !resJson.hasOwnProperty('email') || !resJson.hasOwnProperty('sub') ) {
      logger.error('The request to ' + GOOGLE_USER_INFO_URL + ' doesn\'t returns email or sub field. body=' + body);
      res.send(500);
      return;
    }

    // Expose user for next middelwares
    req.user = { id: resJson.sub, email: resJson.email };
    next(null);

  });
}

module = module.exports = ensureAuthenticated;
