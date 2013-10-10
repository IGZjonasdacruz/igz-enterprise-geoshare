
var MongoClient = require('mongodb').MongoClient,
    config = require('../util/config').DB,
    check = require('validator').check;

function DaoBase (options) {
  this.collectionName = options.collectionName;
}

DaoBase.prototype.collection = function (callback) {
  var self = this;

  MongoClient.connect(config.CONN, function (err, db) {
    if (err) return callback(err, null);

    var collection = db.collection(self.collectionName);
    callback(null, db, collection);
  });
}

DaoBase.prototype.get = function (id, callback) {
  try {
    check(id).notNull();
  } catch (err) {
    return callback(err);
  }

  this.collection(function (err, db, collection) {
    if (err) return callback(err, null);

    collection.findOne({_id: id}, function (err, doc) {
      if (err) return callback(err, null);
      callback(null, doc);
    })
  });
};

exports.DaoBase = DaoBase;
