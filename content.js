"use strict";

var collisionFilter = function (x, y, r) {
	return { acceptNode: function (e) {
		var bb = e.getBoundingClientRect ();
		if (x >= bb.left - r && x <= bb.right + r)
			if (y >= bb.top - r && y <= bb.bottom + r)
				return NodeFilter.FILTER_ACCEPT;
		return NodeFilter.FILTER_SKIP;
	}};
};

var svgToURL = function (v) {
	if (v.ownerDocument.contentType === "image/svg+xml") {
		return v.ownerDocument.URL;
	}
    var s = v.cloneNode (true);
    s.setAttribute ("xmlns", "http://www.w3.org/2000/svg");
    s.setAttribute ("xmlns:xlink", "http://www.w3.org/1999/xlink");
    return "data:image/svg+xml," + encodeURIComponent (s.outerHTML);
};

var elemsFromPoint = function (x, y, add) {
	var cf = collisionFilter (x, y, 4);
	var q = [document.body];
	let root;
	while (root = q.shift ()) {
		var it = document.createNodeIterator (root, NodeFilter.SHOW_ELEMENT, cf);
		let n;
		while (n = it.nextNode ()) {
			var nn = n.nodeName && n.nodeName.toUpperCase ();
			if (nn == "SVG") {
				add (svgToURL (n), true);
			} else if (nn == "IMG" || nn == "PICTURE" || nn == "SOURCE" || nn == "VIDEO") {
				add (n.src, false); add (n.currentSrc, false); add (n.poster, false);
				if (n.srcset) n.srcset.replace
					(/\s+[0-9]+(\.[0-9]+)?[wx]/g, "")
					.split (/,/).forEach (function (x) {add (x, false);});
			} else if (nn == "CANVAS") {
				add (n.toDataURL(), true);
			} /* else if (nn == "OBJECT" || nn == "IFRAME") {
				add (n.data, false);
				try { q.push (nn.contentDocument); } catch (e) {}
			} */
			var nrm = getComputedStyle (n);
			var bef = getComputedStyle (n, "::before");
			var aft = getComputedStyle (n, "::after");
			for (var a of [ n.content, nrm.content, bef.content,
					aft.content, n.backgroundImage, nrm.backgroundImage,
					bef.backgroundImage, aft.backgroundImage ]) {
				if (a) {
					let parts = /url\((['"]?)(.+)\1\)/.exec(a);
					if (parts && parts.length > 2) add(parts[2]);
				}
			}
			if (n.shadowRoot) q.push (n.shadowRoot);
		}
	}
};

var st = false;
var last = [];
var onCtxMenu = function (e) {
	if (window != top) {
		browser.runtime.sendMessage
			({nm: "setClickedElements", frame: true});
		last = [];
		st = false;
		return false;
	}
	if (st) return;
	last = [];
	st = true;
	browser.runtime.sendMessage
		({nm: "setClickedElements", st: true});
	const r = new Set ();
	elemsFromPoint (e.clientX, e.clientY, function (v, i) {
		if (v) {
			var t = v.trim ();
			if (t.length > 0) {
				// skip blob URLs
				if (!t.startsWith ("blob:")) {
					// convert to absolute unless explicitly prevented
					if (!i) t = new URL (t, document.baseURI).href;
					r.add (t);
				}
			}
		}
	});
	last = Array.from (r);
	browser.runtime.sendMessage
		({nm: "setClickedElements", ce: last.length});
	st = false;
};

document.addEventListener ("contextmenu", onCtxMenu, true);

browser.runtime.onMessage.addListener (function (fn, x) {
	if (fn && fn.nm == "fetchClickedElements")
		return Promise.resolve ({ el: last });
});
