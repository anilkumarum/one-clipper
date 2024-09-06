"use strict";
class Highlighter {
	domToNotionGenerator;

	constructor() {
		if (CSS["highlights"].has("keepClipper-highlight"))
			this.highlight = CSS["highlights"].get("keepClipper-highlight");
		else {
			// @ts-ignore
			this.highlight = new Highlight();
			CSS["highlights"].set("keepClipper-highlight", this.highlight);
			const styleElem = document.createElement("style");
			styleElem.innerHTML = `*::highlight(keepClipper-highlight) {background-color: yellow;color:black}`;
			document.head.appendChild(styleElem);
			this.highlightSelected();
		}
	}

	async highlightSelected(sendContent = true) {
		const selection = getSelection();
		if (selection.isCollapsed) return;
		const range = selection.getRangeAt(0);
		this.highlight.add(range);
		if (sendContent) await this.sendSelectedContents(range), selection.removeAllRanges();
		saveHighlightBtn?.isConnected || insertSaveBtn();
	}

	async sendSelectedContents(range) {
		const blockTags = new Set(["BLOCKQUOTE", "PRE", "OL", "UL"]);
		const ancestorElem =
			range.commonAncestorContainer.nodeType === 1
				? range.commonAncestorContainer
				: range.commonAncestorContainer.parentElement;
		const parentTag = blockTags.has(ancestorElem.parentElement.tagName)
			? ancestorElem.parentElement.tagName
			: ancestorElem["tagName"];
		const parentElem = document.createElement(parentTag.toLowerCase());
		parentElem.appendChild(range.cloneContents());
		chrome.runtime.sendMessage({ htmlContent: parentElem.outerHTML });
	}
}
globalThis.markClipperHighlighter = new Highlighter();

async function onSaveBtnClick() {
	async function saveAllHighlights() {
		const ranges = markClipperHighlighter.highlight.values();
		// @ts-ignore
		globalThis.highlightCommander ?? (await import("./highlighterCmd.js"));
		globalThis.highlightCommander.saveAllHighlights([...ranges]);
		saveHighlightBtn.remove();
	}
	const { hightlightOn } = await chrome.storage.local.get("hightlightOn");
	if (hightlightOn) saveAllHighlights();
	else {
		const granted = await chrome.runtime.sendMessage("checkPermission");
		if (granted) {
			saveAllHighlights();
			hightlightOn || chrome.storage.local.set({ hightlightOn: true });
		} else console.log("Highlight permission denied");
	}
}

/**@type {HTMLElement} */
var saveHighlightBtn;
function insertSaveBtn() {
	saveHighlightBtn = document.createElement("save-highlight");
	saveHighlightBtn.textContent = "🖍️ Save highlight";
	document.body.appendChild(saveHighlightBtn);
	saveHighlightBtn.addEventListener("click", onSaveBtnClick);
}
const cssStyleSheet2 = new CSSStyleSheet();
cssStyleSheet2.replace(`
save-highlight {
	border-radius: 10px;
	padding: 2px 5px;
	font-size: 16px;
	color: white;
	background-color: Orange;
	box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
	position: fixed;
	bottom: 16px;
	right: 16px;
	z-index:2200;
    cursor:pointer;
}`);
document.adoptedStyleSheets.push(cssStyleSheet2);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	request === "highlightTxt" && markClipperHighlighter.highlightSelected();
	sendResponse("highlighted");
});
