var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		notification = require('../util/notification'),
		geoUtil = require('../util/geo'),
		gplus = require('../util/gplus'),
		userDao = require('../dao/user'),
		sanitize = require('validator').sanitize,
		check = require('validator').check,
		request = require('request');

function addRoutes (app) {

	app.post('/sign-in', ensureAuth, signIn);
	app.get('/sign-out', ensureAuth, signOut);

	logger.info('Application routes added');
}

/**
 * Creates or updates the user information: profile, location, gcmId (optional), etc...
 * 
 * @param  {object} req request
 * @param  {object} res response
 * 
 * @return {json}     The nearest contacts.
 */
function signIn (req, res) {

	var user = req.user;
	var lat = sanitize(req.body.lat).toFloat();
	var lng = sanitize(req.body.lng).toFloat();

	user.location = {
		type: "Point",
		coordinates: [lng, lat]
	};

	user.gcmId = req.body.gcmId;

	// gplus.people(user.accessToken, function (err, result) {
	// 	console.log('**** err=', err)
	// 	console.log('**** result=', result)
	// });

	userDao.save(user, function(err, result) {

		if ( err ) {
			logger.error(err);
			return res.send(500);
		}

		userDao.nearestContacts(user, function (err, contacts) {
			if ( err ) {
				logger.error(err);
				return res.send(500);
			}

			contacts.forEach(function(contact) {
				applyShareFilter(user, contact);
			});

			notification.sendToNearestContacts(user, contacts);
			res.json({ user: user, nearestContacts : contacts });
		})

	});
}

/**
 * Revoke the access token of the identified user and removes him from DB.
 * 
 * @param  {object} req request
 * @param  {object} res response
 * 
 * @return {json}     Status 200 if all goes well.
 */
function signOut (req, res) {
	request({
		url: 'https://accounts.google.com/o/oauth2/revoke?token=' + req.user.accessToken,
		method: "GET",
	}, function(err, response, body) {

		if (err) {
			logger.error(err);
			return res.send(500);
		}

		userDao.remove(req.user, function (err) {
			if ( err ) {
				logger.error(err);
				return res.send(500);
			}

			res.json({status: 200});
		});
	});
}



//
// Util
//

function applyShareFilter(user, contact) {
	var shareMode = contact.shareMode;
	if ( shareMode ) {
		Object.keys(contact).forEach(function(key) {
			if (key !== '_id' && shareMode.indexOf(key) === -1) {
				delete contact[key];
			}
		});
	}

	if ( !shareMode || shareMode.indexOf('distance') !== -1 ) {
		contact.distance = geoUtil.distance(user.location.coordinates, contact.location.coordinates);
	}
}

module = module.exports = addRoutes;
