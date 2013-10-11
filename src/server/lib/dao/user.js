var logger = require('../util/logger')(__filename),
        DaoBase = require('./dao_base.js').DaoBase,
        check = require('validator').check,
        util = require('util');

function User() {
 DaoBase.call(this, {
  collectionName: 'user',
  init: function(collection, callback) {
   collection.ensureIndex({"status": 1}, {w: 1, expireAfterSeconds: 3600}, function (err, result) {
    if (err)
     return callback(err);
    collection.ensureIndex({"location": "2dsphere"}, callback);
   });
  }
 });
}

util.inherits(User, DaoBase);

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
 this.collection(function(err, db, collection) {
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
  function(err, result) {
   if (err)
    return callback(err, null);
   db.close();
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
 
 this.collection(function(err, db, collection, query) {
  if (err)
   return callback(err, null);
  
  var first = query(function(collection, ok, ko) {
   var search = {
    _id: user.id
   };

   var fields = {
    location: 1
   };

   collection.findOne(
           search,
           {
            fields: fields
           },
   function(err, result) {
    if (err) 
     return ko(err);

    if (!result) {
     db.close();
     logger.warn('No user found with id ' + user.id);
     ko('No user found with id ' + user.id);
    } else {
     logger.info('Last location ' + JSON.stringify(result.location) + ' of ' + user.id + ' user retrieved');
     ok(result.location, true);
    }
   });
  }, callback);
     
  var second = first.query(function(collection, ok, ko, location) {
     search = {
      _id: {$ne: user.id},
      domain: user.domain,
      location: {
       $near: {
        $geometry: location
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
             function(err, result) {
      
              if (err)
               return ko(err);

              logger.info('Retrieved nearest contacts of ' + user.id + ' user');
              
              ok(result);
             }
     );
    }, callback);
 });
};

module.exports = new User(); // This module returns the same user instance (Singleton)