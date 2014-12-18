/*global $, window, document, console, XMLHttpRequest, Blob, saveAs*/
(function (w, d) {
	'use strict';
	
	/*
	 * LOOK AT MEDIUM EDITOR
	 * 	- how does it handle 
	 * 		- key down/up events
	 *		- enter/p
	 */
	
	var UTILS = {
			XHR : function (url, content) {
				var http = new XMLHttpRequest();

				http.onload = function () {
					if (http.status == 200) {
					}
				};
				http.open('POST', url, true);
				http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
				http.send(content);
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
			},/*
			setCaretPosition : function (target, index) {
				var selection = w.getSelection(),
					range = selection.getRangeAt(0);

				range.collapse(true);
				
				range.setStart(target.childNodes[0], index);
				range.collapse(true);

				selection.removeAllRanges();
				selection.addRange(range);
			},
			getCaretPosition : function (source) {
				var selection = w.getSelection(),
					range = selection.getRangeAt(0);
				
				range.setStart((source.childNodes[0] || source), 0);
				
				return range.toString().length;
			},
			getLastTypedLetter : function () {
				var selection = w.getSelection(),
					range = selection.getRangeAt(0);
				range.setStart(range.startContainer, range.startOffset - 1);
				console.log(range.toString());
			},*/
			getSelectionStartNode : function (parent) {
				var node = d.getSelection().anchorNode,
					startNode = (node && node.nodeType === 3 ? node.parentNode : node);
				return startNode;
			},
			removeChildren : function (node) {
				while (node.firstChild) {
					node.removeChild(node.firstChild);
				}
			}
		};
	
	function Note () {
		this.init();
	}

	Note.prototype.init = function () {
		this.setter('storage', w.localStorage)
			.setter('id', w.location.pathname.substring(w.location.pathname.lastIndexOf("/") + 1))
			.setter('storeName', 'note-' + this.id)
			.setter('savedNote', (this.storage.getItem(this.storeName) || ''))
			.setter('notepad', d.getElementById('note'))
			.setter('newlineSymbol', '!')
			//.setter('caretPosition', 0)
			.initListeners()
			.loadNote()
			.notepad.focus();
	};

	Note.prototype.initListeners = function () {
		var self = this;
		UTILS.on(d, 'keyup', function (e) {self.keyBinder.up.call(self, e);})
			 .on(d, 'keydown', function (e) {self.keyBinder.down.call(self, e);})
		     .on(this.notepad, 'click', function () {
				 //self.caretPosition = UTILS.getCaretPosition(self.notepad);
				console.log('click...');
			 })
			 .on(d.getElementById('btn-email'), 'click', self.mail)
			 .on(d.getElementById('btn-download'), 'click', self.download);
		
		return this;
	};
	
	/*
	bindParagraphCreation: function (index) {
            var self = this;
            this.on(this.elements[index], 'keypress', function (e) {
                var node = getSelectionStart.call(self),
                    tagName;
                if (e.which === 32) {
                    tagName = node.tagName.toLowerCase();
                    if (tagName === 'a') {
                        document.execCommand('unlink', false, null);
                    }
                }
            });

            this.on(this.elements[index], 'keyup', function (e) {
                var node = getSelectionStart.call(self),
                    tagName,
                    editorElement;

                if (node && node.getAttribute('data-medium-element') && node.children.length === 0 && !(self.options.disableReturn || node.getAttribute('data-disable-return'))) {
                    document.execCommand('formatBlock', false, 'p');
                }
                if (e.which === 13) {
                    node = getSelectionStart.call(self);
                    tagName = node.tagName.toLowerCase();
                    editorElement = self.getSelectionElement();

                    if (!(self.options.disableReturn || editorElement.getAttribute('data-disable-return')) &&
                        tagName !== 'li' && !self.isListItemChild(node)) {
                        if (!e.shiftKey) {
                            document.execCommand('formatBlock', false, 'p');
                        }
                        if (tagName === 'a') {
                            document.execCommand('unlink', false, null);
                        }
                    }
                }
            });
            return this;
        },
	*/
	
	
	
	Note.prototype.setter = function (p, v) {
		this[p] = v;
		return this;
	};

	Note.prototype.keyBinder = {
		keyCodes : {
			//8 : 'backspace',
			/*9 : {
				key : 'tab',
				events : ['keyup']
			},*/
			13 : {
				key : 'enter',
				events : ['keyup']
			}/*,
			37 : 'direction',
			38 : 'direction',
			39 : 'direction',
			40 : 'direction',
			66 : 'bold',
			86 : 'paste'*/
		},
		dispatchTable : {
			enter : function (e) {
				var self = this,
					node = UTILS.getSelectionStartNode(),
					tagName = node.tagName.toLowerCase();
				console.log('yolo');
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
				this.keyBinder.dispatchTable[this.keyBinder.keyCodes[e.which].key](e); }
			this.save();
			
			return this;
		},
		down : function (e) {
			var self = this,
				node = UTILS.getSelectionStartNode();
			if (this.keyBinder.keyCodes[e.which] && ~this.keyBinder.keyCodes[e.which].events.join(' ').indexOf(e.type)) {
				UTILS.preventDefault(e);
				this.keyBinder.dispatchTable[this.keyBinder.keyCodes[e.which].key](e);
			}
		}
	};
	//add app.manifest and app features
	
	Note.prototype.loadNote = function () {
		this.notepad.innerHTML = this.savedNote;
		
		/*
		var workingText = '',
			inText = true,
			brElement = d.createElement('br'),
			frag = d.createDocumentFragment();
		
		UTILS.removeChildren(this.notepad);
		
		//iterate over this.noteContent and write to textNode or, if encountering a this.newlineSymbol, add a br element
		for (var i = 0; i <= this.noteContent.length; i++) {
			if (this.noteContent[i] !== this.newlineSymbol) {
				if (!inText) {
					workingText = '';
					inText = true;
				}
				workingText += this.noteContent[i];
			} else {
				if (workingText.length !== 0) {
					frag.appendChild(d.createTextNode(workingText));
				}
				inText = false;
				frag.appendChild(brElement.cloneNode());
			}
		}*/
		
		return this;
	};
	
	
	/*
	cleanPaste: function (text) {
            var i, elList, workEl,
                el = this.getSelectionElement(),
                multiline = /<p|<br|<div/.test(text),
                replacements = [

                    // replace two bogus tags that begin pastes from google docs
                    [new RegExp(/<[^>]*docs-internal-guid[^>]*>/gi), ""],
                    [new RegExp(/<\/b>(<br[^>]*>)?$/gi), ""],

                     // un-html spaces and newlines inserted by OS X
                    [new RegExp(/<span class="Apple-converted-space">\s+<\/span>/g), ' '],
                    [new RegExp(/<br class="Apple-interchange-newline">/g), '<br>'],

                    // replace google docs italics+bold with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*(font-style:italic;font-weight:bold|font-weight:bold;font-style:italic)[^>]*>/gi), '<span class="replace-with italic bold">'],

                    // replace google docs italics with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*font-style:italic[^>]*>/gi), '<span class="replace-with italic">'],

                    //[replace google docs bolds with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*font-weight:bold[^>]*>/gi), '<span class="replace-with bold">'],

                     // replace manually entered b/i/a tags with real ones
                    [new RegExp(/&lt;(\/?)(i|b|a)&gt;/gi), '<$1$2>'],

                     // replace manually a tags with real ones, converting smart-quotes from google docs
                    [new RegExp(/&lt;a\s+href=(&quot;|&rdquo;|&ldquo;|“|”)([^&]+)(&quot;|&rdquo;|&ldquo;|“|”)&gt;/gi), '<a href="$2">']

                ];

            for (i = 0; i < replacements.length; i += 1) {
                text = text.replace(replacements[i][0], replacements[i][1]);
            }

            if (multiline) {

                // double br's aren't converted to p tags, but we want paragraphs.
                elList = text.split('<br><br>');

                this.pasteHTML('<p>' + elList.join('</p><p>') + '</p>');
                this.options.ownerDocument.execCommand('insertText', false, "\n");

                // block element cleanup
                elList = el.querySelectorAll('a,p,div,br');
                for (i = 0; i < elList.length; i += 1) {

                    workEl = elList[i];

                    switch (workEl.tagName.toLowerCase()) {
                    case 'a':
                        if (this.options.targetBlank){
                          this.setTargetBlank(workEl);
                        }
                        break;
                    case 'p':
                    case 'div':
                        this.filterCommonBlocks(workEl);
                        break;
                    case 'br':
                        this.filterLineBreak(workEl);
                        break;
                    }

                }


            } else {

                this.pasteHTML(text);

            }

        },

        pasteHTML: function (html) {
            var elList, workEl, i, fragmentBody, pasteBlock = this.options.ownerDocument.createDocumentFragment();

            pasteBlock.appendChild(this.options.ownerDocument.createElement('body'));

            fragmentBody = pasteBlock.querySelector('body');
            fragmentBody.innerHTML = html;

            this.cleanupSpans(fragmentBody);

            elList = fragmentBody.querySelectorAll('*');
            for (i = 0; i < elList.length; i += 1) {

                workEl = elList[i];

                // delete ugly attributes
                workEl.removeAttribute('class');
                workEl.removeAttribute('style');
                workEl.removeAttribute('dir');

                if (workEl.tagName.toLowerCase() === 'meta') {
                    workEl.parentNode.removeChild(workEl);
                }

            }
            this.options.ownerDocument.execCommand('insertHTML', false, fragmentBody.innerHTML.replace(/&nbsp;/g, ' '));
        },
        isCommonBlock: function (el) {
            return (el && (el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'div'));
        },
        filterCommonBlocks: function (el) {
            if (/^\s*$/.test(el.textContent)) {
                el.parentNode.removeChild(el);
            }
        },
        filterLineBreak: function (el) {
            if (this.isCommonBlock(el.previousElementSibling)) {

                // remove stray br's following common block elements
                el.parentNode.removeChild(el);

            } else if (this.isCommonBlock(el.parentNode) && (el.parentNode.firstChild === el || el.parentNode.lastChild === el)) {

                // remove br's just inside open or close tags of a div/p
                el.parentNode.removeChild(el);

            } else if (el.parentNode.childElementCount === 1) {

                // and br's that are the only child of a div/p
                this.removeWithParent(el);

            }

        },

        // remove an element, including its parent, if it is the only element within its parent
        removeWithParent: function (el) {
            if (el && el.parentNode) {
                if (el.parentNode.parentNode && el.parentNode.childElementCount === 1) {
                    el.parentNode.parentNode.removeChild(el.parentNode);
                } else {
                    el.parentNode.removeChild(el.parentNode);
                }
            }
        },

        cleanupSpans: function (container_el) {

            var i,
                el,
                new_el,
                spans = container_el.querySelectorAll('.replace-with');

            for (i = 0; i < spans.length; i += 1) {

                el = spans[i];
                new_el = this.options.ownerDocument.createElement(el.classList.contains('bold') ? 'b' : 'i');

                if (el.classList.contains('bold') && el.classList.contains('italic')) {

                    // add an i tag as well if this has both italics and bold
                    new_el.innerHTML = '<i>' + el.innerHTML + '</i>';

                } else {

                    new_el.innerHTML = el.innerHTML;

                }
                el.parentNode.replaceChild(new_el, el);

            }

            spans = container_el.querySelectorAll('span');
            for (i = 0; i < spans.length; i += 1) {

                el = spans[i];

                // remove empty spans, replace others with their contents
                if (/^\s*$/.test()) {
                    el.parentNode.removeChild(el);
                } else {
                    el.parentNode.replaceChild(this.options.ownerDocument.createTextNode(el.textContent), el);
                }

            }

        }
	*/
	
	Note.prototype.mail = function () {
		this.storage.setItem(this.storeName, this.noteContent.join(''));
		return this;
	};

	Note.prototype.extractText = function () {
		var self = this,
			extract = function (nodes) {
				var text = '',
					node,
					flag = false;

				for (var i = 0; i < nodes.length; i++) {
					node = nodes[i];
					node.normalize();
					
					if (node !== undefined && node.nodeType === 3 && node.nodeValue !== '') {
						text += node.nodeValue;
						flag = false;
					} else {
						if (node !== undefined && node.nodeType === 1 && !flag) {
							text += self.newlineSymbol + extract(node.childNodes);
							flag = true;
						}
					}
				}
				return text;
			};

		return extract(this.notepad.childNodes);

	};

	Note.prototype.save = function () {
		this.setter('savedNote', this.notepad.innerHTML)
			.storage.setItem(this.storeName, this.savedNote);
		UTILS.XHR('/push' + w.location.pathname, 'content=' + this.savedNote);
		return this;
	};

	Note.prototype.download = function () {
		var blob = new Blob([this.sanitise.all(this.notepad.innerHTML)], {type: "text/plain;charset=utf-8"});
		saveAs(blob, 'Note-' + this.id + '.txt');
		return this;
	};

	Note.prototype.sanitise = {
		addnl : function (content) {
			return content.trim().replace(/{{note-break}}/g, '\n');
		},
		brnl : function (content) {
			return content.trim().replace(/<br>/g, '\n');
		},
		addbr : function (content) {
			return content.trim().replace(/{{note-break}}/g, '<br>');
		},
		elements : function (content) {
			return content.replace(/(<([^>]+)>)/ig, '');
		}
	};
	
	var note = new Note();
	
})(window, document, undefined);