iris.ui(function(self) {

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.list_item.html);
	};

	self.render = function(me, contact) {
		self.inflate({
			email: contact.email,
			emailto: 'mailto:' + contact.email,
			photo: contact.photo,
			distance: contact.distance
		});
	};

}, iris.path.ui.list_item.js);