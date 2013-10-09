var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    user = require('../dao/user'),
    logger = require('../util/logger')(__filename),
    config = require('../util/config').OAUTH2;

//
// Register Google Strategy in Passport
//
passport.use(new GoogleStrategy({
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    callbackURL: config.CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    logger.info('New accessToken: ' + accessToken + ', refreshToken: ' + refreshToken + ', user: ' + profile.id);

    return done(null, {
      /*id: profile.id,
      email: profile._json.email,*/
      accessToken: accessToken
    });
  }
));

function addRoutes ( app ) {

  app.get('/login',
    passport.authenticate('google', {session: false, scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                              'https://www.googleapis.com/auth/userinfo.email']}));

  app.get('/oauth2callback', 
    passport.authenticate('google', {session: false, failureRedirect: '/login'}),
    function(req, res) {
      logger.info('Received oauth2callback');

      res.json(req.user);
    });

  logger.info('Authorization routes added');
}

module = module.exports = addRoutes;
