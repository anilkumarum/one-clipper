import { injectFuncScript } from "../../../background/util.js";

export class PageContent extends HTMLElement {
	constructor() {
		super();
		this.linkUrls = [];
		this.attachments = new Map();
		this.images = new Map();
	}

	connectedCallback() {
		this.setAttribute("contenteditable", "true");
		this.setAttribute("spellcheck", "false");
		$on(this, "beforeinput", (event) => this.inputHandler[event.inputType]?.(event));
	}

	inputHandler = {
		insertFromPaste: this.dropPasteHandler.bind(this),
		insertFromDrop: this.dropPasteHandler.bind(this),
	};

	async dropPasteHandler(event) {
		const dropInfo = event.dataTransfer;
		const types = new Set(dropInfo.types);

		if (types.has("Files")) {
			const file = dropInfo.files[0];
			if (file.type.startsWith("image")) {
				const src = types.has("text/uri-list") ? dropInfo.getData("text/uri-list") : "name:" + Date.now();
				document.execCommand("insertImage", null, src);
				types.has("text/uri-list") || this.images.set(src, file);
				event.preventDefault();
			} else {
				//TODO
			}
		} else if (types.has("text/uri-list")) {
			const linkUrl = dropInfo.getData("text/uri-list");
			document.execCommand("createLink", null, linkUrl);
			event.preventDefault();
		} else {
			const data = event.dataTransfer.getData("text/html");
			const htmlStr = data.replaceAll(/style=".+?"/g, "");
			event.preventDefault();
			const tagName = (await chrome.permissions.contains({ origins: ["<all_urls>"] }))
				? await injectFuncScript(getParentTagName)
				: null;
			const htmlContent = tagName ? `<${tagName}>${htmlStr}</${tagName}>` : htmlStr;
			document.execCommand("insertHTML", null, htmlContent);
		}
	}
}

customElements.define("page-content", PageContent);

function getParentTagName() {
	const selection = getSelection();
	if (selection.isCollapsed) return;
	const range = selection.getRangeAt(0);
	const ancestorElem =
		range.commonAncestorContainer.nodeType === 1
			? range.commonAncestorContainer
			: range.commonAncestorContainer.parentElement;
	return ancestorElem["tagName"].toLowerCase();
}
