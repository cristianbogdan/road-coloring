import L from 'leaflet';
import config from './config';
import createLegend from './legend';
import { legend, blackLine, thickerBlackLine } from './road-style';
import { Color, zoomPrecisionMap } from './constants';
import './leaflet-geojson-vt';


// larger values tend to block Safari on iPhone after lots of panning and deep zoom-in
const EDGE = 1;
var map = undefined;
export var roadsLayer = undefined;

function computeStatus(props) {
    if (!props.status) return;
    for (const prop of props.status.split(',')) {
        const [prop_key, prop_value] = prop.split(':');
        if (prop_value) {
            props[prop_key] = prop_value;
            if (prop_key == 'progress') {
                props.progress = prop_value.split(' ');
                props.latestProgress = parseFloat(props.progress[0].split('%')[0]);
            } else if (prop_key == 'progress_estimate') {
                props.progress_estimate = prop_value.split(' ');
                props.latestProgress = parseFloat(props.progress_estimate[0].split('%')[0]);
            } else if (prop_key == 'signal_progress') {
                props.signal_progress = prop_value.split(' ');
                props.latestSignalProgress = parseFloat(props.signal_progress[0].split('%')[0]);
            }
        } else
            props[prop_key] = true;
    };
    //if(p.progress_estimate)
    //p.latestProgress=parseFloat(p.progress_estimate.split('%')[0]);
    props.hadStatus = true;
    props.status = null;
};

function getPopupHtmlContent(props) {
    if (!props.osm_id) props.osm_id = props.id.split('/')[1];

    if (props.comentarii_problema) {
        return '<b>' + props.nume + '</b><br/>'
            + props.comentarii_problema + '<br/><br/>'
            + props.comentarii_rezolvare_curenta + '<br/>'
            + 'Estimare: ' + props.estimare_rezolvare +
            (props.link ? ('<br/><a href="' + props.link + '" target="PUM">detalii</a>') : '');


    }
    if (props.highway == 'lot_limit' || props.railway == 'lot_limit')
        return 'Limita lot ' + (props.highway ? 'autostrada' : 'CF') + ' <a href=\"https://openstreetmap.org/node/' + props.osm_id + '\" target="OSM">' + props.name + '</a>';

    var x = (props.highway ? props.highway : props.railway)
        + ' <a href=\"https://openstreetmap.org/way/' + props.osm_id + '\" target="OSM">'
        + (props.ref ? props.ref + (props.name ? ('(' + props.name + ')') : '') : (props.name ? props.name : props.osm_id))
        + "</a>"
        //+"[<a href=\"https://openstreetmap.org/edit?way="+prop.osm_id+"\" target=\"OSMEdit\">edit</a>] "
        //    +"</a> [<a href=\"https://openstreetmap.org/edit?editor=potlatch2&way="+prop.osm_id+"\" target=\"OSMEdit\">edit-potlach</a>]"
        ;

    if (props.status) computeStatus(props);

    if (props.highway == 'construction' || props.highway == 'proposed' || (props.railway && props.latestProgress != 100)) {
        x += (props.opening_date ? "<br>Estimarea terminarii constructiei: " + props.opening_date : '');
        x += (props.access == 'no' ? "<br><font color='red'>Inchis traficului la terminarea constructiei</font>" : '');

        if (props.hadStatus)
            if (props.highway) x += "<br>" + (props.AC ? '<font color=' + Color.DEEP_SKY_BLUE + '>Autorizatie de construire</font>' : props.PTE ? '<font color=' + Color.ORANGE + '>Are Proiect Tehnic aprobat dar nu Autorizatie de Construire</font>' : props.AM ? '<font color=' + Color.ORANGE_RED + '>Are Acord de Mediu dar nu Proiect Tehnic aprobat, deci nu are Autorizatie de Construire</font>' : '<font color=' + Color.RED + '>Nu are Acord de Mediu, deci nu are Autorizatie de Construire</font>');
            else x += (props.AC ? "<br>" + '<font color=' + Color.DEEP_SKY_BLUE + '>Autorizatie de construire</font>' : '');
        else if (props.highway)
            x += "<br>Progresul constructiei necunoscut";
        if (props.tender) {
            x += "<br>In licitatie " + props.tender;
            if (props.winner) x += "<br> castigator " + props.winner;
        }
        x += (props.builder ? "<br>Constructor: " + props.builder : '');
        x += (props.severance ? "<br>Reziliat: " + props.severance : '');
        x += (props.financing ? "<br>Finantare: " + props.financing : '');

        if (props.progress) {
            var color = props.latestProgress > 75 ? Color.DODGER_BLUE : props.latestProgress > 50 ? Color.DEEP_SKY_BLUE : props.latestProgress > 25 ? Color.LIGHT_SKY_BLUE : props.latestProgress > 0 ? Color.POWDER_BLUE : Color.GRAY;
            x += "<br>Stadiul lucrarilor: <font color=" + color + "><b>" + props.progress[0] + "</b></font><font size=-2>"
                + props.progress.slice(1).reduce(function (s, e) {
                    return s + " " + e.trim();
                }, "")
                + "</font>";
        }
        if (props.progress_estimate) {
            var color_e = props.latestProgress > 75 ? Color.DODGER_BLUE : props.latestProgress > 50 ? Color.DEEP_SKY_BLUE : props.latestProgress > 25 ? Color.LIGHT_SKY_BLUE : props.latestProgress > 0 ? Color.POWDER_BLUE : Color.GRAY;
            x += "<br>Estimare stadiu: <font color=" + color_e + "><b>" + props.progress_estimate[0] + "</b></font><font size=-2>"
                + props.progress_estimate.slice(1).reduce(function (s, e) {
                    return s + " " + e.trim();
                }, "")
                + "</font>";
        }
    } else {
        if (props.highway) {
            x += (props.start_date ? "<br>Data terminarii constructiei: " + props.start_date : '');
            x += (props.access_note ? "<br>Dat in circulatie: " + props.access_note.split(' ').pop() : '');

        } else if (props.railway) {
            x += (props.start_date ? "<br>Data terminarii variantei noi: " + props.start_date : '');
            x += (props.start_date_note ? "<br>Data terminarii reabilitarii: " + props.start_date_note.split(' ').pop() : '');
        }
        x += props.access == 'no' ? "<br><font color='red'>Inchis traficului</font>" : "";
    }

    if (props.railway) {
        if (props.signal_progress && !props["railway:etcs"]) {
            x += "<br>Semnalizare ETCS: <font color=" + Color.ORANGE + "><b>" + props.signal_progress[0] + "</b></font><font size=-2><br>"
                + props.signal_progress.slice(1).reduce(function (s, e) {
                    return s + " " + e.trim();
                }, "")
        } else if (props["railway:etcs"]) x += "<br>Semnalizare ETCS: nivel " + props["railway:etcs"];
        else if (props["construction:railway:etcs"]) x += "<br>Semnalizare ETCS: implementare impreuna cu reabilitarea liniei, nivel " + props["construction:railway:etcs"];
        else x += "<br>Semnalizare ETCS: neimplementat";
    }

    x += props.bridge == 'yes' ? "<br>Pod" : "";
    x += props.tunnel == 'yes' ? "<br>Tunel" : "";
    return x;
}


