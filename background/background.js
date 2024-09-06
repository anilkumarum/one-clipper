import { contextHandler, createContextMenu, createPagesContextMenu } from "./contextMenu.js";
import { createHTMLPage, patchHTMLContent } from "./api-request.js";
import { checkPermission, onUpdateTab } from "./highlight.js";
import { injectScript, updateSectionPages } from "./util.js";
import { getNoteBookList, getNoteBookSections, getSectionPages } from "./api-get-request.js";
import { Screenshoter } from "./screenshot.js";

globalThis.getStore = chrome.storage.local.get.bind(chrome.storage.local);
globalThis.setStore = chrome.storage.local.set.bind(chrome.storage.local);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.htmlContent) {
		request.sectionId
			? createHTMLPage(request.htmlContent, request.sectionId)
			: patchHTMLContent(request.htmlContent, request.pageId);
	} else if (request.msg === "captureShot") {
		new Screenshoter(request.coordinate, request.screenHeight, sender.tab.id)
			.captureAndUpload(request)
			.then(sendResponse);
		return true;
	} else if (request === "checkPermission") {
		checkPermission().then(sendResponse);
		return true;
	} else if (request.msg === "switchNotebook") {
		getNoteBookSections(request.notebookId).then((sections) => getSectionPages(sections[0].id).then(sendResponse));
		return true;
	} else if (request.msg === "toggle_highlight") {
		request.hightlightOn
			? chrome.tabs.onUpdated.addListener(onUpdateTab)
			: chrome.tabs.onUpdated.removeListener(onUpdateTab);
	} else if (request.msg === "createCxtMenu") {
		chrome.storage.local.remove("cxtMenuIds").then(() => createPagesContextMenu(request.pages));
	}
});

getStore("hightlightOn").then(({ hightlightOn }) => {
	hightlightOn && chrome.tabs.onUpdated.addListener(onUpdateTab);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	contextHandler[info.parentMenuItemId]
		? contextHandler[info.parentMenuItemId](info, tab.id)
		: contextHandler[info.menuItemId](info, tab.id);
});

//command-handler
const commands = {
	screenshot: () => injectScript("scripts/screenshot/cropper.js"),
	clip_article: () => injectScript("scripts/clip-site/clip-article.js"),
	multi_select_text: () => injectScript("scripts/clip-site/manual-clip-site.js"),
};
chrome.commands.onCommand.addListener((cmd) => commands[cmd]?.());

//On Startup
chrome.runtime.onStartup.addListener(() =>
	getStore("openNoteBook").then(({ openNoteBook }) => openNoteBook && updateSectionPages()),
);

//Listen External Message to save oneNote Detail
async function listenWebpageMsg(request, sender, sendResponse) {
	if (sender.origin !== "https://cloud.oneclipper.noterail.site") return;
	if (request.msg === "setConnectedOnenote") {
		chrome.storage.sync.set({ onenote: request.token });
		chrome.tabs.remove(sender.tab.id);
		chrome.runtime.sendMessage("onenote-connected").catch((err) => {});
		const notebooks = await getNoteBookList();
		const sections = await getNoteBookSections(notebooks[0].id);
		getSectionPages(sections[0].id);
	}
	sendResponse({ success: true, msg: "authentication success" });
}
chrome.runtime.onMessageExternal.addListener(listenWebpageMsg);

//onInstall and onUpdate
export const setInstallation = ({ reason }) => {
	async function oneTimeInstall() {
		chrome.storage.local.set({
			extUserId: crypto.randomUUID(),
			"enableCtrl+Copy": false,
			theme: { fontSize: 16, fontFamily: "", background: "none", textColor: "" },
		});
		chrome.storage.sync.set({ TAG_ORE: crypto.randomUUID(), SIM_KO: crypto.randomUUID() });
		chrome.tabs.create({ url: "/guide/welcome-guide.html" });
		//> uninstall survey setup
		const LAMBA_KD = crypto.randomUUID();
		const SURVEY_URL = `https://uninstall-form.pages.dev/?e=${chrome.runtime.id}&u=${LAMBA_KD}`;
		chrome.runtime.setUninstallURL(SURVEY_URL);
	}
	reason === "install" && oneTimeInstall();

	chrome.contextMenus.create({
		id: "oneNoteClip",
		title: "Clip to oneNote",
		contexts: ["selection", "link", "image"],
	});
	createContextMenu("createPage", "Create new page");
	chrome.storage.local.remove("cxtMenuIds").then(async () => {
		const sectionId = (await getStore("lastSectionId")).lastSectionId;
		if (!sectionId) return;
		const pages = (await getStore(sectionId))[sectionId] ?? (await getSectionPages(sectionId));
		pages && createPagesContextMenu(pages);
	});
};
// installation setup
chrome.runtime.onInstalled.addListener(setInstallation);
