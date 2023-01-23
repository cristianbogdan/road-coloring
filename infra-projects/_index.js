SCRIPT_ROOT += "/infra-projects/";

function recreateScriptElement(scriptElement) {
    const newScriptElement = document.createElement("script");
    for (const attribute of scriptElement.attributes) newScriptElement.setAttribute(attribute.name, attribute.value);
    const scriptText = document.createTextNode(scriptElement.textContent);
    newScriptElement.appendChild(scriptText);
    return newScriptElement;
}

function replaceHtmlElementInnerContent(sourceHtmlElement, targetHtmlElement) {
    targetHtmlElement.innerHTML = "";
    for (const childElement of Array.from(sourceHtmlElement.children)) {
        if (childElement.tagName.toUpperCase() === "SCRIPT") {
            targetHtmlElement.appendChild(recreateScriptElement(childElement));
        } else {
            targetHtmlElement.appendChild(childElement);
        }
    }
}

fetch(`${SCRIPT_ROOT}/client/dist/index.html`).then(response => response.text()).then(data => {
    const htmlContent = new DOMParser().parseFromString(data, "text/html");
    replaceHtmlElementInnerContent(htmlContent.body, document.body);
    replaceHtmlElementInnerContent(htmlContent.head, document.head);
});