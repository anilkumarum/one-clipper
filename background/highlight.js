export function highlightSelectedText(tabId, pageId) {
	setStore({ lastPageId: pageId });
	chrome.tabs.sendMessage(tabId, "highlightTxt").catch((err) => {
		chrome.scripting
			.executeScript({
				target: { tabId: tabId, allFrames: true },
				files: ["/scripts/highlighter/Highlighter.js"],
			})
			.catch((err) => console.info(err));
	});
}

export async function checkPermission() {
	try {
		const hasPermission = await chrome.permissions.contains({ origins: ["<all_urls>"] });
		if (hasPermission) return true;
		await chrome.runtime.openOptionsPage();
		await new Promise((r) => setTimeout(r, 1000));
		return await chrome.runtime.sendMessage("requestHostPermission");
	} catch (error) {
		console.info(error);
	}
}

//Listen Tab update for highlight
/**@param {number} tabId, @param {chrome.tabs.Tab} tab*/
export async function onUpdateTab(tabId, info, tab) {
	if (info.status === "complete") {
		if (!tab.url) return;
		const pageId = tab.url.split("#", 1)[0].slice(8, 100);
		const highlighted = (await getStore(pageId))[pageId] !== undefined;
		if (!highlighted) return;
		chrome.scripting
			.executeScript({
				target: { tabId: tabId },
				files: ["/scripts/highlighter/highlighterCmd.js"],
			})
			.catch((err) => console.info(err));
	}
}
