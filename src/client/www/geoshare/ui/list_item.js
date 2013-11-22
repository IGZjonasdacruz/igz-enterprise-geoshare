iris.ui(function(self) {

	var appRes = iris.resource(iris.path.resource.app);
	self.settings = {
		eventsType: appRes.eventsType.now
	};

	var hangout = null;

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.list_item.html);
		hangout = self.ui('hangout', iris.path.ui.hangout.js);

	};

	self.render = function(me, contact) {
		var data = {
			name: contact.name || "???",
			email: contact.email || "???",
			emailto: contact.email ? 'mailto:' + contact.email : '',
			photo: contact.photo ? contact.photo : '',
			distance: contact.distance || contact.distance === 0 ? iris.number(contact.distance / 1000, {precision: 0}) : '???',
			address: contact.formatted_address,
			showTime: self.setting('eventsType') !== appRes.eventsType.now,
			showDistance: self.setting('eventsType') === appRes.eventsType.now || self.setting('eventsType') === appRes.eventsType.overlay,
			showHangout: self.setting('eventsType') !== appRes.eventsType.me,
			showAddress: self.setting('eventsType') === appRes.eventsType.me,
			showDuration: false
		};

		if (contact.overlappingTime) {
			data.duration = isNumber(contact.overlappingTime.duration) ? formatTime(contact.overlappingTime.duration) : '???';
			data.from = contact.overlappingTime.start ? formatDate(contact.overlappingTime.start) : '???';
			data.to = contact.overlappingTime.end ? formatDate(contact.overlappingTime.end) : '???';
			data.isGap = contact.overlappingTime.duration < 0 ? true : false;
		} else if (self.setting('eventsType') === appRes.eventsType.me || self.setting('eventsType') === appRes.eventsType.contacts) {
			data.showDuration = true;
			data.duration = contact.start && contact.end ? formatTime(contact.end - contact.start) : '???';
			data.from = contact.start ? formatDate(contact.start) : '???';
			data.to = contact.end ? formatDate(contact.end) : '???';
			data.isGap = false;
		}

		if (self.setting('eventsType') === appRes.eventsType.overlay) {
			
			self.get('distance').popover({
				title: 'Your event location:',
				html: true,
				content: contact.formatted_address ? '<a href=https://maps.google.es/maps?q=' + encodeURI(contact.formatted_address) + '>' + contact.formatted_address + '</a>' : '',
				placement: "auto top"
			});

			self.get('from').tooltip({
				title: 'You\'ll be there at<br>' + (new Date(contact.time_me.start)).toLocaleTimeString(iris.locale()) + " " + (new Date(contact.time_me.start)).toLocaleDateString(iris.locale()),
				html: true,
				placement: "auto top",
				trigger: 'click'
			});

			self.get('to').tooltip({
				title: 'You\'ll be there until<br>' + (new Date(contact.time_me.end)).toLocaleTimeString(iris.locale()) + " " + (new Date(contact.time_me.end)).toLocaleDateString(iris.locale()),
				html: true,
				placement: "auto top",
				trigger: 'click'
			});

		}

		self.inflate(data);

		hangout && hangout.render(contact);

	};

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function formatDate(stringDate) {
		var date = new Date(stringDate);
		//return date.toLocaleTimeString(iris.locale()) + " " + date.toLocaleDateString(iris.locale());
		return date.toLocaleTimeString(iris.locale()).substring(0, 5);
	}

	function formatTime(milliseconds) {

		function format(time) {
			time = "0" + String(time);
			return time.substring(time.length - 2, time.length);
		}

		var s = Math.abs(Math.round(milliseconds / 1000));
		var h = Math.floor(s / 3600);
		s = s - h * 3600;
		var m = Math.floor(s / 60);
		s = s - m * 60;

		return (milliseconds < 0 ? "-" : "") + format(h) + ":" + format(m);// + ":" + format(s);

	}

}, iris.path.ui.list_item.js);