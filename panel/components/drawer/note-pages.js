import { getSectionPages } from "../../../background/api-get-request.js";
import { html } from "../../js/om.event.js";

export class NotePages extends HTMLElement {
	constructor() {
		super();
	}

	selectPage({ target }) {
		const liElem = target.closest("li");
		if (!liElem) return;
		const selectedPageId = target.closest("li").id;
		const page = { id: selectedPageId, title: liElem.textContent, path: this.sectionName };
		document.body.dispatchEvent(new CustomEvent("openpage", { detail: page }));
		setStore({ lastPage: page });
	}

	render(pages) {
		const pageItem = (page) =>
			`<li id="${page.id}"><clip-icon ico="page"></clip-icon> <span>${page.title.slice(0, 20)}</span></li>`;
		return html`${pages.map(pageItem).join("")}`;
	}

	connectedCallback() {
		const pages = [];
		this.replaceChildren(this.render(pages));
		$on(this, "click", this.selectPage.bind(this));
	}

	async onSwitchSection(sectionId, sectionName) {
		this.sectionName = sectionName;
		const pages = (await getStore(sectionId))[sectionId] ?? (await getSectionPages(sectionId));
		this.replaceChildren(this.render(pages));
		chrome.runtime.sendMessage({ msg: "createCxtMenu", pages });
	}
}

customElements.define("note-pages", NotePages);
