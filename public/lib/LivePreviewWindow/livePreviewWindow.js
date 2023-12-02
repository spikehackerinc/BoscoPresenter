function dragElement(elmnt) {
	var pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;

	elmnt.onmousedown = dragMouseDown;

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// Get the mouse cursor position at startup
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// Call a function whenever the cursor moves
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// Calculate the new cursor position
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// Set the element's new position
		elmnt.style.top = elmnt.offsetTop - pos2 + "px";
		elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
	}

	function closeDragElement() {
		// Stop moving when mouse button is released
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

function initPreviewWindow(idComponent, url, title) {
	let previewWindow = `
    <div class="preview-container" id="${idComponent}">
      <header onMouseDown="dragElement(document.getElementById('${idComponent}'))">${title}</header>
      <iframe class="scaled-iframe" src="${url}"></iframe>
    </div>
  `;

	// Add the preview window to the body
	document.body.appendChild(
		new DOMParser().parseFromString(previewWindow, "text/html").body
			.firstChild
	);

	setTimeout(() => {
		let previewContainer =
			document.querySelector(".preview-container");
		let scaledIframe = document.querySelector(".scaled-iframe");

		let scaleX =
			previewContainer.offsetWidth / scaledIframe.offsetWidth;
		let scaleY =
			previewContainer.offsetHeight /
			scaledIframe.offsetHeight;

		scaledIframe.style.transform = `scale(${scaleX}, ${scaleY})`;
	}, 1000);

	increasePreviewWindowSize();
}

function increasePreviewWindowSize() {
	let previewContainer = document.querySelector(".preview-container");
	let width = previewContainer.offsetWidth;
	let height = previewContainer.offsetHeight;

	// Increase the width and height by 1%
	previewContainer.style.width = width * 1.01 + "px";
	previewContainer.style.height = height * 1.01 + "px";

	// Recalculate the scale for the iframe
	let scaledIframe = document.querySelector(".scaled-iframe");
	let scaleX = previewContainer.offsetWidth / scaledIframe.offsetWidth;
	let scaleY = previewContainer.offsetHeight / scaledIframe.offsetHeight;

	scaledIframe.style.transform = `scale(${scaleX}, ${scaleY})`;
}
