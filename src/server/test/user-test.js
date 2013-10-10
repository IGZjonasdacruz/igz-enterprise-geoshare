var vows = require('vows'),
    assert = require('assert');

var VALID_USER = {id:1,email:'test@test.com', domain: 'test.com'};

vows.describe('User Resource').addBatch({
    'saveLocation': {
        topic: require('../lib/manager/user'),

        'invalid params 1': function (userManager) {
          assert.throws(
            function() {
              userManager.saveLocation();
            }
          );
        },
        'invalid postion param': function (userManager) {
          assert.throws(
            function() {
              userManager.saveLocation(VALID_USER, 1);
            }
          );
        },
        'valid params': function (userManager) {
          userManager.saveLocation(VALID_USER, 1, 1, function () {
            userManager.get(VALID_USER.id, function (err, userDB) {
              assert.deepEqual(userDB, VALID_USER, 'saved user has the same fields')
            })
          });
        }
    }
}).export(module);


/*
var APIeasy = require('api-easy'),
      assert = require('assert');

var suite = APIeasy.describe('your/awesome/api');

suite.discuss('User resource, set position')
     .use('localhost', 3000)
     .setHeader('Content-Type', 'application/json')
     .post('/user/me/location')
      .expect(401)
     .export(module);
*/
