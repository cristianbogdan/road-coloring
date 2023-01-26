import L from 'leaflet';
import config from './config';
import createLegend from './component/legend';
import generatePopupHtmlContent from './component/popup-content';
import { legend, blackLine, thickerBlackLine } from './road-style';
import { computeStatus } from './data-processing';
import { zoomPrecisionMap } from './constants';
import { version } from '../package.json';
import './leaflet-plugin/control-logo';
import './leaflet-plugin/geojson-vt';
import './style/leaflet-1.9.3.css';
import './style/global.css';
import 'leaflet-edgebuffer';

// larger values tend to block Safari on iPhone after lots of panning and deep zoom-in
const EDGE = 1;
var map = undefined;
export var roadsLayer = undefined;


function showPopupDetails(latlng, props) {
    L.popup()
        .setLatLng(latlng)
        .setContent(generatePopupHtmlContent(props))
        .openOn(map);
}

function mapClick(event) {
    const { lat, lng } = event.latlng;
    const latlngStr = `${lat},${lng}`;
    //    console.log(zoomPrecisionMap[map.getZoom()])

    fetch(`${config.URL_PUM_API}/click?latLng=${latlngStr}&max=${zoomPrecisionMap[map.getZoom()]}`).then(response => response.json()).then(data => {
        if (data === null) return
        showPopupDetails(event.latlng, data);
    });
}

function loadDoc(zoom) {
    zoom = zoom || 7;

    map = new L.Map("leaflet-map", {
        minZoom: 7,
        maxZoom: 18,
    });

    map.attributionControl.addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
    map.attributionControl.addAttribution('<a href="https://proinfrastructura.ro">API</a>');
    map.attributionControl.addAttribution('<a href="http://forum.peundemerg.ro">PUM</a>');

    L.DomUtil.addClass(map.getContainer(), 'default-cursor');
    createLegend().addTo(map);
    
    const landUrl = `https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=${config.KEY_THUNDERFOREST}`;
    const googleUrl = 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}';

    const googleMap = L.tileLayer(googleUrl, { edgeBufferTiles: EDGE, attribution: "Map data ©2023 Google" });
    const landMap = L.tileLayer(landUrl, { edgeBufferTiles: EDGE, attribution: 'Maps © <a href="https://www.thunderforest.com/">Thunderforest</a>' });

    function changeUrl() {
        window.location.replace("#map=" + map.getZoom() + "/"
            + Math.round(map.getCenter().lat * 1000) / 1000 + "/"
            + Math.round(map.getCenter().lng * 1000) / 1000);
    };


    var lat = 46;
    var lng = 25;

    var x = window.location.href.split('#map=');
    if (x.length == 2) {
        var y = x[1].split("/");
        zoom = y[0];
        lat = y[1];
        lng = y[2];
    }

    var options = {
        maxZoom: 18,
        pane: 'overlayPane',
        tolerance: 5,
        debug: true,
        solidChildren: true,
        edgeBufferTiles: EDGE,
        keepBuffer: 4,
        style(feature) {
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
        },
        filter: function (feature, layer) {
            const found = legend.projectTypes.find(p => p.condition(feature.tags));
            if (found) return !found.hidden;
            return true;
        }
    };

    const limitIcon = L.icon({
        iconUrl: config.URL_PUM_API + "/maps/images/pin.png",
        iconSize: [25, 25], // width and height of the image in pixels
        iconAnchor: [12, 25], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    const lotLimits = L.geoJSON(null, {
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                const popupHtmlContent = generatePopupHtmlContent(feature.properties);
                layer.bindPopup(popupHtmlContent);
            }
        },

        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: limitIcon });
        }
    });

    fetch(config.URL_PUM_API + "/maps/data/lot_limits.json").then(r => r.json()).then(function (data) { lotLimits.addData(data); });

    fetch(config.URL_PUM_API + "/maps/data/data-sql-infra.geo.json").then(r => r.json()).then(function (data) {
        console.time("Preprocess geoJson");
        for (const feature of data.features) computeStatus(feature.properties);
        console.timeEnd("Preprocess geoJson");

        roadsLayer = L.geoJSON.vt(data, options);
        roadsLayer.addTo(map);
        lotLimits.addTo(map);
        map.on('click', mapClick);

        L.control.layers(
            {
                "Google": googleMap,
                "Google terrain": L.tileLayer("http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}", { edgeBufferTiles: EDGE, attribution: "Map data ©2023 Google" }),
                "Google satellite": L.tileLayer("http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}", { edgeBufferTiles: EDGE, attribution: "Map data ©2023 Google" }),
                "Google satellite & labels": L.tileLayer("http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}", { edgeBufferTiles: EDGE, attribution: "Map data ©2023 Google" }),
                "Thunderforest Landscape": landMap,
            },
            {
                "Proiecte infrastructura": roadsLayer,
                "Limite de lot": lotLimits,
                // "Projects (server)": L.tileLayer(config.URL_PUM_API+'/infraGraphic/{z}/{x}/{y}.png')

            }
        ).addTo(map);

        L.control.logo({
            position: "bottomleft",
            url: "https://proinfrastructura.ro",
            logoUrl: "https://proinfrastructura.ro/images/logos/api/logo_api_portrait_big.png"
        }).addTo(map);
    });

    let selectedMapLayer = "Google";
    map.addLayer(googleMap);
    map.on('dragend', changeUrl);
    map.on('zoomend', changeUrl);
    map.on("baselayerchange", function (event) {
        // const wasSatelliteLayerSelected = isSatelliteLayerSelected();
        // selectedMapLayer = event.name;
        // if (wasSatelliteLayerSelected != isSatelliteLayerSelected()) roadsLayer.reinitialize();
    });

    function isSatelliteLayerSelected() {
        return selectedMapLayer.toLowerCase().includes("satellite");
    }

    map.setView(new L.LatLng(lat, lng), zoom);
    changeUrl();
}



loadDoc()