import { patchHTMLContent } from "../../background/api-request.js";

export async function bookmarkTab(pageId) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	patchHTMLContent(pageId, `<a href='${tab.url}'>${tab.title}</a>`);
	toast("tab link inserted");
	await setStore({ lastPageId: pageId });
}

export function openSidePanel() {
	const query = { active: true, currentWindow: true };
	chrome.tabs.query(query).then(async (tabs) => {
		await chrome.sidePanel["open"]({ tabId: tabs[0].id });
		close();
	});
}

export async function captureScreenshot() {
	await injectScript("scripts/screenshot/cropper.js");
	close();
}

export async function clipArticle(mode) {
	const filename = mode === "auto" ? "clip-article" : "manual-clip-site";
	await injectScript(`/scripts/clip-site/${filename}.js`);
	close();
}

/**@param {string[]} scripts*/
export async function injectScript(...scripts) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	try {
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: scripts,
		});
	} catch (error) {
		console.info(error);
	}
}
