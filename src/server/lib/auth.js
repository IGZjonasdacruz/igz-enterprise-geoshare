var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    userDao = require('./dao/user'),
    logger = require('./logger')(__filename);

const GOOGLE_CLIENT_ID = '218360285517-d0428585nriahlh6gvrobtjop814ltna.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET = 'fWHheHq5SH-A2ve2pBp1OxZw',
      CALLBACK_URL = 'http://127.0.0.1:3000/oauth2callback';

//
// Passport Session Serialization
//
passport.serializeUser(function(id, done) {
  logger.info('SerializeUser: ' + id);
  done(null, id);
});

passport.deserializeUser(function(id, done) {
  logger.info('DeserializeUser: ' + id);
  userDao.get(id, function (err, user) {
    done(null, user);
  });
});

//
// Register Google Strategy in Passport
//
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    logger.info('New accessToken: ' + accessToken + ', refreshToken: ' + refreshToken + ', user: ' + profile.id);
    
    token = accessToken;
    
    userDao.save(profile, accessToken, refreshToken, function (err, user) {
      if ( err ) throw err;
      return done(err, user._id);
    });
  }
));

module.exports.init = function (app) {

  logger.info('Configuring passport...');

  // Configure express app
  app.use(passport.initialize());
  app.use(passport.session());

  // Add auth routes
  app.get('/login',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                              'https://www.googleapis.com/auth/userinfo.email']}));

  app.get('/oauth2callback', 
    passport.authenticate('google'),
    function(req, res) {
      logger.info('oauth2callback');
      res.redirect('/');
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
    res.send('<a href="/login">login</a>');
  }
};
