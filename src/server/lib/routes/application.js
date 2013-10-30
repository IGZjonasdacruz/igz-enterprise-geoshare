var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		userManager = require('../manager/user'),
		sanitize = require('validator').sanitize,
		check = require('validator').check;

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

	userManager.save(user, function(err, result) {

		if ( err ) {
			logger.error(err);
			return res.send(500);
		}

		userManager.myNearestContacts(user, function (err, contacts) {
			if ( err ) {
				logger.error(err);
				return res.send(500);
			}

			res.json({ user: user, nearestContacts : contacts });
		})

	});
}

/**
 * Revoke the access token of the identified user.
 * 
 * @param  {object} req request
 * @param  {object} res response
 * 
 * @return {json}     Status 200 if all goes well.
 */
function signOut (req, res) {
	userManager.logout(req.user, function (err) {
		if ( err ) {
			logger.error(err);
			return res.send(500);
		}

		res.json({status: 200});
	});	
}

module = module.exports = addRoutes;
