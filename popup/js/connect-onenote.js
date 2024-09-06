const DOMAIN = "https://cloud.oneclipper.noterail.site";

export class ConnectOnenote extends HTMLDialogElement {
	constructor() {
		super();
	}

	onenoteRedirect = async () => {
		const index = (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0].index;
		const { TAG_ORE, VM_CTY } = await chrome.storage.sync.get(["TAG_ORE", "VM_CTY"]);
		//prettier-ignore
		const REDIRECT_PAGE = `${DOMAIN}/authorize/connect-one-note?r=${crypto.randomUUID()}&s=${VM_CTY}&u=${TAG_ORE}&e=${chrome.runtime.id}`;
		chrome.tabs.create({ url: REDIRECT_PAGE, index: index + 1 });
	};

	render() {
		return `<style>
			#connect-onenote {
				padding: 0;
			
				& > * {
					padding-inline: 0.5em;
				}

				& img{
					padding-inline: 0;
				}

				& button{
					display: block;
					margin: 0.5em auto;
					padding: 0.5em;
					font-size: 1em;
				}
			}
		</style>
		<img src="https://live.staticflickr.com/65535/53744921859_2b122b4c26.jpg" alt="" style="width:100%"   />
			<h2>🔐 Connection required</h2>
			<p>
				Give access to oneClipper to insert clipped contents into oneNote
			</p>

			<details>
				<summary>Privacy policy</summary>
				<ul>
					<li>We don't read any files inside onenote.</li>
					<li>We don't edit any files inside onenote.</li>
					<li>We don't save any user's personal info.</li>
				</ul>
			</details>

		<button >Connect With Onenote</button>`;
	}

	connectedCallback() {
		this.id = "connect-onenote";
		this.innerHTML = this.render();
		this.showModal();
		this.lastElementChild.addEventListener("click", this.onenoteRedirect.bind(this));
		this.listenMsg();
	}

	listenMsg() {
		chrome.runtime.onMessage.addListener((msg) => {
			if (msg === "onenote-connected") {
				document.addEventListener("visibilitychange", () => toast("onenote connected"), { once: true });
				this.remove();
			}
		});
	}
}

customElements.define("connect-onenote", ConnectOnenote, { extends: "dialog" });
