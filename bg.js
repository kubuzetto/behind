"use strict";

browser.runtime.onInstalled.addListener(function (d) {
	if (d.reason === "install") {
		browser.runtime.openOptionsPage();
	}
});

var oneResult = undefined;
var bypassMode = "off";
let checkStorage = function() {
	browser.storage.local.get('bypass').then(function(r) {
		bypassMode = r.bypass || 'off';
	});
};
checkStorage();
browser.storage.onChanged.addListener((x,y) => checkStorage());

// trial-and-error to keep Waterfox happy
var updCtx = function(upd) {
	try {
		browser.contextMenus.update ("behind_ctxmenu", upd);
	} catch (e) {
		delete upd['visible'];
		browser.contextMenus.update ("behind_ctxmenu", upd);
	}
};

browser.contextMenus.create ({ "id": "behind_ctxmenu",
	"title": browser.i18n.getMessage("menuButtonTextDefault"),
	"contexts": [ "image", "link", "page", "audio", "video", "frame" ],
	"onclick": function (x, t) {
		updCtx({"visible": false});
		let fn = function(opt) {
			// we only handle the 'off' and 'one' cases here.
			// 'big', 'wide' and 'tall' must be handled within the inline
			// page; as we don't currently have the image sizes at hand.
			let u;
			if (bypassMode !== 'off' && oneResult && oneResult.t !== "VIDEO") {
				u = "/img.html#!" + oneResult.e;
			} else {
				u = "/inline.html";
			}
			browser.tabs.create({ url: u, active: opt && opt.bgCbox !== "f", openerTabId: t.id});
		};
		browser.storage.local.get('bgCbox').then(fn, () => fn({bgCbox: "t"}));
	}});
updCtx({"visible": false});

// try to add an icon to the menu item: this is not currently supported in chrome and might fail
try {
	const noop = function (a) {};
	browser.contextMenus.update ("behind_ctxmenu", {"icons": {"16": "icon.svg"}}).then (noop, noop);
} catch(e) {}

browser.runtime.onMessage.addListener (function (fn, x) {
	if (fn && fn.nm == "setClickedElements") {
		oneResult = undefined;
		var upd = {"visible": true, "enabled": true};
		if (!!fn.frame) {
			upd.title = browser.i18n.getMessage ("menuButtonTextFrameDisabled");
			upd.enabled = false;
		} else if (!!fn.st)
			upd.title = browser.i18n.getMessage ("menuButtonTextDefault");
		else if (!!fn.ce) {
			if (fn.ce === 1) oneResult = fn.ft;
			upd.title = browser.i18n.getMessage ("menuButtonTextWithNum", [fn.ce]);
		} else
			upd.visible = false;
		updCtx(upd);
		// no refresh function in chrome
		if (typeof browser.contextMenus.refresh === "function")
			browser.contextMenus.refresh ();
	}
});
