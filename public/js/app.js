/*global $, window, document, console, XMLHttpRequest, Blob, saveAs*/
(function (w, d) {
	'use strict';
	var storage = w.localStorage,
		noteID = w.location.pathname.substring(w.location.pathname.lastIndexOf("/") + 1),
		storeName = 'note-' + noteID,
		saved = storage.getItem(storeName),
		notepad = d.getElementById('a'),
		loader = d.getElementById('l'),
		save = function () {
			storage.setItem(storeName, notepad.innerHTML);
		},
		XHR = function (url, content) {
			var http = new XMLHttpRequest();
			
			http.onload = function () {
				if (http.status == 200) {
					loader.style.opacity = 0;
				}
			};
			http.open('POST', url, true);
			http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			http.send(content);
		},
		on = function (el, ev, fn) {
			if (el.addEventListener) {
				el.addEventListener(ev, fn, false);
			} else {
				el.attachEvent('on' + ev, fn);
			}
		},
		mail = function (e) {
			var form = d.getElementById('form-email'),
				field = d.getElementById('form-row-email'),
				off = function () {
					d.body.className = d.body.className.split(' app-form-mode').join('');
				};
			
			e.preventDefault();
			e.stopPropagation();
			
			if (~d.body.className.indexOf(' app-form-mode')) {
				XHR('/mail', 'content=' + notepad.innerHTML + '&form-row-email=' + encodeURI(field.value));
				off();
			} else {
				d.body.className += ' app-form-mode';
				field.focus();
				on(notepad, 'click', off);
			}
		},
		download = function () {
			var sanitise = function (content) {
				return content.trim().replace(/<br(\s*)\/*>/ig, '\n').replace(/<[p|div]\s/ig, '\n$0').replace(/(<([^>]+)>)/ig, ""); 
			},
			blob = new Blob([sanitise(notepad.innerHTML)], {type: "text/plain;charset=utf-8"});
			saveAs(blob, 'Note-' + noteID + '.txt');
		};
	
	on(d, 'keyup', function () {
		loader.style.opacity = 0.2;
		save();
		XHR('/push' + w.location.pathname, 'content=' + notepad.innerHTML);
	});
	
	on(d.getElementById('btn-email'), 'click', mail);
	
	on(d.getElementById('btn-download'), 'click', download);
	
})(window, document, undefined);