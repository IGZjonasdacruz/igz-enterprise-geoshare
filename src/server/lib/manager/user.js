
var userDao = require('../dao/user'),
		notification = require('./notification.js'),
		assert = require('assert'),
		logger = require('../util/logger')(__filename),
		request = require('request');


function save(user, callback) {
	userDao.save(user, callback);
};

function remove(user, callback) {
	request({
		url: 'https://accounts.google.com/o/oauth2/revoke?token=' + user.accessToken,
		method: "GET",
	}, function(err, response, body) {

		if (err) {
			return callback(err);
		}

		userDao.remove(user._id, callback);
	});
};

function updateShareMode(user, shareMode, callback) {
	userDao.updateShareMode(user, shareMode, callback);
};

function updateGcmId(user, gcmId, callback) {
	userDao.updateGcmId(user, gcmId, callback);
};

function nearestContacts(user, callback) {
	userDao.nearestContacts(user, function(err, results) {

		if (err) {
			return callback(err);
		}
		var me = results.me;
		var contacts = results.contacts;

		contacts.forEach(function(contact) {
			applyShareFilter(me, contact);
		});

		callback(null, contacts);
	});
};

function applyShareFilter(me, contact) {
	var shareMode = contact.shareMode;
	var location = contact.location;
	if (Array.isArray(shareMode)) {
		Object.keys(contact).forEach(function(key) {
			if (key !== '_id' && shareMode.indexOf(key) === -1) {
				delete contact[key];
			}
		});
		if (shareMode.indexOf('distance') !== -1) {
			contact.distance = getDistanceFromLatLon(me, location);
		}
	} else {
		delete contact['shareMode'];
		contact.distance = getDistanceFromLatLon(me, location);
	}
}

// Distance between two points using the Haversine formula:
// http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
function getDistanceFromLatLon(me, location) {
	var lat1 = me.location.coordinates[1],
			lon1 = me.location.coordinates[0],
			lat2 = location.coordinates[1],
			lon2 = location.coordinates[0];

	function deg2rad(deg) {
		return deg * (Math.PI / 180);
	}

	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1);  // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2)
			;
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return parseInt(d * 1000, 10);
}

module = module.exports = {
	save : save,
	remove : remove,
	updateGcmId : updateGcmId,
	updateShareMode : updateShareMode,
	nearestContacts : nearestContacts
};
