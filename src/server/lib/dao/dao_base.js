var MongoClient = require('mongodb').MongoClient,
        config = require('../util/config').DB,
        check = require('validator').check,
        logger = require('../util/logger')(__filename),
        Q = require("q");

function DaoBase(options) {
 this.collectionName = options.collectionName;
 this.init = options.init;
}

DaoBase.prototype.collection = function(callback) {
 var self = this;

 MongoClient.connect(config.CONN, function(err, db) {
  var collection = db.collection(self.collectionName);
  if (self.init) {
   self.init(collection, function(err, result) {
    delete self.init;
    return queryPromise(err, callback, db, collection);
   });
  } else {
   return queryPromise(err, callback, db, collection);
  }
 });
};

DaoBase.prototype.get = function(id, callback) {
 var self = this;
 try {
  check(id).notNull();
 } catch (err) {
  return callback(err);
 }

 this.collection(function(err, db, collection, query) {

  if (err)
   return callback(err, null);

  query(function(collection, ok, ko) {
   collection.findOne({_id: id}, function(err, doc) {
    if (err) {
     ko(err);
    } else {
     ok(doc);
     logger.info('Found id="' + id + '" in "' + self.collectionName + '" collection.');
    }
   });
  }, callback);

 });
};

function queryPromise(err, callback, db, collection) {

 var query = function(deferredParent, work, callback) {

  var deferredQuery = Q.defer();

  var ok = function(results, skipCallBack) {
   deferredQuery.resolve(results);
   !skipCallBack && callback && callback(null, results);
  };

  var ko = function(err, skipCallBack) {
   deferredQuery.reject(err);
   !skipCallBack && callback && callback(err, null);
  };

  if (deferredParent) {
   deferredParent.promise.then(function(results) {
    work && work(collection, ok, ko, results);
   }, function(err) {
    deferredParent.reject(new Error(err));
   }); 
  } else {
   work && work(collection, ok, ko);
  }
  
  return {'query': query.bind(null, deferredQuery)};
 };

 if (err) {
  callback(err, null);
 } else {
  logger.info(collection.collectionName + ' collection is open.');
  callback(null, db, collection, query.bind(null, null));
 }

}


exports.DaoBase = DaoBase;
