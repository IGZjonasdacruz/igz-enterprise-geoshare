iris.resource(function(self) {

	var nearestContacts = [],
			futureNearestContacts = null,
			events = null,
			contactEvents = null,
			me = null;

	self.eventsType = {
		now: 'now',
		overlay: 'overlay',
		contacts: 'contacts',
		me: 'me'
	};

	self.signIn = function(lat, lng) {
		return self.post("sign-in", {lat: lat, lng: lng}).done(function(data) {
			iris.log('signIn done');

			me = data.user;
			nearestContacts = data.nearestContacts;
		});
	};

	self.signOut = function() {
		return self.get("sign-out").done(function() {
			iris.log('signOut done');
			self.reset();
		});
	};

	self.sendShareMode = function(shareMode) {
		return self.put("user/me/shareMode", {shareMode: shareMode}).done(function(data) {
			iris.log('sendShareMode done');
			me.shareMode = shareMode;
		});
	};

	self.sendGcmId = function(gcmId) {
		return self.put("user/me/gcm-id", {gcmId: gcmId});
	};

	self.me = function() {
		return me;
	};

	self.events = function() {
		var dfd = new jQuery.Deferred();

		if (events) {
			dfd.resolve(events);
			return dfd.promise();
		} else {
			return self.get("user/me/events").done(function(data) {
				Array.isArray(data) && data.forEach(function(event) {
					event.email = self.me().email;
					event.name = self.me().name;
					event.photo = self.me().photo;
				});
				data.eventsType = self.eventsType.me;
				iris.log('me events retrieved', data);
				events = data;
			});
		}

	};

	self.contactEvents = function() {
		var dfd = new jQuery.Deferred();

		if (contactEvents) {
			dfd.resolve(contactEvents);
			return dfd.promise();
		} else {
			return self.get("user/me/contactEvents").done(function(data) {
				data.eventsType = self.eventsType.contacts;
				iris.log('me contactEvents retrieved', data);
				contactEvents = data;
			});
		}

	};

	self.nearestContacts = function() {
		nearestContacts.eventsType = self.eventsType.now;
		return nearestContacts;
	};

	self.futureNearestContacts = function() {
		var dfd = new jQuery.Deferred();

		if (futureNearestContacts) {
			dfd.resolve(futureNearestContacts);
			return dfd.promise();
		} else {
			return self.get("user/me/futureNearestContacts").done(function(data) {
				Array.isArray(data) && data.sort(function(eventA, eventB) {
					if (eventA.overlappingTime && eventA.overlappingTime.start && eventB.overlappingTime && eventB.overlappingTime.start) {
						return eventA.overlappingTime.start - eventB.overlappingTime.start;
					} else {
						return 0;
					}
				});
				data.eventsType = self.eventsType.overlay;
				iris.log('futureNearestContacts retrieved', data);
				futureNearestContacts = data;
			});
		}

	};

	self.reset = function() {
		nearestContacts = [];
		me = null;
		futureNearestContacts = null;
		events = null;
		contactEvents = null;
	};

	self.addNearContact = function(data) {
		var contact = data.user;
		for (var f = 0, F = nearestContacts.length; f < F; f++) {
			if (nearestContacts[f].email === contact.email) {
				break;
			}
		}
		nearestContacts[f] = contact;

		if (f === F) {
			// New user
			iris.notify('notify', {msg: 'The user "' + contact.name + '" has been discovered!'});
		}

		iris.notify('refresh-nearest-contacts');
	};

}, iris.path.resource.app);
