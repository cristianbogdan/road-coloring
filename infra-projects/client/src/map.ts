import L from 'leaflet';
import config from './config';
import createLegend from './component/legend';
import generatePopupHtmlContent from './component/popup-content';
import { legend, blackLine, thickerBlackLine, Props } from './road-style';
import { computeStatus } from './data-processing';
import { zoomPrecisionMap } from './constants';
// import { version } from '../package.json';
import './leaflet-plugin/control-logo';
import './leaflet-plugin/control-location';
import './leaflet-plugin/geojson-vt';
import './../node_modules/leaflet/dist/leaflet.css';
import './style/global.css';
import 'leaflet-edgebuffer';
import geojsonvt from 'geojson-vt';


var map: L.Map | null = null;
export var roadsLayer: L.GeoJSON.VT;;

interface MapOptions {
    id: string;
    lat: number;
    lng: number;
    zoom: number;
    selectedLegendFilterIDs: string[];
}
export function loadMap(mapOptions: MapOptions) {
    map = new L.Map(mapOptions.id, {
        minZoom: 7,
        maxZoom: 18,
    });

    map.setView(new L.LatLng(mapOptions.lat, mapOptions.lng), mapOptions.zoom);
    window.location.updateQueryParams()

    map.on('dragend', window.location.updateQueryParams);
    map.on('zoomend', window.location.updateQueryParams);
    map.on('click', mapClick);

    map.on('baselayerchange', function (e) {
        console.log(e);
    });
    map.on('overlayadd', function (e) {
        console.log(e);
    });
    map.on('overlayremove', function (e) {
        console.log(e);
    });
    map.eachLayer(function (layer) {
        console.log(layer);
    });


    legend.showProjectTypeByIds(mapOptions.selectedLegendFilterIDs);
    createLegend().addTo(map);

    L.DomUtil.addClass(map.getContainer(), 'default-cursor');

    map.attributionControl.addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
    map.attributionControl.addAttribution('<a href="https://proinfrastructura.ro">API</a>');
    map.attributionControl.addAttribution('<a href="https://forum.peundemerg.ro">PUM</a>');
    L.control.location({ position: 'topleft', iconUrl: "images/accurate-icon.svg" }).addTo(map);
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

    const googleMapTileLayer = L.tileLayer("https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}", { attribution: "Map data ©2023 Google" }).addTo(map);


    const lotLimitIcon = L.icon({
        iconUrl: `${config.URL_PUM_API}/maps/images/pin.png`,
        iconSize: [25, 25], // width and height of the image in pixels
        iconAnchor: [12, 25], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    const lotLimitsLayer = L.geoJSON(undefined, {
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                const popupHtmlContent = generatePopupHtmlContent(feature.properties);
                layer.bindPopup(popupHtmlContent);
            }
        },

        pointToLayer: function (_feature, latlng) {
            return L.marker(latlng, { icon: lotLimitIcon });
        }
    }).addTo(map);


    roadsLayer = L.geoJSON.VT(undefined, {
        maxZoom: 18,
        pane: 'overlayPane',
        tolerance: 5,
        debug: 0,
        // solidChildren: true,
        keepBuffer: 4,
        style: roadsLayerStyle,
        filter: function (feature: geojsonvt.Feature) {
            const found = legend.projectTypes.find(p => p.condition(feature.tags as Props));
            if (found) return !found.hidden;
            return true;
        }
    }).addTo(map);

    L.control.layers(
        {
            "Google": googleMapTileLayer,
            "Google terrain": L.tileLayer("http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}", { attribution: "Map data ©2023 Google" }),
            "Google satellite": L.tileLayer("http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}", { attribution: "Map data ©2023 Google" }),
            "Google satellite & labels": L.tileLayer("http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}", { attribution: "Map data ©2023 Google" }),
            "Thunderforest Landscape": L.tileLayer(`https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=${config.KEY_THUNDERFOREST}`, { attribution: 'Maps © <a href="https://www.thunderforest.com/">Thunderforest</a>' }),
        },
        {
            "Proiecte infrastructura": roadsLayer,
            "Limite de lot": lotLimitsLayer,
        }
    ).addTo(map);

    // 
    interface LotLimitProps {
        highway: string | null,
        name: string,
        osm_id: number,
        railway: string | null,
    }
    let lotLimitsData: any = {};
    fetch(`${config.URL_PUM_API}/maps/data/lot_limits.json`).then(r => r.json())
        .then(function (data) { lotLimitsData = data });

    fetch(`${config.URL_PUM_API}/maps/data/data-sql-infra.geo.json`)
        .then(r => r.json()).then(function (data) {
            const mp2 = new Map()
            for (const feature of data.features) {                
                for (const [key, value] of Object.entries(feature.properties)) {
                    if (!mp2.has(key)) mp2.set(key, new Set());
                    else mp2.get(key).add(value);
                }
            }
            console.log('o', mp2);

            for (const feature of data.features) computeStatus(feature.properties);
            const mp = new Map()
            for (const feature of data.features) {                
                for (const [key, value] of Object.entries(feature.properties)) {
                    if (!mp.has(key)) mp.set(key, new Set());
                    else mp.get(key).add(value);
                }
            }
            console.log('x', mp);
            
            roadsLayer.addData(data);
            lotLimitsLayer.addData(lotLimitsData as GeoJSON.FeatureCollection<GeoJSON.Point, LotLimitProps>);
        });
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

    const { lat, lng } = event.latlng;
    const latlngStr = `${lat},${lng}`;
    const precisionInMeters = zoomPrecisionMap.get(map.getZoom()) ?? 1000;

    fetch(`${config.URL_PUM_API}/click?latLng=${latlngStr}&max=${precisionInMeters}`).then(response => response.json()).then(data => {
        if (data === null) return
        showPopupDetails(event.latlng, data, map!);
    });
}

function roadsLayerStyle(feature: geojsonvt.Feature) {
    const tags: Props | undefined = feature.tags;
    // console.log(tags?.osm_id);

    if (!tags) return [{ stroke: false }]; // todo: verify if this is correct
    // const { tags } = feature;
    let styles: L.GeoJSONVTStyleOptions[] = [];
    const found = legend.projectTypes.find(p => p.condition(tags));
    if (found && found.lineType) styles.push(...found.lineType(tags));

    if (map!.getZoom() > 10) {
        if (tags.bridge) styles.unshift(thickerBlackLine);
        else if (tags.tunnel) {
            if (tags.highway) styles = [blackLine]
            else if (tags.railway) {
                styles.pop();
                styles.unshift(thickerBlackLine);
            }
        }
    }

    if (!styles.length) styles.push({ stroke: false });
    return styles;
}

window.location.updateQueryParams = function () {
    const queryParamsToSet = new URLSearchParams();

    if (map) {
        queryParamsToSet.append('zoom', `${map.getZoom()}`);
        queryParamsToSet.append('lat', `${Math.round(map.getCenter().lat * 10000) / 10000}`);
        queryParamsToSet.append('lng', `${Math.round(map.getCenter().lng * 10000) / 10000}`);
        queryParamsToSet.append('legend', legend.getVisibleProjectTypes().map(el => el.id).join('_'));
    } else {
        console.warn("updating query params before map is initialized")
    }

    const newUrl = new URL(window.location.pathname, window.location.origin);
    newUrl.search = queryParamsToSet.toString();
    window.history.replaceState(null, '', newUrl);
};
