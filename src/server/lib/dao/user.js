var MongoClient = require('mongodb').MongoClient,
    logger = require('../util/logger')(__filename),
    config = require('../util/config').DB,
    check = require('validator').check,
    sanitize = require('validator').sanitize;


function User () { }

User.prototype.saveLocation = function(user, lat, lon, callback) {

  try {
    check(user.id).notNull();
    check(user.email).isEmail();
    check(user.domain).notEmpty();
    check(lat).isFloat();
    check(lon).isFloat();

  } catch (e) {
    return callback(e);
  }


  MongoClient.connect(config.CONN, function(err, db) {
    if(err) throw err;

    var userUpdated = {
      _id: user.id,
      email: user.email,
      domain: user.domain,
      location: {
          type : "Point" ,
          coordinates : [lat, lon]
      },
      status: new Date()
    };
    var collection = db.collection('location');
    collection.ensureIndex( { "status": 1, "location": "2dsphere"}, {w: 1, expireAfterSeconds: 3600 }, function(err, result) {
      collection.findAndModify(
      {
        _id: user.id
      },
      {},
      userUpdated,
      {
      "new": true, 
      "upsert": true
      },
      function (err, result) {
        if(err) throw err;
        db.close();
        logger.info('Last location(lat,lon)=[' + lat + ', ' + lon + '] of ' + user.email + ' saved');
        callback(null, userUpdated);
      }
    );
    });
  });
};

User.prototype.myNearestContacts = function (user, callback) {

  try {
    check(user.id).notNull();
    check(user.domain).notEmpty();
    
  } catch (e) {
    return callback(e);
  }

  MongoClient.connect(config.CONN, function(err, db) {

    if(err) throw err;
  
    var search = {
      _id: user.id
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
          logger.warn('No user found with id ' + user.id);
          callback('No user found with id ' + user.id, null);
        } else {
          logger.info('Last location ' + JSON.stringify(result.location) + ' of ' + user.id + ' user retrieved');
          search = {
            _id: {$ne: user.id},
            domain: user.domain,
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
              logger.info('Retrieved nearest contacts of ' + user.id + ' user');
              callback(null, result);
            }
          );
        }
      }
    );
  });
};

module.exports = new User(); // This module returns the same user instance (Singleton)
