/**@param {Node} parentNode*/
function getParentTree(parentNode) {
	const element = parentNode.nodeType === Node.TEXT_NODE ? parentNode.parentElement : parentNode;
	const indexTree = [element["markerIdx"]];
	let parentElem = element;
	while ((parentElem = parentElem.parentElement)) {
		if (parentElem === document.body) break;
		indexTree.push(parentElem["markerIdx"]);
	}
	return indexTree.reverse();
}

/**@param {Node} txtNode*/
function getTxtNodeIdx(txtNode) {
	let txtNodeIdx = 0;

	let prevSibling = txtNode.previousSibling;
	while (prevSibling) {
		prevSibling = prevSibling.previousSibling;
		txtNodeIdx++;
	}
	return txtNodeIdx;
}

/**@param {Node} commonParent, @param {Node} textNode, @returns {Number[]}*/
function getRangeNodeParents(commonParent, textNode) {
	const parents = [];
	let parentElem = textNode.parentElement;
	while (parentElem !== commonParent) {
		parents.push(parentElem["markerIdx"]);
		parentElem = parentElem.parentElement;
	}
	return parents.length !== 0 ? parents.reverse() : null;
}

export class HighlightRange {
	/**@param {Range} range*/
	constructor(range) {
		const startTxtNodeIdx = getTxtNodeIdx(range.startContainer);
		const endTxtNodeIdx = getTxtNodeIdx(range.endContainer);
		this.startTxtNodeIdx = startTxtNodeIdx;
		this.startOffset = range.startOffset;
		this.endTxtNodeIdx = endTxtNodeIdx;
		this.endOffset = range.endOffset;
		const parentNode = range.commonAncestorContainer;
		this.commonParentTree = getParentTree(parentNode);

		if (range.startContainer === range.endContainer) this.startParents = this.endParents = null;
		else {
			this.startParents = getRangeNodeParents(parentNode, range.startContainer);
			this.endParents = getRangeNodeParents(parentNode, range.endContainer);
		}
	}
}