function showPopupDetails(latlng, props) {
    L.popup()
        .setLatLng(latlng)
        .setContent(getPopupHtmlContent(props))
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

    L.DomUtil.addClass(map._container, 'default-cursor');
    createLegend().addTo(map);

    const landUrl = `https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=${config.KEY_THUNDERFROST}`;
    const googleUrl = 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}';
    // const osmLink = '<a href="https://openstreetmap.org">OpenStreetMap</a>';
    // const thunLink = '<a href="https://thunderforest.com/">Thunderforest</a>';
    // const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    // const roadQUrl1 = config.URL_PUM_API+ '/infraPbf/{z}/{x}/{y}.pbf';
    // const osmBwUrl= 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
    // const landUrl = 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png';
    // const  hikeBikeUrl='https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png';

    const googleMap = L.tileLayer(googleUrl, { edgeBufferTiles: EDGE, attribution: "Map data ©2023 Google" });
    const landMap = L.tileLayer(landUrl, { edgeBufferTiles: EDGE, attribution: 'Maps © <a href="https://www.thunderforest.com/">Thunderforest</a>' });
    // const osmBwMap = L.tileLayer(osmBwUrl);
    // const osmMap = L.tileLayer(osmUrl, { edgeBufferTiles:2 });
    // const osmHikeBikeMap = L.tileLayer(hikeBikeUrl, { attribution: thunAttrib });
    // const roadQMap1= L.tileLayer(roadQUrl1);

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
        iconUrl: config.URL_PUM_API+ "/maps/images/pin.png",
        iconSize: [25, 25], // width and height of the image in pixels
        iconAnchor: [12, 25], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    const lotLimits = L.geoJSON(null, {
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                const popupHtmlContent = getPopupHtmlContent(feature.properties);
                layer.bindPopup(popupHtmlContent);
            }
        },

        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: limitIcon });
        }
    });

    fetch(config.URL_PUM_API+ "/maps/data/lot_limits.json").then(r => r.json()).then(function (data) { lotLimits.addData(data); });

    fetch(config.URL_PUM_API+ "/maps/data/data-sql-infra.geo.json").then(r => r.json()).then(function (data) {
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
                // "Hike & bike": osmHikeBikeMap,
                // "OSM B&W":osmBwMap
            },
            {
                "Proiecte infrastructura": roadsLayer,
                //                "Projects (server)": L.tileLayer(config.URL_PUM_API+'/infraGraphic/{z}/{x}/{y}.png'),
                "Limite de lot": lotLimits,
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
    /*    var pbfLayer= L.vectorGrid.protobuf(roadQUrl1, {
            getFeatureId: function(f) {
                console.log(f);
                return f.properties.osm_id;
            },
            vectorTileLayerStyles:{
                way:style
            },
    
            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    var popupString = '<div class="popup">';
                    for (var k in feature.properties) {
                        var v = feature.properties[k];
                        if(v)
                            popupString += k + ': ' + v + '<br />';
                    }
                    popupString += '</div>';
                    layer.bindPopup(popupString);
                }
    
            }
            
        }
                                           );
    */
    // map.addLayer(landMap);

}

L.Control.Logo = L.Control.extend({
    options: {
        position: "bottomleft",
        url: "",
        logoUrl: ""
    },

    initialize(options) {
        L.setOptions(this, options);
    },
    onAdd: function (map) {
        const a = L.DomUtil.create('a', 'leaflet-control-layers logo-container');
        a.innerHTML = `<img id="api" src="${this.options.logoUrl}" width="50"/>`;
        if (this.options.url) {
            a.setAttribute('href', this.options.url);
            L.DomUtil.addClass(a, 'clickable')
        }
        return a;
    },
    onRemove: function (map) { },
});

L.control.logo = function (opts) {
    return new L.Control.Logo(opts);
}

loadDoc()