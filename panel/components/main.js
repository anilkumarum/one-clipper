import "../js/reset.js";
import "./helper/clip-icon.js";
import "./helper/copy-listener.js";
import "./helper/alert-box.js";
import "./top-bar.js";
import "./pages/page-container.js";
import { ConnectOnenote } from "../../popup/js/connect-onenote.js";
// @ts-ignore
import baseCss from "../style/base.css" assert { type: "css" };
// @ts-ignore
import clipperCss from "../style/one-clipper.css" assert { type: "css" };
document.adoptedStyleSheets.push(baseCss, clipperCss);

chrome.storage.sync.get("onenote").then(({ onenote }) => {
	onenote ?? document.body.appendChild(new ConnectOnenote());
});
