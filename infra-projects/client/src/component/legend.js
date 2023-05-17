import L from 'leaflet';
import { legend } from '../road-style';
import { roadsLayer } from '../map';

let isLegendVisible = true;

function legendContent() {
    const ShowLegendButtonText = {
        SHOW: ">>",
        HIDE: "<<"
    }
    let showLegendButtonText = ShowLegendButtonText.SHOW;

    const legendText =
        '<div class="legend-content-element">'
        + '<div style="position:relative; display:inline-block; font-size:12px; font-weight:bold; color:blue;">2023</div> - Deschidere (estimată)<br>'
        + '<div style="position:relative; display:inline-block; font-size:12px; font-weight:bold; color:red;">2023</div> - Deschidere fără acces<br>'
        + 'AC - Autorizație de Construire<br>PT - Proiect Tehnic<br>AM - Acord de Mediu'
        + '</div>'

    const filters =
        '<div class="legend-content-element" onclick="legendFilterClickHandler(event, this)">'
        + legend.projectTypes.map(x => '<span>' + (x.canHide ? '<input style="margin:1pt" type=checkbox' + (x.hidden ? '' : ' checked ') + '> ' : ' ') + '<div style="' + legend.basicStyle + ' ' + x.symbol + '"></div> ' + x.text + "<br></span>").join('')
        + '</div>';

    const showLegendButton = `<button id="show-legend-button" onclick="showLegendClicked()" class="show-legend-button">${showLegendButtonText}</button>`;

    return filters + legendText + showLegendButton;
}


window.showLegendClicked = () => {
    isLegendVisible = !isLegendVisible;
    const showLegendButtonText = isLegendVisible ? ShowLegendButtonText.SHOW : ShowLegendButtonText.HIDE;

    const showLegendButton = document.getElementById("show-legend-button");
    showLegendButton.innerHTML = showLegendButtonText;

    const legendContentElements = document.getElementsByClassName("legend-content-element");
    for (const legendContentElement of legendContentElements) {
        legendContentElement.style.display = isLegendVisible ? "contents" : "none";
    }
}

window.legendFilterClickHandler = (e, div) => {
    if (e.target.type !== "checkbox") return;
    const indexFilter = [...div.children].findIndex(x => x.firstChild === e.target);
    legend.projectTypes[indexFilter].hidden = !e.target.checked;
    roadsLayer.reinitialize();
    window.location.updateQueryParams();
}

export default function createLegend() {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'leaflet-control-layers legend-container');
        L.DomEvent.disableClickPropagation(div)
        div.innerHTML = legendContent();
        return div;
    }

    return legend;
}
