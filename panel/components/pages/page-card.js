import { PageData } from "../../js/PageData.js";
import { PageContent } from "./page-content.js";
import { PageToolbar } from "./page-toolbar.js";

/**@type {PageCard}*/
export var focusedPage;

export class PageCard extends HTMLElement {
	/**@param {PageData} page*/
	constructor(page) {
		super();
		this.page = page;
	}

	render() {
		const toolBar = new PageToolbar(this.page);
		const pageContent = new PageContent();
		this.append(toolBar, pageContent);
		$on(toolBar, "click", this.onPageSelected.bind(this));
	}

	connectedCallback() {
		this.render();
		this.onPageSelected();
	}

	onPageSelected() {
		focusedPage?.removeAttribute("selected");
		focusedPage = this;
		this.setAttribute("selected", "");
	}

	disconnectedCallback() {
		if (this.focusedPage === this) this.focusedPage = null;
	}
}

customElements.define("page-card", PageCard);
