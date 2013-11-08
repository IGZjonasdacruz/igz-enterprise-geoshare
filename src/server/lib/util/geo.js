var logger = require('../util/logger')(__filename),
		util = require('../util/util');

var BASE_URL_MAPS = 'https://maps.googleapis.com/maps/api/';

/**
 * Get the distance between two coordinates in meters.
 * 
 * @param  {array} coordinatesA Array like [lng, lat]
 * @param  {array} coordinatesB Array like [lng, lat]
 * 
 * @return {float}      Distance in meters.
 */
function distance(coordinatesA, coordinatesB) {

	// Distance between two points using the Haversine formula:
	// http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points

	var lat1 = coordinatesA[1],
			lon1 = coordinatesA[0],
			lat2 = coordinatesB[1],
			lon2 = coordinatesB[0];

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

/**
 * Try to geolocalize the event. Asign the first found localization
 * @param {event} event
 * @param {function} callback
 */
function geoLoc(event, callback) {
	var url = "geocode/json?address=" + event.address + "&sensor=true";
	util.doCall('GET', BASE_URL_MAPS, url, null, function(err, results) {
		if (err) {
			return callback(err);
		}
		if (results.status === 'OK' && results.results && results.results.length > 0) {
			if (results.results[0].geometry) { //Gets the first location
				event.formatted_address = results.results[0].formatted_address;
				event.location = results.results[0].geometry.location;
				
				logger.info('Found ' + results.results.length + ' geocoordinates for the event ' + event.event + ", user " + event.user);

			}
		}
		callback();
	});
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}

module.exports = {
	distance: distance,
	geoLoc: geoLoc
};
