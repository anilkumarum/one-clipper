import { PageData } from "../../js/PageData.js";
import { PageCard } from "./page-card.js";
// @ts-ignore
import pageCss from "../../style/page-container.css" assert { type: "css" };
document.adoptedStyleSheets.push(pageCss);

export class PageContainer extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		getStore("lastPage").then(({ lastPage: page }) => {
			page && this.replaceChildren(new PageCard(new PageData(page)));
		});
		$on(document.body, "openpage", ({ detail }) => this.appendChild(new PageCard(detail)));
	}
}

customElements.define("page-container", PageContainer);
