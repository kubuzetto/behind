"use strict";

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
			browser.tabs.create({ url: "/inline.html", active: opt && opt.bgCbox !== "f", openerTabId: t.id});
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
		var upd = {"visible": true, "enabled": true};
		if (!!fn.frame) {
			upd.title = browser.i18n.getMessage ("menuButtonTextFrameDisabled");
			upd.enabled = false;
		} else if (!!fn.st)
			upd.title = browser.i18n.getMessage ("menuButtonTextDefault");
		else if (!!fn.ce)
			upd.title = browser.i18n.getMessage ("menuButtonTextWithNum", [fn.ce]);
		else
			upd.visible = false;
		updCtx(upd);
		// no refresh function in chrome
		if (typeof browser.contextMenus.refresh === "function")
			browser.contextMenus.refresh ();
	}
});
