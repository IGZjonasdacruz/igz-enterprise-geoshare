var MongoClient = require('mongodb').MongoClient,
    logger = require('../util/logger')(__filename),
    config = require('../util/config').DB;


function User () { }
/*User.prototype.save = function(googleProfile, accessToken, refreshToken, callback) {
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
};*/

User.prototype.saveLocation = function(userId, email, domain, location, callback) {
  MongoClient.connect(config.CONN, function(err, db) {
    if(err) throw err;

    var geolocation = {
      _id: userId,
      email: email,
      domain: domain,
      location: {
          type : "Point" ,
          coordinates : location
      },
      status: new Date()
    };
    var collection = db.collection('location');
    collection.ensureIndex( { "status": 1, "location": "2dsphere"}, {w: 1, expireAfterSeconds: 3600 }, function(err, result) {
      collection.findAndModify(
      {
        _id: userId
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
  });
};

User.prototype.myNearestContacts = function (userId, domain, callback) {
  MongoClient.connect(config.CONN, function(err, db) {

    if(err) throw err;
  
    var search = {
      _id: userId
    };

    var fields = {
      location: 1
    };

    var collection = db.collection('location');
      collection.findOne(
        search,
      {
        fields: fields
      },
      function (err, result) {
        if(err) throw err;
        if(!result) {
          db.close();
          logger.warn('No user found with id ' + userId);
          callback('No user found with id ' + userId, null);
        } else {
          logger.info('Last location ' + JSON.stringify(result.location) + ' of ' + userId + ' user retrieved');
          search = {
            _id: {$ne: userId},
            domain: domain,
            location: {
              $near:{
                $geometry: result.location
              },
              $maxDistance: 50
            }
          };

          fields = {
            email: 1,
            location: 1,
            _id: 0
          };

          collection.find(search, {fields: fields}).toArray(
            function (err, result) {
              if(err) throw err;
              logger.info('Retrieved nearest contacts of ' + userId + ' user');
              callback(null, result);
            }
          );
        }
      }
    );
  });
};

module.exports = new User(); // This module returns the same user instance (Singleton)
