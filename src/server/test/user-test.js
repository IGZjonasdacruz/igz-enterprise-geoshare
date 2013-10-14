var vows = require('vows'),
        assert = require('assert'),
        sanitize = require('validator').sanitize,
        async = require('async');

var VALID_USER = {
  id: '09477529074259',
  email: 'testuser@test.com',
  domain: 'test.com'
};

var lat = sanitize("40.421431").toFloat();
var lng = sanitize("-3.705434").toFloat();

var userManager = require('../lib/manager/user');
var userDao = require('../lib/dao/user');

vows.describe('manager/user.js').addBatch({
  '(reset) Remove all users.': {
    topic: function() {
      userDao.reset(this.callback);
    },
    'There is no error': function(err, result) {
      assert.equal(err, null);
    }
  },
  'Test user do not exists.': {
    topic: function() {
      userDao.get(VALID_USER.id, this.callback);
    },
    'Checking user saved.': function(err, userDB) {
      assert.equal(err, null);
      assert.equal(userDB, null);
    }
  }
}).addBatch({
  '(saveLocation) Invalid params.': {
    topic: function() {
      userManager.saveLocation(undefined, undefined, undefined, this.callback);
    },
    'Invalid parameters': function(err, userDB) {
      assert(err);
      assert.equal(userDB, null);
    }
  },
  '(saveLocation) Invalid position param.': {
    topic: function() {
      userManager.saveLocation(VALID_USER, 1, 'string', this.callback);
    },
    'Invalid position param': function(err, userDB) {
      assert(err);
      assert.equal(userDB, null);
    }
  },
  '(saveLocation) Valid position.': {
    topic: function() {
      userManager.saveLocation(VALID_USER, lat, lng, this.callback);
    },
    'Check save callback': function(err, userDB) {
      assert.equal(err, null);
      assert(userDB);

      assert.equal(userDB._id, VALID_USER.id, 'Saved user should have the same fields.');
      assert.equal(userDB.domain, VALID_USER.domain, 'Saved user should have the same fields.');
      assert.equal(userDB.email, VALID_USER.email, 'Saved user should have the same fields.');

      assert.equal(userDB.location.coordinates[0], lng, 'Saved user lng position should be the same.');
      assert.equal(userDB.location.coordinates[1], lat, 'Saved user lat position should be the same.');

    },
    'User saved correctly.': {
      topic: function(userDB) {
        userDao.get(VALID_USER.id, this.callback);
      },
      'Checking user saved.': function(err, userDB) {
        assert.equal(err, null);

        assert.equal(userDB._id, VALID_USER.id, 'Saved user should have the same fields.');
        assert.equal(userDB.domain, VALID_USER.domain, 'Saved user should have the same fields.');
        assert.equal(userDB.email, VALID_USER.email, 'Saved user should have the same fields.');

        assert.equal(userDB.location.coordinates[0], lng, 'Saved user lng position should be the same.');
        assert.equal(userDB.location.coordinates[1], lat, 'Saved user lat position should be the same.');
      }
    }
  }
}).addBatch({
  '(myNearestContacts) Invalid user.': {
    topic: function() {
      userManager.myNearestContacts(undefined, this.callback);
    },
    'Invalid parameters': function(err, result) {
      assert(err);
      assert.equal(result, null);
    }
  },
  '(myNearestContacts) Invalid user id.': {
    topic: function() {
      userManager.myNearestContacts({}, this.callback);
    },
    'Invalid parameters': function(err, result) {
      assert(err);
      assert.equal(result, null);
    }
  },
  '(myNearestContacts) Invalid user domain.': {
    topic: function() {
      userManager.myNearestContacts({id: 09477529074259}, this.callback);
    },
    'Invalid parameters': function(err, result) {
      assert(err);
      assert.equal(result, null);
    }
  },
  '(myNearestContacts) valid user, no contacts.': {
    topic: function() {
      userManager.myNearestContacts(VALID_USER, this.callback);
    },
    'Valid parameters': function(err, result) {
      assert.equal(err, null);
      assert.equal(result.length, 0);
    }
  }
}).addBatch({
  '(myNearestContacts) valid user with contacts.': {
    topic: function() {
      
      var that = this;
      
      var VALID_USER2 = {
        id: '09477529074260',
        email: 'testuser2@test.com',
        domain: 'test.com'
      };
      var VALID_USER3 = {
        id: '09477529074261',
        email: 'testuser3@test2.com',
        domain: 'test2.com'
      };
      var VALID_USER4 = {
        id: '09477529074261',
        email: 'testuser4@test.com',
        domain: 'test.com'
      };

      async.series([
        function(callback) {
          userManager.saveLocation(VALID_USER2, lat + 0.00001, lng, callback);
        },
        function(callback) {
          userManager.saveLocation(VALID_USER3, lat + 0.00001, lng, callback);
        },
        function(callback) {
          userManager.saveLocation(VALID_USER4, lat + 1, lng, callback);
        },
        function(callback) {
          userManager.myNearestContacts(VALID_USER, callback);
        }
      ], function(err, results) {
        that.callback(err, results);
      });
    },
    'Retrieved nearest contacts': function(err, results) {
      assert.equal(err, null);
      assert.equal(results.length, 4);
      var contacts = results[3];
      assert.equal(contacts.length, 1);
      assert.equal(contacts[0].email, 'testuser2@test.com');
    }
  }
}).export(module);