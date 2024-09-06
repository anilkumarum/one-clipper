import { getNoteBookSections } from "../../../background/api-get-request.js";
import { html } from "../../js/om.event.js";
import { colors } from "../../js/util.js";

export class NoteSections extends HTMLElement {
	constructor(notebookId) {
		super();
		this.notebookId = notebookId;
	}

	render(sections) {
		const pageItem = (section, index) => `<li id="${section.id}"  title="${section.name}">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" >
				<path 
					fill="${colors[index]}" 
					d="M16 0H8C6.9 0 6 .9 6 2V18C6 19.1 6.9 20 8 20H20C21.1 20 22 19.1 22 18V6L16 0M20 18H8V2H15V7H20V18M4 4V22H20V24H4C2.9 24 2 23.1 2 22V4H4Z" />
				<text x="8.5" y="17" style="font-size: 15px;">${section.name[0].toUpperCase()}</text>
			</svg>
			<span>${section.name.slice(0, 15)}</span>
		</li>`;
		return sections.map(pageItem).join("");
	}

	async connectedCallback() {
		this.tabIndex = 0;
		const sections =
			(await getStore(this.notebookId))[this.notebookId] ?? (await getNoteBookSections(this.notebookId));
		this.innerHTML = this.render(sections);
	}

	async onSwitchNotebook(notebookId) {
		this.notebookId = notebookId;
		const sections =
			(await getStore(this.notebookId))[this.notebookId] ?? (await getNoteBookSections(this.notebookId));
		this.innerHTML = this.render(sections);
	}
}

customElements.define("note-sections", NoteSections);
