iris.ui(function(self) {

	var hangout = null;
	
	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.list_item.html);
		hangout = self.ui('hangout', iris.path.ui.hangout.js);
	};

	self.render = function(me, contact) {
		self.inflate({
			name: contact.name || "???",
			email: contact.email || "???",
			emailto: contact.email ? 'mailto:' + contact.email : '',
			photo: contact.photo ? contact.photo : '',
			distance: isNumber(contact.distance) ? iris.number(contact.distance) : '???'
		});
		
		hangout && hangout.render(contact);
		
	};

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

}, iris.path.ui.list_item.js);