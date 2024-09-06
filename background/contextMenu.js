import { highlightSelectedText } from "./highlight.js";
import { patchHTMLContent } from "./api-request.js";
import { PageData } from "../panel/js/PageData.js";

/**@param {PageData[]} pages*/
export async function createPagesContextMenu(pages) {
	const { cxtMenuIds } = await getStore("cxtMenuIds");
	pages.forEach((page) => {
		if (cxtMenuIds?.includes(page.id)) return;
		createContextMenu(page.id, page.title);
	});
	const menuIds = pages.map((page) => page.id);
	await setStore({ cxtMenuIds: menuIds });
}

export async function addContextMenu(pageId, pageName) {
	try {
		chrome.contextMenus.create({
			id: pageId,
			parentId: "oneNoteClip",
			title: pageName.slice(0, 24),
			contexts: ["selection", "image", "link"],
		});
	} catch (error) {
		console.info(error);
	}
	const { cxtMenuIds } = await getStore("cxtMenuIds");
	cxtMenuIds.push(pageId);
	await setStore({ cxtMenuIds });
}

export function createContextMenu(pageId, pageName) {
	try {
		chrome.contextMenus.create({
			id: pageId,
			parentId: "oneNoteClip",
			title: pageName.slice(0, 24),
			contexts: ["selection", "image", "link"],
		});
	} catch (error) {
		console.info(error);
	}
}

export const contextHandler = {
	oneNoteClip: async (info, tabId) => {
		const pageId = info.menuItemId;
		if (info.selectionText) highlightSelectedText(tabId, pageId);
		else if (info.linkUrl) {
			patchHTMLContent(`<a href='${info.linkUrl}'>${info.linkUrl}</a>`, pageId);
		} else if (info.srcUrl) {
			patchHTMLContent(`<img src='${info.srcUrl}' />`, pageId);
		}
	},
};
