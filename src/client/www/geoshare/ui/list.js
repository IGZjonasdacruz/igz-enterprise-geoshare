iris.ui(function(self) {

	self.create = function() {
		self.tmpl(iris.path.ui.list.html);
	};

	self.render = function(me, contacts) {
		self.get('num-contacts').html(contacts.length + " near contact" + (contacts.length !== 1 ? 's' : ''));
		contacts.forEach(function(contact) {
			addContact(me, contact);
		});
		self.get().show();
	};

	self.reset = function() {
		self.ui("contacts").forEach(function(ui) {
			ui.reset();
		});
		return self;
	};
	
	function addContact(me, contact) {
		self.ui("contacts", iris.path.ui.item.js).render(me, contact);
	}

}, iris.path.ui.list.js);