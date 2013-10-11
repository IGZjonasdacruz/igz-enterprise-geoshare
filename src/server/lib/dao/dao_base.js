
var MongoClient = require('mongodb').MongoClient,
        config = require('../util/config').DB,
        check = require('validator').check,
        logger = require('../util/logger')(__filename);

var init;

function DaoBase(options) {
 this.collectionName = options.collectionName;
 init = options.init;
}

DaoBase.prototype.collection = function(callback) {
 var self = this;

 MongoClient.connect(config.CONN, function(err, db) {
  if (err)
   return callback(err, null);
  var collection = db.collection(self.collectionName);
  if (init) {
   init(collection, function(err, result) {
    if (err)
     return callback(err, null);
    logger.info(self.collectionName + ' collection is open.');
    init = void 0;
    callback(null, db, collection);
   });
  } else {
   logger.info(self.collectionName + ' collection is open.');
   callback(err, db, collection);
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

 this.collection(function(err, db, collection) {
  if (err)
   return callback(err, null);

  collection.findOne({_id: id}, function(err, doc) {
   if (err)
    return callback(err, null);

   logger.info('Found id="' + id + '" in "' + self.collectionName + '" collection.');
   callback(null, doc);
  });
 });
};

exports.DaoBase = DaoBase;
