import L from 'leaflet';
import config from './config';
import createLegend from './component/legend';
import generatePopupHtmlContent from './component/popup-content';
import { legend, blackLine, thickerBlackLine } from './road-style';
import { computeStatus } from './data-processing';
import { zoomPrecisionMap } from './constants';
import { version } from '../package.json';
import './leaflet-plugin/control-logo';
import './leaflet-plugin/control-location';
import './leaflet-plugin/geojson-vt';
import './../node_modules/leaflet/dist/leaflet.css';
import './style/global.css';
import 'leaflet-edgebuffer';

// larger values tend to block Safari on iPhone after lots of panning and deep zoom-in
const EDGE_BUFFER_TILES = 1;

var map = undefined;
export var roadsLayer = undefined;

export function loadMap(mapOptions) {
    map = new L.Map(mapOptions.id, {
        minZoom: 7,
        maxZoom: 18,
    });

    map.setView(new L.LatLng(mapOptions.lat, mapOptions.lng), mapOptions.zoom);
    window.location.updateQueryParams()

    map.on('dragend', window.location.updateQueryParams);
    map.on('zoomend', window.location.updateQueryParams);
    map.on('click', mapClick);

    legend.showProjectTypeByIds(mapOptions.selectedLegendFilterIDs);
    createLegend().addTo(map);

    L.DomUtil.addClass(map.getContainer(), 'default-cursor');

    map.attributionControl.addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
    map.attributionControl.addAttribution('<a href="https://proinfrastructura.ro">API</a>');
    map.attributionControl.addAttribution('<a href="http://forum.peundemerg.ro">PUM</a>');
    L.control.location({ position: 'topleft', iconUrl: "images/current-location-icon.png" }).addTo(map);
    // map.addControl(new L.control.scale({ position: 'bottomleft', imperial: false, updateWhenIdle: true }))
    // map.addControl(new L.control.attribution({ position: 'bottomleft', prefix: false }));

    // createLegend().addTo(map);

    // const appVersion = L.control({ position: 'topright' });
    // appVersion.onAdd = function (map) {
    //     const div = L.DomUtil.create('div', 'leaflet-control-attribution');
    //     L.DomEvent.disableClickPropagation(div)
    //     div.innerText = `v${version}`;
    //     return div;
    // }
    // appVersion.addTo(map);
    // map.zoomControl.setPosition('topleft');
    // map.attributionControl.setPrefix(false);

    L.control.logo({
        position: "bottomleft",
        url: "https://proinfrastructura.ro",
        logoUrl: "https://proinfrastructura.ro/images/logos/api/logo_api_portrait_big.png"
    }).addTo(map);

    const googleMapTileLayer = L.tileLayer("https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}", { edgeBufferTiles: EDGE_BUFFER_TILES, attribution: "Map data ©2023 Google" }).addTo(map);


    const lotLimitIcon = L.icon({
        iconUrl: `${config.URL_PUM_API}/maps/images/pin.png`,
        iconSize: [25, 25], // width and height of the image in pixels
        iconAnchor: [12, 25], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    const lotLimitsLayer = L.geoJSON(null, {
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                const popupHtmlContent = generatePopupHtmlContent(feature.properties);
                layer.bindPopup(popupHtmlContent);
            }
        },

        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: lotLimitIcon });
        }
    }).addTo(map);


    roadsLayer = L.geoJSON.vt(null, {
        maxZoom: 18,
        pane: 'overlayPane',
        tolerance: 5,
        debug: true,
        solidChildren: true,
        edgeBufferTiles: EDGE_BUFFER_TILES,
        keepBuffer: 4,
        style: roadsLayerStyle,
        filter: function (feature, layer) {
            const found = legend.projectTypes.find(p => p.condition(feature.tags));
            if (found) return !found.hidden;
            return true;
        }
    }).addTo(map);

    L.control.layers(
        {
            "Google": googleMapTileLayer,
            "Google terrain": L.tileLayer("http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}", { edgeBufferTiles: EDGE_BUFFER_TILES, attribution: "Map data ©2023 Google" }),
            "Google satellite": L.tileLayer("http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}", { edgeBufferTiles: EDGE_BUFFER_TILES, attribution: "Map data ©2023 Google" }),
            "Google satellite & labels": L.tileLayer("http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}", { edgeBufferTiles: EDGE_BUFFER_TILES, attribution: "Map data ©2023 Google" }),
            "Thunderforest Landscape": L.tileLayer(`https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=${config.KEY_THUNDERFOREST}`, { edgeBufferTiles: EDGE_BUFFER_TILES, attribution: 'Maps © <a href="https://www.thunderforest.com/">Thunderforest</a>' })
        },
        {
            "Proiecte infrastructura": roadsLayer,   // added later
            "Limite de lot": lotLimitsLayer,  // added later
        }
    ).addTo(map);

    fetch(`${config.URL_PUM_API}/maps/data/lot_limits.json`).then(r => r.json())
        .then(function (data) { lotLimitsLayer.addData(data); });

    fetch(`${config.URL_PUM_API}/maps/data/data-sql-infra.geo.json`)
        .then(r => r.json()).then(function (data) {
            for (const feature of data.features) computeStatus(feature.properties);
            roadsLayer.addData(data);
        });
}

function showPopupDetails(latlng, props) {
    L.popup()
        .setLatLng(latlng)
        .setContent(generatePopupHtmlContent(props))
        .openOn(map);
}

function mapClick(event) {
    const { lat, lng } = event.latlng;
    const latlngStr = `${lat},${lng}`;

    fetch(`${config.URL_PUM_API}/click?latLng=${latlngStr}&max=${zoomPrecisionMap[map.getZoom()]}`).then(response => response.json()).then(data => {
        if (data === null) return
        showPopupDetails(event.latlng, data);
    });
}

function roadsLayerStyle(feature) {
    const { tags } = feature;
    let styles = []

    const found = legend.projectTypes.find(p => p.condition(tags));
    if (found && found.lineType) styles.push(...found.lineType(tags));

    if (map.getZoom() > 10) {
        if (tags.bridge) styles.unshift(thickerBlackLine);
        else if (tags.tunnel) {
            if (tags.highway) styles = [blackLine]
            else if (tags.railway) {
                styles.pop();
                styles.unshift(thickerBlackLine);
            }
        }
    }

    if (!styles.length) styles.push[{ stroke: false }];
    return styles;
}

window.location.updateQueryParams = function () {
    const queryParamsToSet = new URLSearchParams();
    queryParamsToSet.append('zoom', map.getZoom());
    queryParamsToSet.append('lat', Math.round(map.getCenter().lat * 10000) / 10000);
    queryParamsToSet.append('lng', Math.round(map.getCenter().lng * 10000) / 10000);
    queryParamsToSet.append('legend', legend.getVisibleProjectTypes().map(el => el.id).join('_'));

    const newUrl = new URL(window.location.pathname, window.location.origin);
    newUrl.search = queryParamsToSet.toString();
    window.history.replaceState(null, '', newUrl);
};
