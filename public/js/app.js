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
		XHR = function (url) {
			var http = new XMLHttpRequest();
			
			http.onload = function () {
				if (http.status == 200) {
					loader.style.opacity = 0;
				}
			};
			http.open('POST', url, true);
			http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			http.send('content=' + notepad.innerHTML);
		},
		on = function (el, ev, fn) {
			if (el.addEventListener) {
				el.addEventListener(ev, fn, false);
			} else {
				el.attachEvent('on' + ev, fn);
			}
		},
		download = function () {
			var blob = new Blob([notepad.innerHTML], {type: "text/plain;charset=utf-8"});
			saveAs(blob, 'Note-' + noteID + '.txt');
		};
	
	on(d, 'keyup', function () {
		loader.style.opacity = 0.2;
		save();
		XHR('/push' + w.location.pathname);
	});
	
	on(d.getElementById('btn-mail'), 'click', function () {
		XHR('/mail');
	});
	
	on(d.getElementById('btn-download'), 'click', download);
	
})(window, document, undefined);