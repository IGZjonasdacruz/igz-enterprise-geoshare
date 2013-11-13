iris.ui(function(self) {

	self.settings = {
		isFuture: false
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
			distance: isNumber(contact.distance) ? iris.number(contact.distance) : '???',
			isFuture: self.setting('isFuture') 
		};

		if (contact.overlappingTime) {
			data.duration = isNumber(contact.overlappingTime.duration) ? formatTime(contact.overlappingTime.duration) : '???';
			data.from = contact.overlappingTime.start ? formatDate(contact.overlappingTime.start) : '???';
			data.to = contact.overlappingTime.end ? formatDate(contact.overlappingTime.end) : '???';
			data.isGap = contact.overlappingTime.duration < 0 ? true : false;
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
		return date.toLocaleTimeString(iris.locale());
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

		return ( milliseconds < 0 ? "-" : "" ) + format(h) + ":" + format(m) + ":" + format(s);

	}

}, iris.path.ui.list_item.js);