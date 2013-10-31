iris.ui(function(self) {

	self.create = function() {
		self.tmpl(iris.path.ui.hangout.html);
	};

	self.render = function(contact) {
		var link = self.get('hangout');
		setUpHangout(link, contact);
	};
	
}, iris.path.ui.hangout.js);