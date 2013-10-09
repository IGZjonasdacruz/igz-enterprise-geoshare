var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    userDao = require('./dao/user'),
    logger = require('./logger')(__filename),
    config = require('./config').OAUTH2;

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
    
    userDao.save(profile, accessToken, refreshToken, function (err, user) {
      if ( err ) throw err;
      return done(err, user);
    });
  }
));

module.exports.init = function (app) {

  logger.info('Configuring passport...');

  // Configure express app
  app.use(passport.initialize());

  // Add auth routes
  app.get('/login',
    passport.authenticate('google', {session: false, scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                              'https://www.googleapis.com/auth/userinfo.email']}));

  app.get('/oauth2callback', 
    passport.authenticate('google', {session: false, failureRedirect: '/login'}),
    function(req, res) {
      logger.info('Received oauth2callback');
      res.json(req.user);
    });
}

//
// Check if the session user exists, in other case FORBIDDEN is returned
//
module.exports.ensureLogin = function (req, res, next) {
  logger.info('EnsureLogin req.user=' + req.user);

  if ( req.user ) {
    next();
  } else {
    res.send(403);
  }
};
