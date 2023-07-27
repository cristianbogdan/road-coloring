import type { LegendStateOptions } from './road-style'
import type { LotLimitProps, Props } from './types';
import type { Point, LineString, FeatureCollection, Feature } from 'geojson';

import L from 'leaflet';
import config from './config';
import createLegend from './component/legend';
import generatePopupHtmlContent from './component/popup-content';
import { legend, blackLine, thickerBlackLine, } from './road-style';
import { computeStatus } from './data-processing';
import { zoomPrecisionMap } from './constants';
// import { version } from '../package.json';
import './leaflet-plugin/control-logo';
import './leaflet-plugin/control-location';
import './leaflet-plugin/geojson-vt';
import './leaflet-plugin/control-layers';
import './../node_modules/leaflet/dist/leaflet.css';
import './style/global.css';
import 'leaflet-edgebuffer';
import * as storage from './storage';

var controlLayers: L.Control.Layers;
var map: L.Map;
export let roadsLayer: L.GeoJSON.VT;
export let lotLimitsLayer: L.GeoJSON;
export let lotLimitsData: FeatureCollection<Point, LotLimitProps>;

interface MapOptions {
    id: string;
    lat: number;
    lng: number;
    zoom: number;
    legendState: LegendStateOptions;
    layers: string[];
}
export function loadMap(mapOptions: MapOptions) {
    map = new L.Map(mapOptions.id, {
        minZoom: 7,
        maxZoom: 18,
    });

    map.setView(new L.LatLng(mapOptions.lat, mapOptions.lng), mapOptions.zoom);

    legend.setState(mapOptions.legendState);
    createLegend({
        hidden: mapOptions.legendState.hidden,
    }).addTo(map);

    L.DomUtil.addClass(map.getContainer(), 'default-cursor');

    map.attributionControl.addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
    map.attributionControl.addAttribution('<a href="https://proinfrastructura.ro">API</a>');
    map.attributionControl.addAttribution('<a href="https://forum.peundemerg.ro">PUM</a>');
    L.control.location({ position: 'topleft', iconUrl: `${import.meta.env.BASE_URL}accurate-icon.svg` }).addTo(map);

    // map.addControl(new L.control.scale({ position: 'bottomleft', imperial: false, updateWhenIdle: true }))
    // map.addControl(new L.control.attribution({ position: 'bottomleft', prefix: false }));

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

    const lotLimitIcon = L.icon({
        iconUrl: `${import.meta.env.BASE_URL}pin.png`,
        iconSize: [25, 25], // width and height of the image in pixels
        iconAnchor: [12, 25], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    lotLimitsLayer = L.geoJSON(undefined, {
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                const popupHtmlContent = generatePopupHtmlContent(feature.properties);
                layer.bindPopup(popupHtmlContent);
            }
        },

        filter: function (feature: Feature<Point, LotLimitProps>) {
            const latlng = new L.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
            return roadsLayer.isPointOnLine(latlng);
        },

        pointToLayer: function (_feature, latlng) {
            return L.marker(latlng, { icon: lotLimitIcon });
        }
    });


    roadsLayer = L.geoJSON.VT(undefined, {
        maxZoom: 18,
        pane: 'overlayPane',
        tolerance: 5,
        debug: 0,
        // keepBuffer: 1,
        lineLabel: roadLabelYears,
        // lineLabel: roadLabelYears,
        style: roadsLayerStyle,
        filter: function (props: Props) {
            const found = legend.filters.find(p => p.condition(props));
            if (found) return !found.hidden;
            return true;
        }
    });

    const baseLayers = {
        "Google": L.tileLayer("https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}", { attribution: "Map data ©2023 Google" }),
        "Google terrain": L.tileLayer("https://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}", { attribution: "Map data ©2023 Google" }),
        "Google satellite": L.tileLayer("https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}", { attribution: "Map data ©2023 Google" }),
        "Google satellite & labels": L.tileLayer("https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}", { attribution: "Map data ©2023 Google" }),
        "Thunderforest Landscape": L.tileLayer(`https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=${config.KEY_THUNDERFOREST}`, { attribution: 'Maps © <a href="https://www.thunderforest.com/">Thunderforest</a>' }),
    };

    const overlays = {
        "Proiecte infrastructura": roadsLayer,
        "Limite de lot": lotLimitsLayer,
    }

    controlLayers = L.control.layers(baseLayers, overlays).addTo(map);
    controlLayers.loadLayers(mapOptions.layers)


    // save the initial state of the map after all layers have been added
    // window.location.updateQueryParams()

    fetch(`${config.URL_PUM_API}/maps/data/lot_limits.json`).then(r => r.json())
        .then(function (data) {
            lotLimitsData = data;
            // console.log('lotLimitsData', lotLimitsData);
        });

    fetch(`${config.URL_PUM_API}/maps/data/data-sql-infra.geo.json`)
        .then(r => r.json()).then(function (data: FeatureCollection<LineString, Props>) {
            // console.log('roadsData', data);
            for (const feature of data.features) computeStatus(feature.properties);

            // console.time('add-road-data');
            roadsLayer.addData(data);
            // console.timeEnd('add-road-data');

            // console.time('add-lot-limits-data');
            lotLimitsLayer.addData(lotLimitsData as FeatureCollection<Point, LotLimitProps>);
            // console.timeEnd('add-lot-limits-data');
        });

    map.on('click', mapClick);
    map.on('dragend', window.location.updateQueryParams);
    map.on('zoomend', window.location.updateQueryParams);
    map.on('baselayerchange', window.location.updateQueryParams);
    map.on('overlayadd', window.location.updateQueryParams);
    map.on('overlayremove', window.location.updateQueryParams);
}

