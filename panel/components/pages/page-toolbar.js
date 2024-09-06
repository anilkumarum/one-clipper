import { patchHTMLContent, patchHTMLContentWithImages } from "../../../background/api-request.js";
import { PageData } from "../../js/PageData.js";
import { PageContent } from "./page-content.js";
import { html } from "../../js/om.event.js";

export class PageToolbar extends HTMLElement {
	/**@param {PageData} page*/
	constructor(page) {
		super();
		this.page = page;
	}

	async appendContent() {
		/**@type {PageContent} */
		// @ts-ignore
		const pageContentElem = this.parentElement.lastElementChild;
		pageContentElem.images.size === 0
			? patchHTMLContent(pageContentElem.innerHTML, this.page.id)
			: patchHTMLContentWithImages(pageContentElem.innerHTML, this.page.id, pageContentElem.images);
		pageContentElem.textContent = "";
		notify("Insert successfully");
	}

	render() {
		return html`<clip-icon ico="page"></clip-icon>
			<div title="${this.page.title}">
				<span>${this.page.title}</span>
				<var>${this.page.path}</var>
			</div>
			<button title="Insert content into oneNote" @click=${this.appendContent.bind(this)}>Insert</button>
			<clip-icon class="close-btn" ico="close"></clip-icon>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		$on(this.lastElementChild, "click", () => this.parentElement.remove());
	}
}

customElements.define("page-toolbar", PageToolbar);
