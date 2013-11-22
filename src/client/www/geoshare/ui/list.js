iris.ui(function(self) {

	var appRes = iris.resource(iris.path.resource.app);
	
	self.settings = {
		eventsType: appRes.eventsType.now
	};

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.list.html);

		iris.on('refresh-nearest-contacts', self.render);
		self.render();
	};

	self.render = function() {
		var me = appRes.me();
		var contacts = self.setting('contacts');

		iris.log('[list] render, contacts=' + contacts.length);
		self.inflate({
			countText: countText(),
			hasContacts: contacts.length > 0,
			showTime: contacts.eventsType !== appRes.eventsType.now,
			showDistance: contacts.eventsType === appRes.eventsType.now || contacts.eventsType === appRes.eventsType.overlay,
			showHangout: contacts.eventsType !== appRes.eventsType.me,
			showAddress: contacts.eventsType === appRes.eventsType.me,
			showDuration: contacts.eventsType === appRes.eventsType.me || contacts.eventsType === appRes.eventsType.contacts
		});

		self.destroyUIs('contacts');
		contacts.forEach(function(contact) {
			self.ui("contacts", iris.path.ui.list_item.js, {eventsType: contacts.eventsType}).render(me, contact);
		});
	};

	self.reset = function() {
		self.destroyUIs('contacts');
		return self;
	};


	function countText() {
		var type = 'near contacts';
	
		switch (self.setting('contacts').eventsType) {
			case appRes.eventsType.me:
			case appRes.eventsType.contacts:
				type = 'future event locations';
				break;
			case appRes.eventsType.overlay:
				type = 'future overlapping events';
				break;
			
		}
		
	return self.setting('contacts').length + " " + type ;
	}
	

}, iris.path.ui.list.js);
