import L, { DomEvent } from 'leaflet';
import { legend } from '../road-style';
import { roadsLayer } from '../map';

const ShowLegendButtonText = {
    SHOW: ">>",
    HIDE: "<<"
}

let isLegendVisible = window.innerWidth > 600;  // or !L.Browser.mobile;
let showLegendButtonText = ShowLegendButtonText.SHOW;

function legendContent() {
    const legendText =
        `<div class="legend-content-element" style="display: ${isLegendVisible ? "contents" : "none"};">`
        // + '<div style="position:relative; display:inline-block; font-size:12px; font-weight:bold; color:blue;">2023</div> - Deschidere (estimată)<br>'
        // + '<div style="position:relative; display:inline-block; font-size:12px; font-weight:bold; color:red;">2023</div> - Deschidere fără acces<br>'
        + 'AC - Autorizație de Construire<br>PT - Proiect Tehnic<br>AM - Acord de Mediu'
        + '</div>'

    const filters =
        `<div class="legend-content-element" onclick="legendFilterClickHandler(event, this)" style="display: ${isLegendVisible ? "contents" : "none"};">`
        + legend.filters.map(x => '<span>' + '<input style="margin:1pt" type=checkbox' + (x.hidden ? '' : ' checked ') + '> ' + '<div style="' + legend.basicStyle + ' ' + x.symbol + '"></div> ' + x.text + "<br></span>").join('')
        + '</div>';

    const showLegendButton = `<button id="show-legend-button" onclick="showLegendClicked()" class="show-legend-button">${showLegendButtonText}</button>`;

    return filters + legendText + showLegendButton;
}


window.showLegendClicked = () => {
    isLegendVisible = !isLegendVisible;
    const showLegendButtonText = isLegendVisible ? ShowLegendButtonText.SHOW : ShowLegendButtonText.HIDE;

    const showLegendButton = document.getElementById("show-legend-button");
    if (showLegendButton) showLegendButton.innerHTML = showLegendButtonText;
    else console.warn("showLegendButton not found");

    const legendContentElements = document.querySelectorAll<HTMLElement>(".legend-content-element");

    for (const legendContentElement of legendContentElements) {
        legendContentElement.style.display = isLegendVisible ? "contents" : "none";
    }
    legend.setState({ hidden: !isLegendVisible })
    window.location.updateQueryParams();
}

window.legendFilterClickHandler = (e: DomEvent.PropagableEvent, element: HTMLElement) => {
    if (e.target.type !== "checkbox") return;
    const indexFilter = [...element.children].findIndex(x => x.firstChild === e.target);
    legend.filters[indexFilter].hidden = !e.target.checked;
    roadsLayer.reinitialize();
    window.location.updateQueryParams();
}

export default function createLegend(options?: { hidden?: boolean }) {
    isLegendVisible = !options?.hidden ?? true;
    showLegendButtonText = isLegendVisible ? ShowLegendButtonText.SHOW : ShowLegendButtonText.HIDE;

    const legend = new L.Control({ position: 'bottomright' });
    legend.onAdd = function (_map: L.Map) {
        const div = L.DomUtil.create('div', 'leaflet-control-layers legend-container');
        L.DomEvent.disableClickPropagation(div)
        div.innerHTML = legendContent();
        return div;
    }

    return legend;
}
