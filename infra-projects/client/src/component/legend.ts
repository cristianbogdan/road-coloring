import L, { DomEvent } from 'leaflet';
import { legend } from '../road-style';
import { roadsLayer, lotLimitsLayer, lotLimitsData } from '../map';
import { DashArray } from '../constants';


let isLegendVisible = window.innerWidth > 600;  // or !L.Browser.mobile;

function legendContent() {
    const legendText =
        `<div class="legend-content-element" style="display: ${isLegendVisible ? "contents" : "none"};">`
        + '<div style="position:relative; display:inline-block; font-size:12px; font-weight:bold; color:blue;">2023</div> - Deschidere (estimată)<br>'
        + '<div style="position:relative; display:inline-block; font-size:12px; font-weight:bold; color:red;">2023</div> - Deschidere fără acces<br>'
        + 'AC - Autorizație de Construire<br>PT - Proiect Tehnic<br>AM - Acord de Mediu'
        + '</div>'

    const filters =
        `<div class="legend-content-element" onclick="legendFilterClickHandler(event, this)" style="display: ${isLegendVisible ? "contents" : "none"};">`
        + legend.filters.map(x => '<span>' + '<input style="margin:1pt" type=checkbox' + (x.hidden ? '' : ' checked ') + '> ' + '<canvas class="legendCanvas" width="34" height="13"></canvas> ' + x.text + "<br></span>").join('')
        + '</div>';

    const showLegendButton = `<button id="show-legend-button" onclick="showLegendClicked()" class="show-legend-button" style="transform:rotate(${isLegendVisible ? 180 : 0}deg) "></button>`;

    return filters + legendText + showLegendButton;
}


window.showLegendClicked = () => {
    isLegendVisible = !isLegendVisible;

    const showLegendButton = document.getElementById("show-legend-button");
    if (showLegendButton) showLegendButton.style.transform = `rotate(${isLegendVisible ? 180 : 0}deg)`
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
    lotLimitsLayer.clearLayers();
    lotLimitsLayer.addData(lotLimitsData);
    window.location.updateQueryParams();
}

function drawLegendLines(div: HTMLElement) {
    const legendCanvases = div.querySelectorAll<HTMLCanvasElement>("canvas");
    for (let i = 0; i < legendCanvases.length; i++) {
        const canvas = legendCanvases[i];
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        const middleY = Math.round(canvas.height / 2);
        const styles = legend.filters[i].style

        for (const style of styles) {
            ctx.beginPath();

            ctx.lineWidth = style.weight;
            ctx.strokeStyle = style.color;
            if (style.dashArray) ctx.setLineDash(DashArray.DENSER);
            ctx.moveTo(0, middleY);
            ctx.lineTo(canvas.width, middleY);
            ctx.stroke();
        }
    }
}

export default function createLegend(options?: { hidden?: boolean }) {
    isLegendVisible = !options?.hidden ?? true;

    const legendControl = new L.Control({ position: 'bottomright' });
    legendControl.onAdd = function (_map: L.Map) {
        const div = L.DomUtil.create('div', 'leaflet-control-layers legend-container');
        L.DomEvent.disableClickPropagation(div)
        div.innerHTML = legendContent();
        drawLegendLines(div)
        return div;
    }
    return legendControl;
}
