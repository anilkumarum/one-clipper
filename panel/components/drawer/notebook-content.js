import { NoteSections } from "./note-sections.js";
import { NotePages } from "./note-pages.js";
import { createHTMLPage } from "../../../background/api-request.js";

export class NotebookContent extends HTMLElement {
	constructor(notebookId) {
		super();
		this.notebookId = notebookId;
	}

	async createPage(pageTitle) {
		const page = await createHTMLPage("", this.sectionId, pageTitle);
		page.path = $("li.open", this).lastElementChild.textContent ?? "";
		document.body.dispatchEvent(new CustomEvent("openpage", { detail: page }));
	}

	switchSection({ target }) {
		const liElem = target.closest("li");
		if (!liElem) return;
		liElem.className = "open";
		this.sectionId = liElem?.id;
		const sectionName = liElem?.lastElementChild.textContent;
		// @ts-ignore
		this.lastElementChild.onSwitchSection(this.sectionId, sectionName);
		setStore({ lastSectionId: this.sectionId });
	}

	render() {
		return [new NoteSections(this.notebookId), new NotePages()];
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
		$on(this.firstElementChild, "click", this.switchSection.bind(this));
	}
}

customElements.define("notebook-content", NotebookContent);
