import { getSectionPages } from "./api-get-request.js";
import { createPagesContextMenu } from "./contextMenu.js";

export async function updateSectionPages(noteBook) {
	const sections = (await getStore(noteBook))[noteBook];
	if (!sections) return;
	const lastSectionId = (await getStore("lastSectionId")).lastSectionId;
	sections.forEach(async (section) => {
		const pages = await getSectionPages(section.id);
		if (pages && section.id === lastSectionId) createPagesContextMenu(pages);
	});
}

/**@param {(...args: any[]) => any} func*/
export async function injectFuncScript(func, ...args) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			func: func,
			args: args,
		});
		return results[0].result;
	} catch (error) {
		console.info(error);
	}
}

/**@param {string[]} scripts*/
export async function injectScript(...scripts) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	try {
		await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: scripts });
	} catch (error) {
		const errMsg =
			"Cannot access contents of the page. Extension manifest must request permission to access the respective host.";
		if (error.message === errMsg) {
			await chrome.runtime.openOptionsPage();
			await new Promise((r) => setTimeout(r, 1000));
			const granted = await chrome.runtime.sendMessage("requestHostPermission");
			if (granted) await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: scripts });
		}
		console.info(error);
	}
}

export async function reportBug(error) {
	await chrome.runtime.openOptionsPage();
	await new Promise((r) => setTimeout(r, 1000));
	chrome.runtime.sendMessage({ msg: "reportBug", error });
}
