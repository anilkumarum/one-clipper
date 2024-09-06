import { NotebookContent } from "./notebook-content.js";
import { html } from "../../js/om.event.js";
// @ts-ignore
import drawerCss from "../../style/file-drawer.css" assert { type: "css" };
import { getNoteBookList } from "../../../background/api-get-request.js";

export class NoteDrawer extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [drawerCss];
	}

	switchNoteBook({ target }) {
		// @ts-ignore
		this.lastElementChild.firstElementChild.onSwitchNotebook(target.value);
		setStore({ openNotebook: target.value });
		chrome.runtime.sendMessage({ msg: "switchNotebook", notebookId: target.value });
	}

	createPage({ target }) {
		const pageTitle = target.value;
		target.value = "";
		this.shadowRoot.lastElementChild["createPage"](pageTitle);
		target.closest("details").open = false;
	}

	render(notebooks) {
		return html`<header>
			<clip-icon ico="notebook"></clip-icon>
			<select @change=${this.switchNoteBook.bind(this)}>
				${notebooks.map((notebook) => `<option value="${notebook.id}">${notebook.name}</option>`).join("")}
			</select>
			<details>
				<summary><clip-icon ico="note-plus"></clip-icon></summary>
				<div><input type="text" placeholder="note title" @change=${this.createPage.bind(this)} /></div>
			</details>
		</header> `;
	}

	async connectedCallback() {
		this.id = "note-drawer";
		this.setAttribute("popover", "");
		this.showPopover();
		const notebooks = (await getStore("notebooks")).notebooks ?? (await getNoteBookList());
		const openNotebook = notebooks[0].id;
		this.shadowRoot.replaceChildren(this.render(notebooks));
		this.shadowRoot.appendChild(new NotebookContent(openNotebook));
		setStore({ openNotebook });
	}
}

customElements.define("note-drawer", NoteDrawer);
