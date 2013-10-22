iris.ui(function(self) {
	
	self.settings({
		msg : "",
		type : 'info' // (success|info|warning|danger)
	});

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.notify_item.html);
		
		self.inflate( { msg : self.setting("msg") } );
		
		self.get().addClass('alert-' + self.setting('type')).hide().fadeIn(800);
	};

}, iris.path.ui.notify_item.js);
