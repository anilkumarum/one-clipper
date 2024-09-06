import { $on, $onO, overLay } from "./crop-box.js";

const bodyWidth = document.body.scrollWidth;
const bodyHeight = document.body.scrollHeight;

const moverFuncs = {
	top: ({ pageY }) => {
		overLay.style.borderTopWidth = pageY + "px";
	},

	right: ({ pageX }) => {
		overLay.style.borderRightWidth = bodyWidth - pageX + "px";
	},

	bottom: ({ pageY }) => {
		overLay.style.borderBottomWidth = bodyHeight - pageY + "px";
	},

	left: ({ pageX }) => {
		overLay.style.borderLeftWidth = pageX + "px";
	},

	"top-left": ({ pageX, pageY }) => {
		overLay.style.borderTopWidth = pageY + "px";
		overLay.style.borderLeftWidth = pageX + "px";
	},

	"top-right": ({ pageX, pageY }) => {
		overLay.style.borderRightWidth = bodyWidth - pageX + "px";
		overLay.style.borderTopWidth = pageY + "px";
	},

	" bottom-left": ({ pageX, pageY }) => {
		overLay.style.borderBottomWidth = bodyHeight - pageY + "px";
		overLay.style.borderLeftWidth = pageX + "px";
	},

	"bottom-right": ({ pageX, pageY }) => {
		overLay.style.borderRightWidth = bodyWidth - pageX + "px";
		overLay.style.borderBottomWidth = bodyHeight - pageY + "px";
	},

	"view-box": ({ pageX, pageY }) => {
		overLay.style.borderTopWidth = downTopWidth - (downMY - pageY) + "px";
		overLay.style.borderBottomWidth = downBottomWidth + (downMY - pageY) + "px";
		overLay.style.borderRightWidth = downRightWidth + (downMX - pageX) + "px";
		overLay.style.borderLeftWidth = downLeftWidth - (downMX - pageX) + "px";
	},
};

export function startSelector(className) {
	const cropListener = moverFuncs[className];
	$on(document.body, "mousemove", cropListener);
	$on(overLay.firstElementChild, "mousedown", setResizer);
	$onO(window, "mouseup", () => {
		document.body.removeEventListener("mousemove", cropListener);
		overLay.style.cursor = "default";
		overLay.lastElementChild["hidden"] = false;
	});
}

let downMY, downMX, downTopWidth, downRightWidth, downBottomWidth, downLeftWidth;
export function setResizer({ target, pageX, pageY }) {
	downMY = pageY;
	downMX = pageX;
	downTopWidth = +overLay.style.borderTopWidth.slice(-0, -2);
	downRightWidth = +overLay.style.borderRightWidth.slice(-0, -2);
	downBottomWidth = +overLay.style.borderBottomWidth.slice(-0, -2);
	downLeftWidth = +overLay.style.borderLeftWidth.slice(-0, -2);
	startSelector(target.className);
}
