iris.ui(function(self) {

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.list_item.html);
	};

	self.render = function(me, contact) {
		self.inflate({
			name: contact.name || "???",
			email: contact.email || "???",
			emailto: contact.email ? 'mailto:' + contact.email : '',
			photo: contact.photo ? contact.photo : '',
			distance: contact.distance === 0 ? '0.00' : iris.number(contact.distance) || '???'
		});
	};

}, iris.path.ui.list_item.js);