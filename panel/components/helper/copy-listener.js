import { injectCopier } from "../../js/injectCopier.js";
import { focusedPage } from "../pages/page-card.js";
import { OneClipperIcon } from "./clip-icon.js";

export class CopyListener extends HTMLElement {
	constructor() {
		super();
	}

	toggleCopy({ currentTarget }) {
		setStore({ "enableCtrl+Copy": currentTarget.checked });
		if (currentTarget.checked) {
			chrome.tabs.onUpdated.addListener(injectCopier);
			chrome.tabs
				.query({ active: true, currentWindow: true })
				.then((tabs) => injectCopier(tabs[0].id, { status: "complete" }));
		} else {
			chrome.tabs.onUpdated.removeListener(injectCopier);
			for (const port of this.ports.values()) port.disconnect();
			this.ports.clear();
		}
	}

	connectedCallback() {
		const copyBtn = new OneClipperIcon("copy-off");
		copyBtn.setAttribute("toggle", "");
		copyBtn.title = "turn on/off ctrl+c listener on webpage";
		this.replaceChildren(copyBtn);
		this.setCopyPortListner();
		$on(this.firstElementChild, "change", this.toggleCopy.bind(this));

		getStore("enableCtrl+Copy").then((result) => {
			result["enableCtrl+Copy"]
				? this.toggleCopy({ currentTarget: this.firstElementChild })
				: (this.firstElementChild["checked"] = false);
		});
	}

	setCopyPortListner() {
		this.ports = new Map();
		chrome.runtime.onConnect.addListener((port) => {
			this.ports.set(port.sender.documentId, port);
			port.onMessage.addListener((msg) => {
				if (msg.command === "saveCaret") {
					const selection = getSelection();
					return (this.savedCaret = { node: selection.focusNode, offset: selection.focusOffset });
				}
				this.savedCaret && getSelection().setPosition(this.savedCaret.node, this.savedCaret.offset);

				if (msg.command === "copied") {
					focusedPage?.contains(this.savedCaret?.node)
						? document.execCommand("insertHTML", null, msg.htmlContent)
						: focusedPage.lastElementChild.insertAdjacentHTML("beforeend", msg.htmlContent);
				} else if (msg.command === "Undo") document.execCommand("undo");
				else if (msg.command === "Redo") document.execCommand("redo");
			});
			port.onDisconnect.addListener(() => this.ports.delete(port.sender.documentId));
		});
	}
}

customElements.define("copy-listener", CopyListener);
