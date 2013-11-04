var logger = require('../util/logger')(__filename),
		request = require('request'),
		async = require('async');


const BASE_URL = 'https://www.googleapis.com/calendar/v3/';

function doCall(method, path, accessToken, done) {
	request({
		headers: {
			authorization: 'Bearer ' + accessToken
		},
		url: BASE_URL + path,
		method: method

	}, function(err, res, body) {
		logger.info('err=' + err + ', method=' + method + ', path=' + path + ', res.statusCode=' + res.statusCode + ', accessToken=' + accessToken);

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

function calendars(accessToken, done) {
	doCall('GET', 'users/me/calendarList', accessToken, function(err, calendars) {
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

function upcomingEventsFromCalendar(accessToken, calendarId, done) {
	var time = new Date();
	var timeMin = time.toISOString();
	time.setHours(time.getHours() + 24);
	var timeMax = time.toISOString();

	var url = 'calendars/' + encodeURIComponent(calendarId) + "/events?timeMin=" + timeMin + "&timeMax=" + timeMax;
	doCall('GET', url, accessToken, function(err, events) {
		if (err) {
			return done(err, null);
		}

		var results = [];


		if (events && events.items) {
			events.items.forEach(function(event) {
				if (event.kind === "calendar#event") {
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


function allUpcomingEvents(accessToken, done) {
	calendars(accessToken, function(err, calendars) {
		if (err) {
			return done(err, null);
		}

		async.each(calendars, function(calendar, callback) {
			upcomingEventsFromCalendar(accessToken, calendar.id, function(err, events) {
				if (err) {
					callback(err);
				} else {					calendar.events = events;
					callback();
				}
			});
		}, function(err) {
			done(err, calendars);
		});

	});
}

module.exports = {
	calendars: calendars,
	upcomingEventsFromCalendar: upcomingEventsFromCalendar,
	allUpcomingEvents: allUpcomingEvents
};