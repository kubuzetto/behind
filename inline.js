"use strict";

var maxArea = 1;
var maxWidth = 1;
var maxHeight = 1;
var sizedResCnt = 0;

document.title = browser.i18n.getMessage("resultsPageTitle");

var widestAlt = browser.i18n.getMessage("resultsPageWidestAltText");
var largestAlt = browser.i18n.getMessage("resultsPageLargestAltText");
var tallestAlt = browser.i18n.getMessage("resultsPageTallestAltText");

var replaceClass = function(ct, onto, tag) {
	ct.classList.add(onto);
	for (let elem of document.querySelectorAll('.' + tag))
		elem.classList.remove(tag);
	for (let elem of document.querySelectorAll('.' + onto))
		elem.classList.add(tag);
};

var makeDiv = function(cn) {
	var d = document.createElement("div");
	d.className = cn;
	return d;
};

var innerDiv = function(c) {
	c.appendChild(document.createElement("div"));
	return c;
};

var alt = function(e, t) {
	e.setAttribute("title", t);
	return e;
};

var makeLiElem = function (ul, el) {
	if (el) {
		let ht = el.e;
		if (ht && ht.length) {
			let ct = makeDiv("imCt");
			ul.appendChild (ct);
			if (el.t === "VIDEO") {
				let vid = document.createElement ("video");
				vid.src = ht;
				vid.controls = "true";
				ct.appendChild (vid);
			} else {
				let a = document.createElement ("a");
				a.target = "_blank";
				a.href = "img.html#!" + ht;
				let markers = makeDiv("markers");
				markers.appendChild(innerDiv(alt(makeDiv("wd"), widestAlt)));
				markers.appendChild(innerDiv(alt(makeDiv("hg"), tallestAlt)));
				markers.appendChild(innerDiv(alt(makeDiv("ar"), largestAlt)));
				ct.appendChild(markers);
				let im = document.createElement ("img");
				im.onload = function () {
					let wid = im.naturalWidth;
					let hgh = im.naturalHeight;
					if (wid && hgh) {
						if (++sizedResCnt == 2) ul.classList.add("multiResult");
						let szTxt = browser.i18n.getMessage("imgSizeText", [wid, hgh]);
						let spn = alt(document.createElement("span"), szTxt);
						spn.innerText = szTxt;
						ct.appendChild(spn);
						let area = wid * hgh;
						if (wid >= maxWidth) {
							maxWidth = wid;
							replaceClass(ct, "width_" + wid, "widest");
						}
						if (area >= maxArea) {
							maxArea = area;
							replaceClass(ct, "size_" + area, "largest");
						}
						if (hgh >= maxHeight) {
							maxHeight = hgh;
							replaceClass(ct, "height_" + hgh, "tallest");
						}
					}
				}
				im.onerror = function() {
					fetch(new Request(ht)).then(function(r) {
						r.blob().then(function(b) {
							im.src = URL.createObjectURL(b);
						});
					});
				};
				a.appendChild (im);
				ct.appendChild (a);
				let fn = ht.split('#').shift().split('?').shift().split('/').pop();
				let spn = alt(document.createElement("span"), fn);
				spn.innerText = fn;
				ct.appendChild(spn);
				im.src = ht;
			}
		}
	}
};

let checkTheme = function() {
	browser.storage.local.get('theme').then(function(r) {
		document.body.id=r.theme;
		document.querySelector("#theme_" + (r.theme || "auto")).checked = true;
	});
};

window.onload = function () {
	checkTheme();
	browser.storage.onChanged.addListener((x,y) => checkTheme());
	for (let val of ["lite", "auto", "dark"]) {
		let elem = document.querySelector("#theme_" + val);
		if (elem) {
			elem.addEventListener("click", function(e) {
				browser.storage.local.set({theme: val});
				checkTheme();
			});
			elem.disabled = false;
		}
	}
	document.querySelector('#theme_lite_label').innerText = browser.i18n.getMessage("lightTheme");
	document.querySelector('#theme_auto_label').innerText = browser.i18n.getMessage("autoTheme");
	document.querySelector('#theme_dark_label').innerText = browser.i18n.getMessage("darkTheme");

	browser.tabs.getCurrent ().then (function (self) {
		// missing opener tab id; close
		var oti = self.openerTabId;
		if (!oti) close ();
		// is the opener tab still open?
		browser.tabs.get (oti).then (function (tab) {
			document.title += " [" + tab.title + "]";
		}, close);
		// try to send message to the tab
		browser.tabs.sendMessage (oti,
			{nm: "fetchClickedElements"}).then (function (v) {
				var main = document.querySelector ("#main");
				if (v && v.el && v.el.length) {
					v.el.forEach (function (x) {makeLiElem (main, x);});
				} else {
					main.innerText = browser.i18n.getMessage ("errorNoImages");
				}
		}, function (e) {
			console.error (browser.i18n.getMessage ("errorTabsSendMessage", e.toString()));
		});
	}, function (e) {
		console.error (browser.i18n.getMessage ("errorTabsGetCurrent", e.toString()));
	});

	// remove url of this generated page from history
	browser.permissions.contains({permissions: ["history"]}).then(allowed => {
		if (allowed) browser.history.deleteUrl({url: window.location.href});
	});
};
