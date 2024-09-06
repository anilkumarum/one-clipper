import "./drawer/note-drawer.js";
import { html } from "../js/om.event.js";
import { patchHTMLContent, patchHTMLContentWithImages } from "../../background/api-request.js";

export class TopBar extends HTMLElement {
	constructor() {
		super();
	}

	async appendAllPagesContent() {
		const pageCards = this.nextElementSibling.children;
		const promises = [];
		for (const pageCard of pageCards) {
			if (!pageCard.lastElementChild.hasChildNodes()) continue;

			const pageContentElem = pageCard.lastElementChild;
			pageContentElem["images"].size === 0
				? patchHTMLContent(pageContentElem.innerHTML, pageCard["page"].id)
				: patchHTMLContentWithImages(pageContentElem.innerHTML, pageCard["page"].id, pageContentElem["images"]);
			pageContentElem.textContent = "";
		}

		await Promise.all(promises);
		this.nextElementSibling.replaceChildren();
		notify(promises.length + " notes inserted");
	}

	async openFileDrawer() {
		if (this.noteDrawer) return this.noteDrawer.showPopover();
		const { NoteDrawer } = await import("./drawer/note-drawer.js");
		this.noteDrawer = new NoteDrawer();
		this.appendChild(this.noteDrawer);
	}

	render() {
		return html`<clip-icon
				ico="drawer"
				title="Open notebook drawer"
				@click=${this.openFileDrawer.bind(this)}></clip-icon>
			<span>oneClipper</span>
			<button>Insert All</button>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("top-bar", TopBar);
