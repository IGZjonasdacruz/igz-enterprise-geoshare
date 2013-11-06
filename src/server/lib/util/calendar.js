var logger = require('../util/logger')(__filename),
		request = require('request'),
		async = require('async');


var BASE_URL_CALENDAR = 'https://www.googleapis.com/calendar/v3/',
		BASE_URL_MAPS = 'https://maps.googleapis.com/maps/api/';

function doCall(method, BASE_URL, path, accessToken, done) {
	request({
		headers: {
			authorization: 'Bearer ' + accessToken
		},
		url: BASE_URL + path,
		method: method

	}, function(err, res, body) {
		//logger.info('err=' + err + ', method=' + method + ', path=' + path + ', res.statusCode=' + res.statusCode + ', accessToken=' + accessToken);

		if (err) {
			return done(err, null);
		}

		if (res.statusCode === 200) {
			var json = JSON.parse(body);
			done(null, json);
		} else {
			done('status code ' + res.statusCode, null);
		}
	});
}

function calendars(user, done) {
	doCall('GET', BASE_URL_CALENDAR, 'users/me/calendarList', user.accessToken, function(err, calendars) {
		if (err) {
			return done(err, null);
		}
		var results = [];
		if (calendars && calendars.items) {
			calendars.items.forEach(function(calendar) {
				if (calendar.kind === "calendar#calendarListEntry") {
					var item = {};
					item.id = calendar.id;
					item.summary = calendar.summary;
					if (calendar.location) {
						item.location = calendar.location;
					}
					results.push(item);
				}
			});
		}

		done(null, results);

	});
}

function checkAttendee(user, event) {
	return true;
	if (event.creator && event.creator.email === user.email || event.organizer && event.organizer.email === user.email) {
		return true;
	}
	
	if (event.attendees) {
		return rdo =event.attendees.some(function(attendee) {
			return attendee.email === user.email && attendee.responseStatus === "accepted";
		});
	}
}

function upcomingEventsFromCalendar(user, calendarId, done) {
	var time = new Date();
	var timeMin = time.toISOString();
	time.setHours(time.getHours() + 24);
	var timeMax = time.toISOString();

	var url = 'calendars/' + encodeURIComponent(calendarId) + "/events?timeMin=" + timeMin + "&timeMax=" + timeMax;
	doCall('GET', BASE_URL_CALENDAR, url, user.accessToken, function(err, events) {
		if (err) {
			return done(err, null);
		}

		var results = [];
		if (events && events.items) {
			events.items.forEach(function(event) {
				if (event.kind === "calendar#event" && checkAttendee(user, event)) {
					var item = {};
					item.id = event.id;
					item.summary = event.summary;
					item.start = event.start;
					item.end = event.end;
					if (event.location) {
						item.location = event.location;
					}
					results.push(item);
				}
			});
		}

		done(null, results);
	});
}


function allUpcomingEvents(user, done) {
	calendars(user, function(err, calendars) {
		if (err) {
			return done(err, null);
		}

		async.each(calendars, function(calendar, callback) {

			upcomingEventsFromCalendar(user, calendar.id, function(err, events) {
				if (err) {
					callback(err);
				} else {
					calendar.events = events;
					callback();
				}
			});
		}, function(err) {

			if (err) {
				return done(err, null);
			}

			var results = [];
			var q = async.queue(function(event, callback) {
				if (!event.address) {
					return callback();
				}
				var url = "geocode/json?address=" + event.address + "&sensor=true";
				doCall('GET', BASE_URL_MAPS, url, user.accessToken, function(err, results) {
					if (results.status === 'OK' && results.results && results.results.length > 0) {
						if (results.results[0].geometry) { //Gets the first location
							event.formatted_address = results.results[0].formatted_address;
							event.location = results.results[0].geometry.location;
						}
					}
					callback();
				});
			});

			q.drain = function() {
				done(null, results);
			};

			//Creates a fake task to ensure q.drain method is called
			q.push({}, function(err) {
			});

			if (calendars) {
				calendars.forEach(function(calendar) {
					if (calendar && calendar.events) {
						calendar.events.forEach(function(event) {
							var location = event.location || calendar.location;
							if (location) {
								event.address = location;
								event.idCalendar = calendar.id;
								results.push(event);
								q.push(event, function(err) {
								});
							}

						});
					}
				});
			}
		});
	});
}

module.exports = {
	upcomingEvents: allUpcomingEvents
};