function showPopupDetails(latlng: L.LatLng, props: Props, map: L.Map) {
    L.popup()
        .setLatLng(latlng)
        .setContent(generatePopupHtmlContent(props))
        .openOn(map);
}


function mapClick(event: L.LeafletMouseEvent) {
    if (!map) {
        console.warn("map not initialized for click event");
        return
    }

    const precisionInMeters = zoomPrecisionMap.get(map.getZoom()) ?? 1000;
    const feature = roadsLayer.getClosestFeature(event.latlng, { maxDistance: precisionInMeters, units: 'meters' });

    if (!feature) return;
    showPopupDetails(event.latlng, feature.feature.properties, map);
    // console.log("map click", feature);
}

function roadsLayerStyle(props: Props) {
    let styles: L.GeoJSONVTStyleOptions[] = [];
    const found = legend.filters.find(p => p.condition(props));
    if (found && found.lineType) styles.push(...found.lineType(props));

    if (map!.getZoom() > 10) {
        if (props.bridge) styles.unshift(thickerBlackLine);
        else if (props.tunnel) {
            if (props.highway) styles = [blackLine]
            else if (props.railway) {
                styles.pop();
                styles.unshift(thickerBlackLine);
            }
        }
    }

    // if (tags.ref?.toLowerCase().includes("a10")) styles.unshift({ color: Color.YELLOW, weight: 20 });
    return styles;
}

function roadLabelName(props: Props) {
    const text = props.ref;
    if (!text) return;
    return {
        text
    };
}

// used to display the opening date or the access note on the road, keeping this function for now
function roadLabelYears(props: Props) {
    const opening_date = props.opening_date;
    const start_date = props.start_date;
    const access_note = props?.access_note?.split(' ').pop();

    const text = opening_date ?? access_note ?? start_date;
    if (!text) return;

    const style = {
        color: access_note && start_date && access_note > start_date ? Color.RED : Color.BLUE,
    }
    return {
        text,
        style
    }
}

window.location.updateQueryParams = function () {
    if (!map) {
        console.warn("updating query params before map is initialized")
        return
    }
    const queryParamsToSet = new URLSearchParams();

    const zoom = map.getZoom();
    const lat = Math.round(map.getCenter().lat * 10000) / 10000;
    const lng = Math.round(map.getCenter().lng * 10000) / 10000;

    storage.saveLegendToLocalStorage(legend.getState());
    storage.saveLayersToLocalStorage(controlLayers.getLayers().filter(l => l.visible).map(l => l.name));

    queryParamsToSet.append('zoom', `${zoom}`);
    queryParamsToSet.append('lat', `${lat}`);
    queryParamsToSet.append('lng', `${lng}`);

    const newUrl = new URL(window.location.pathname, window.location.origin);
    newUrl.search = queryParamsToSet.toString();
    window.history.replaceState(null, '', newUrl);
};
