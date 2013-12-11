var logger = require('../util/logger')(__filename),
		request = require('request'),
		async = require('async'),
		geo = require('../util/geo'),
		util = require('../util/util');


var BASE_URL_CALENDAR = 'https://www.googleapis.com/calendar/v3/';


function calendars(user, done) {

	util.doCall('GET', BASE_URL_CALENDAR, 'users/me/calendarList', user.accessToken, function(err, calendars) {
		if (err) {
			return done(err, null);
		}

		var results = [];
		if (calendars && calendars.items) {

			calendars.items.forEach(function(calendar) {
			
				//logger.info('Calendar kind ', calendar.kind);

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

		logger.info('User "' + user.name + '" has ' + results.length + ' calendars');
		done(null, results);

	});
}

function checkAttendee(user, event) {
	if (event.creator && event.creator.email === user.email || event.organizer && event.organizer.email === user.email) {
		return true;
	}
	
	if (event.attendees) {
		return rdo = event.attendees.some(function(attendee) {
			return attendee.email === user.email && attendee.responseStatus === "accepted";
		});
	}
}

function upcomingEventsFromCalendar(user, calendarId, done) {
	var time = new Date();
	var timeMin = time.toISOString();
	time.setHours(time.getHours() + 24);
	var timeMax = time.toISOString();

	var url = 'calendars/' + encodeURIComponent(calendarId) + "/events?singleEvents=true&timeMin=" + timeMin + "&timeMax=" + timeMax;
	util.doCall('GET', BASE_URL_CALENDAR, url, user.accessToken, function(err, events) {
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

					logger.info('Event "' + event.summary + '" location = ' + event.location);
					if (event.location) {
						item.location = event.location;
					}
					results.push(item);
				}
			});
		}

		logger.info('calendar ' + calendarId + ' has ' + results.length + ' events.');
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
				logger.info('Searching for event address = ' + event.address, event);

				if (!event.address) {
					return callback();
				}
				
				geo.geoLoc(event, callback);
			});

			q.drain = function() {
				done(null, results);
			};

			//Creates a fake task to ensure q.drain method is called
			q.push({});

			if (calendars) {
				calendars.forEach(function(calendar) {


					logger.info('Calendar "' + calendar.summary + '" has ' + calendar.events.length + ' events');
					if (calendar && calendar.events) {
						calendar.events.forEach(function(event) {
							var location = event.location || calendar.location;
							logger.info('Location "' + location + '"', event);
							if (location) {

								event.address = location;
								event.idCalendar = calendar.id;
								results.push(event);
								q.push(event, function(err) {
									if (err) {
										logger.error("Error: " + err);
									}
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