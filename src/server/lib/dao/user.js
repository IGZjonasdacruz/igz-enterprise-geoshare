var logger = require('../util/logger')(__filename),
  check = require('validator').check,
  util = require('util'),
  mongodb = require('../util/mongodb'),
  async = require('async');


//
// User indexes
//

function statusIndex(next) {
  mongodb(function(err, db) {
    if (err) {
      throw err;
    }

    db.collection('user').ensureIndex({
        "status": 1
      }, {
        w: 1,
        expireAfterSeconds: 3600
      },
      function(err, result) {
        if (err) {
          throw err;
        }

        next();
      }
    );
  });

}

function locationIndex(next) {
  mongodb(function(err, db) {
    if (err) {
      throw err;
    }

    db.collection('user').ensureIndex({
        "location": "2dsphere"
      },
      function(err, result) {
        if (err) {
          throw err;
        }

        next();
      }
    );
  });
}

async.parallel([statusIndex, locationIndex], function() {
  logger.info("All user indexes have been ensured");
});


function User() {}

User.prototype.reset = function(callback) {
  mongodb(function(err, db) {
    if (err)
      return callback(err, null);

    db.collection('user').remove({}, function(err, result) {
      if (err)
        return callback(err, null);
      callback(null, result);
    });
  });
}


User.prototype.get = function(id, callback) {
  try {
    check(id).notNull();
  } catch (err) {
    return callback(err);
  }

  mongodb(function(err, db) {
    if (err)
      return callback(err, null);

    db.collection('user').findOne({
      _id: id
    }, function(err, doc) {
      if (err)
        return callback(err, null);

      logger.info('Found id="' + id + '" in "user" collection.');
      callback(null, doc);
    });

  });
};

User.prototype.saveLocation = function(user, lat, lng, callback) {
  try {
    check(user.id).notNull();
    check(user.email).isEmail();
    check(user.domain).notEmpty();
    check(lat).isFloat();
    check(lng).isFloat();
  } catch (err) {
    return callback(err, null);
  }

  mongodb(function(err, db) {
    if (err)
      return callback(err, null);

    var userUpdated = {
      _id: user.id,
      email: user.email,
      domain: user.domain,
      location: {
        type: "Point",
        coordinates: [lng, lat]
      },
      status: new Date()
    };
    db.collection('user').findAndModify({
        _id: user.id
      }, {},
      userUpdated, {
        "new": true,
        "upsert": true
      },
      function(err, result) {
        if (err)
          return callback(err, null);

        logger.info('Last location lat=' + lat + ', lng=' + lng + ' of ' + user.email + ' saved');
        callback(null, userUpdated);
      }
    );

  });
};

User.prototype.myNearestContacts = function(user, callback) {

  try {
    check(user.id).notNull();
    check(user.domain).notEmpty();

  } catch (e) {
    return callback(e, null);
  }

  mongodb(function(err, db) {

    if (err)
      return callback(err, null);

    var search = {
      _id: user.id
    };

    var fields = {
      location: 1
    };

    db.collection('user').findOne(
      search, {
        fields: fields
      },
      function(err, result) {
        if (err)
          return callback(err, null);

        if (!result) {
          logger.warn('No user found with id ' + user.id);
          callback('No user found with id ' + user.id, null);
        } else {
          logger.info('Last location ' + JSON.stringify(result.location) + ' of ' + user.id + ' user retrieved');
          search = {
            _id: {
              $ne: user.id
            },
            domain: user.domain,
            location: {
              $near: {
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

          db.collection('user').find(search, {
            fields: fields
          }).toArray(
            function(err, result) {
              if (err)
                return callback(err, null);

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