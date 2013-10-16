var should = require('should'),
				sanitize = require('validator').sanitize;

var VALID_USER = {
	_id: '09477529074259',
	email: 'testuser@test.com',
	domain: 'test.com'
};

var lat = sanitize("40.421431").toFloat();
var lng = sanitize("-3.705434").toFloat();

var userManager = require('../lib/manager/user');
var userDao = require('../lib/dao/user');


describe('manager/user.js', function() {

	beforeEach(function(done){
		userDao.reset(function () {
			userDao.get(VALID_USER._id, function(err, userDB) {
				should.not.exist(err);
				should.not.exist(userDB);
				done();
			});
		});
	});

	describe('saveLocation', function() {
		it('There is no error', function(done) {
			userManager.saveLocation(undefined, undefined, undefined, function(err, userDB) {
				should.exist(err);
				should.not.exist(userDB);
				done();
			});
		});

		it('Invalid position param', function(done) {
			userManager.saveLocation(VALID_USER, 1, 'string', function(err, userDB) {
				should.exist(err);
				should.not.exist(userDB);
				done();
			});
		});

		it('Valid position', function(done) {
			userManager.saveLocation(VALID_USER, lat, lng, function(err, userDB) {
				should.not.exist(err);
				should.exist(userDB);
				userDB._id.should.equal(VALID_USER._id);
				userDB.domain.should.equal(VALID_USER.domain);
				userDB.email.should.equal(VALID_USER.email);
				userDB.location.coordinates[0].should.equal(lng);
				userDB.location.coordinates[1].should.equal(lat);
				done();
			});
		});
	});

	describe('myNearestContacts', function() {

		describe('Invalid parameters', function() {
			it('Invalid user', function(done) {
				userManager.myNearestContacts(undefined, function(err, result) {
					should.exist(err);
					should.not.exist(result);
					done();
				});
			});
			it('Invalid user id', function(done) {
				userManager.myNearestContacts({}, function(err, result) {
					should.exist(err);
					should.not.exist(result);
					done();
				});
			});
			it('Invalid user domain', function(done) {
				userManager.myNearestContacts({_id: VALID_USER._id}, function(err, result) {
					should.exist(err);
					should.not.exist(result);
					done();
				});
			});
		});

		describe('Valid parameters', function() {

			beforeEach(function (done) {
				// Create user
				userManager.saveLocation(VALID_USER, lat, lng, function(err, userDB) {
					should.not.exist(err);
					should.exist(userDB);
					userDB._id.should.equal(VALID_USER._id);
					userDB.domain.should.equal(VALID_USER.domain);
					userDB.email.should.equal(VALID_USER.email);
					userDB.location.coordinates[0].should.equal(lng);
					userDB.location.coordinates[1].should.equal(lat);
					done();
				});
			});

			it('valid user, no contacts', function(done) {
				userManager.myNearestContacts(VALID_USER, function(err, result) {
					should.not.exist(err);
					result.should.be.an.instanceOf(Array).and.be.empty;
					done();
				});
				describe('valid user with contacts', function() {
					it('Add a near user of the same domain', function(done) {
						userManager.saveLocation({
							_id: '09477529074260',
							email: 'testuser2@test.com',
							domain: 'test.com'
						}, lat + 0.00001, lng, done);
					});
					it('Add a near user of the other domain', function(done) {
						userManager.saveLocation({
							_id: '09477529074261',
							email: 'testuser3@test2.com',
							domain: 'test2.com'
						}, lat + 0.00001, lng, done);
					});
					it('Add a remote user of the same domain', function(done) {
						userManager.saveLocation({
							_id: '09477529074262',
							email: 'testuser4@test.com',
							domain: 'test.com'
						}, lat + 10, lng, done);
					});
					it('Retrieve the nearest contacts', function(done) {
						userManager.myNearestContacts(VALID_USER, function(err, result) {
							should.not.exist(err);
							result.should.be.an.instanceOf(Array).with.a.lengthOf(1);
							result[0].email.should.equal('testuser2@test.com');
							done();
						});
					});

				});
			});
		});

	});

	describe('ChangeGcmId', function() {

		beforeEach(function (done) {
			// Create user
			userManager.saveLocation(VALID_USER, lat, lng, function(err, userDB) {
				should.not.exist(err);
				should.exist(userDB);
				userDB._id.should.equal(VALID_USER._id);
				userDB.domain.should.equal(VALID_USER.domain);
				userDB.email.should.equal(VALID_USER.email);
				userDB.location.coordinates[0].should.equal(lng);
				userDB.location.coordinates[1].should.equal(lat);
				done();
			});
		});

		it('Invalid gcm id', function (done) {
			userManager.changeGcmId(VALID_USER, null, function (err, result) {
				should.exist(err);
				should.not.exist(result);
				done();
			})
		});

		it('Valid gcm id', function (done) {
			const VALID_GCM_ID = '123456789012345678901234567890';

			userManager.changeGcmId(VALID_USER, VALID_GCM_ID, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				result.should.equal(1);

				userDao.get(VALID_USER._id, function (err, userDB) {
					should.not.exist(err);
					should.exist(userDB);
					should.exist(userDB.gcmId);
					userDB.gcmId.should.equal(VALID_GCM_ID);
					done();
				});
			});
		});
	});
});