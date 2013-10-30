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
			distance: isNumber(contact.distance) ? iris.number(contact.distance) : '???'
		});
		
		var link = self.get('hangout');
		if (geoshare.isBrowser) {
			link.attr('href', 'https://plus.google.com/hangouts/_?gid=' + geosharecfg.google_project_id);
		} else {
			link.click(function() {
				mobileHangout(contact);
				return false;
			});	
		}
	};

	function mobileHangout(contact) {
		CDV.WEBINTENT.startActivity(
			{
				action: CDV.WEBINTENT.ACTION_VIEW,
				url: 'https://plus.google.com/' + contact._id
			},
			function() {
				iris.log('Started Google+ for ' + contact._id);
			},
			function(err) {
				iris.notify('notify', {msg: 'Error: cannot open Google+'});
				iris.log('Error: cannot open Google', err);
			}
		);
	}

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

}, iris.path.ui.list_item.js);