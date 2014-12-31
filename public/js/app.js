/*global $, window, document, navigator, console, XMLHttpRequest, Blob, saveAs*/
(function (w, d) {
	'use strict';
	
	
	/*
	 1. On load, check if online, unobtrusive alert if not
	 1.1 If online and the note already exists in localStorage and it's different from the db version, offer to overwrite db version
	 2. App-ify - full screen, icon/app shortcut
	 2.1 style the active state:
   outline: 0;
   -webkit-tap-highlight-color: rgba(0,0,0,0);
   -webkit-tap-highlight-color: transparent;
   -webkit-touch-callout: none;
   -webkit-user-select: none;
      -moz-user-select: none;
       -ms-user-select: none;
           user-select: none;
		  2.2 fullscreen - http://www.html5rocks.com/en/mobile/fullscreen/
		  
	
	*/
	
	var note,
		UTILS = {
			XHR : function (url, content) {
				var http = new XMLHttpRequest();

				http.onload = function () {
					if (http.status === 200) {
						console.log('Posted...');
					}
				};
				http.open('POST', url, true);
				http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
				http.send(content);
			},
			isOnline : function () {
				return ('onLine' in navigator && !!navigator.onLine);
			},
			closeModal : function () {
				d.body.className = d.body.className.split(' modal-on').join('');
			},
			on : function (el, ev, fn) {
				if (el.addEventListener) {
					el.addEventListener(ev, fn, false);
				} else {
					el.attachEvent('on' + ev, fn);
				}
				return this;
			},
			preventDefault : function (e) {
				return e.preventDefault ? e.preventDefault() : e.returnValue = false;
			},
			stopPropagation : function (e) {
				return e.stopPropagation ? e.stopPropagation() : false;
			},
			getSelectionStartNode : function (parent) {
				var node = d.getSelection().anchorNode,
					startNode = (node && node.nodeType === 3 ? node.parentNode : node);
				return startNode;
			},
			removeChildren : function (node) {
				while (node.firstChild) {
					node.removeChild(node.firstChild);
				}
			},
			htmlEntities: function (str) {
				// converts special characters (like <) into their escaped/encoded values (like &lt;).
				// This allows you to show to display the string without the browser reading it as HTML.
				return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
			},
			insertHTMLCommand : function (doc, html) {
				var selection,
					range,
					el,
					fragment,
					node,
					lastNode;

				if (doc.queryCommandSupported('insertHTML')) {
					return doc.execCommand('insertHTML', false, html);
				}

				selection = window.getSelection();
				if (selection.getRangeAt && selection.rangeCount) {
					range = selection.getRangeAt(0);
					range.deleteContents();

					el = doc.createElement("div");
					el.innerHTML = html;
					fragment = doc.createDocumentFragment();
					while (el.firstChild) {
						node = el.firstChild;
						lastNode = fragment.appendChild(node);
					}
					range.insertNode(fragment);

					// Preserve the selection:
					if (lastNode) {
						range = range.cloneRange();
						range.setStartAfter(lastNode);
						range.collapse(true);
						selection.removeAllRanges();
						selection.addRange(range);
					}
				}
			}

		};
	
	function Note() {
		this.init();
	}

	Note.prototype.init = function () {
		this.setter('storage', w.localStorage)
			.setter('id', w.location.pathname.substring(w.location.pathname.lastIndexOf("/") + 1))
			.setter('storeName', 'note-' + this.id)
			.setter('notepad', d.getElementById('note'))
			.setter('localNote', this.storage.getItem(this.storeName))
			.loadNote()
			.initListeners();
	};
		
	Note.prototype.initListeners = function () {
		var self = this;
		UTILS.on(d, 'keyup', function (e) {self.keyBinder.up.call(self, e); })
			 .on(d, 'keydown', function (e) {self.keyBinder.down.call(self, e); })
			 .on(d, 'paste', function (e) {self.pasteHandler.call(self, e); })
			 .on(d.getElementById('btn-email'), 'click', function (e) { self.mail.call(self, e); })
			 .on(d.getElementById('btn-download'), 'click', function (e) {self.download.call(self, e); });
		
		return this;
	};
	
	Note.prototype.setter = function (p, v) {
		this[p] = v;
		return this;
	};

	Note.prototype.keyBinder = {
		keyCodes : {
			13 : {
				key : 'enter',
				events : ['keyup']
			}
		},
		dispatchTable : {
			enter : function (e) {
				var self = this,
					node = UTILS.getSelectionStartNode(),
					tagName = node.tagName.toLowerCase();
				UTILS.preventDefault(e);
				if (!e.shiftKey) {
					d.execCommand('formatBlock', false, 'p');
				}
			}
		},
		up : function (e) {
			var self = this,
				node = UTILS.getSelectionStartNode();
			if (node && node.children.length === 0) {
				d.execCommand('formatBlock', false, 'p');
			}
			if (this.keyBinder.keyCodes[e.which] && ~this.keyBinder.keyCodes[e.which].events.join(' ').indexOf(e.type)) {
				UTILS.preventDefault(e);
				this.keyBinder.dispatchTable[this.keyBinder.keyCodes[e.which].key](e);
			}
			this.save();
			
			return this;
		},
		down : function (e) {
			var self = this,
				node = UTILS.getSelectionStartNode();
			if (this.keyBinder.keyCodes[e.which] && ~this.keyBinder.keyCodes[e.which].events.join(' ').indexOf(e.type)) {
				this.keyBinder.dispatchTable[this.keyBinder.keyCodes[e.which].key](e);
			}
		}
	};
	
	Note.prototype.load = {
		local : function () {
			this.notepad.innerHTML = this.localNote;
			this.save();
		},
		db : function () {
			this.notepad.innerHTML = w.n.content;
			this.save();
		}
	};
	
	Note.prototype.loadNote = function () {
		var self = this;
		if (UTILS.isOnline()) {
			if (self.localNote === w.n.content) {
				self.load.local.call(self);
			} else {
				d.body.className += ' modal-on';
				UTILS.on(d.getElementById('btn-local'), 'click', function () {
					console.log('local');
					self.load.local.call(self);
					UTILS.closeModal();
				})
					 .on(d.getElementById('btn-db'), 'click', function () {
					console.log('db');
						self.load.db.call(self);
						UTILS.closeModal();
					});
			}
		} else {
			self.load.local.call(self);
		}
		return this;
	};
	
	Note.prototype.pasteHandler = function (e) {
		var paragraphs,
			html = '',
			p,
			dataFormat = 'text/plain';

		if (w.clipboardData && e.clipboardData === undefined) {//IE
			e.clipboardData = w.clipboardData;
			dataFormat = 'Text';
		}

		if (e.clipboardData && e.clipboardData.getData) {
			UTILS.preventDefault(e);
			paragraphs = e.clipboardData.getData(dataFormat).split(/[\r\n]/g);
			for (p = 0; p < paragraphs.length; p += 1) {
				if (paragraphs[p] !== '') {
					if (navigator.userAgent.match(/firefox/i) && p === 0) {
						html += UTILS.htmlEntities(paragraphs[p]);
					} else {
						html += '<p>' + UTILS.htmlEntities(paragraphs[p]) + '</p>';
					}
				}
			}
			UTILS.insertHTMLCommand(d, html);
		}
	};
	
	Note.prototype.mail = function (e) {
		var self = this,
			form = d.getElementById('form-email'),
			field = d.getElementById('form-row-email'),
			off = function () {
				d.body.className = d.body.className.split(' app-form-mode').join('');
			};
			
		UTILS.preventDefault(e);
		e.stopPropagation();
			
		if (~d.body.className.indexOf(' app-form-mode')) {
			UTILS.XHR('/mail', 'content=' + this.extractText(this.sanitise.decode(this.notepad.innerHTML)) + '&form-row-email=' + encodeURI(field.value));
			off();
		} else {
			d.body.className += ' app-form-mode';
			field.focus();
			UTILS.on(d, 'click', off);
		}
		return this;
	};

	Note.prototype.extractText = function () {
		var self = this,
			extract = function (nodes) {
				var i,
					text = '',
					node,
					flag = false;

				for (i = 0; i < nodes.length; i += 1) {
					node = nodes[i];
					node.normalize();
					
					if (node !== undefined && node.nodeType === 3 && node.nodeValue !== '') {
						text += node.nodeValue;
						flag = false;
					} else {
						if (node !== undefined && node.nodeType === 1 && !flag) {
							text += '\n' + extract(node.childNodes);
							flag = true;
						}
					}
				}
				return text;
			};

		return extract(this.notepad.childNodes);

	};

	Note.prototype.save = function () {
		this.setter('localNote', this.sanitise.decode(this.notepad.innerHTML))
			.storage.setItem(this.storeName, this.localNote);
		UTILS.XHR('/push' + w.location.pathname, 'content=' + this.localNote);
		return this;
	};

	Note.prototype.download = function () {
		var blob = new Blob([this.sanitise.elements(this.sanitise.addnl(this.sanitise.decode(this.notepad.innerHTML)))], {type: "text/plain;charset=utf-8"});
		saveAs(blob, 'Note-' + this.id + '.txt');
		return this;
	};

	Note.prototype.sanitise = {
		addnl : function (content) {
			return content.trim().replace(/(<\/p>)/g, '\n');
		},
		decode : function (content) {
			var txtrea = d.createElement("textarea");
			txtrea.innerHTML = content;
			return txtrea.value;
		},
		elements : function (content) {
			return content.replace(/(<([^>]+)>)/ig, '');
		}
	};
	note = new Note();
	
}(window, document, undefined));