iris.ui(function(self) {


	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.item.html);
	};

	self.render = function(me, contact) {
		self.inflate({
			email: contact.email,
			emailto: 'mailto:' + contact.email,
			photo: 'https://profiles.google.com/s2/u/0/photos/profile/' + contact._id + '?sz=50',
			distance: contact.distance
		});
	};

}, iris.path.ui.item.js);