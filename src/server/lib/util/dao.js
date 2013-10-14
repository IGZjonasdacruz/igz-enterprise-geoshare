
var MongoClient = require('mongodb').MongoClient,
    config = require('../util/config').DB,
    logger = require('../util/logger')(__filename);

/**
 * MongoDB database
 */
var db, pending = [], opening = false;


function getMongoDB (callback) {
  if ( db ) {
    return callback(null, db);
  }

  pending.push(callback);
  
  if ( opening ) {
    return;
  }

  opening = true;

  // The primary committer to node-mongodb-native says:
  //  "You open do MongoClient.connect once when your app boots up and reuse the db object.
  //   It's not a singleton connection pool each .connect creates a new connection pool."
  MongoClient.connect(config.CONN, function(err, database) {
    if (err) {
      return callback(err, null);
    }

    db = database;

    logger.info('Mongodb connection established');

    for ( var f = 0, F = pending.length; f < F; f++ ) {
      pending[f](null, db);
    }
  });

}

module.exports = {
  mongodb : getMongoDB
}
