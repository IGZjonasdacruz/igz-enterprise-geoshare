var MongoClient = require('mongodb').MongoClient,
    logger = require('../logger')(__filename),
    config = require('../config').DB;


function User () { }

User.prototype.save = function(googleProfile, accessToken, refreshToken, callback) {
  MongoClient.connect(config.CONN, function(err, db) {
    if(err) throw err;

    var user = {
      _id: googleProfile.id,
      name: googleProfile.displayName,
      accessToken: accessToken,
      refreshToken: refreshToken
    };

    var collection = db.collection('user');
    collection.save(user, {safe: true}, function(err, result) {
      if(err) throw err;

      db.close();
      logger.info('User ' + user._id + ' saved')

      callback(null, user);
    });
  });
};

User.prototype.get = function(id, callback) {
  MongoClient.connect(config.CONN, function(err, db) {
    if(err) throw err;

    var user = {
      _id: id
    };

    var collection = db.collection('user');
    collection.findOne(user, function(err, doc) {
      if(err) throw err;

      db.close();
      logger.info('Get user ' + user._id + ' completed')

      callback(null, doc);
    });
  })
};

User.prototype.saveLocation = function(id, email, location, callback) {
  MongoClient.connect(config.CONN, function(err, db) {
    if(err) throw err;

    var geolocation = {
      _id: id,
      email: email,
      location: location,
      status: new Date()
    };
    var collection = db.collection('location');

    collection.findAndModify(
      {
        _id: id
      },
      {},
      geolocation,
      {
      "new": true, 
      "upsert": true
      },
      function (err, result) {
        if(err) throw err;
        db.close();
        logger.info('Last location ' + JSON.stringify(location) + ' of ' + email + ' saved');
        callback(null, result);
      }
    );
  });
};

module.exports = new User();
