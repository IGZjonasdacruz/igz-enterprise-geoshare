iris.ui(function(self) {

	self.create = function() {
		self.tmpl(iris.path.ui.list.html);
	};

	self.render = function(me, contacts) {
		var countText = contacts.length + " near contact" + (contacts.length !== 1 ? 's' : '');
		self.inflate({ countText: countText, hasContacts: contacts.length > 0 });

		contacts.forEach(function(contact) {
			self.ui("contacts", iris.path.ui.item.js).render(me, contact);
		});
		
		self.get().show();
	};

	self.reset = function() {
		self.destroyUIs('contacts');
		return self;
	};

}, iris.path.ui.list.js);