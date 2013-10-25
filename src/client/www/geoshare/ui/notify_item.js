iris.ui(function(self) {
	
	self.settings({
		msg : "",
		timeout : 4000,
		type : 'info' // (success|info|warning|danger)
	});

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.notify_item.html);
		
		self.inflate( { msg : self.setting("msg") } );
		
		self.get().addClass('alert-' + self.setting('type')).hide().fadeIn(800);

		self.get('close_btn').on('click', destroy);

		if ( self.setting('timeout') ) {
			setTimeout(destroy, self.setting('timeout'));
		}
	};

	function destroy () {
		self.destroyUI();
	}

}, iris.path.ui.notify_item.js);
