/*global L smoothness mainRoads otherRoads radare*/

/* Example use : 
(make sure the large data js files are served gzipped)

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <script src="https://d3js.org/topojson.v1.min.js"></script>
    <script src="https://roads2.enjoymaps.ro/geo/radare.js"></script>
    <script src="main-roads.topo.json.js"></script>
    <script src="other-roads.topo.json.js"></script>
    <link rel="stylesheet" href="https://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />
    <script src="leaflet.js"></script>
    <script src="index.js" ></script>
  </head>
*/

//checks if any element from within a list is a key in an object
function jsonHasAnyKey(obj, list) {
    for (const element of list) {
        if (element in obj) {
            return true;
        }
    }
}

try { MAP_ROOT } catch (e) {
    MAP_ROOT = "";
}

// larger values tend to block Safari on iPhone after lots of panning and deep zoom-in
const EDGE = 1;
var map = undefined;
var roadsLayer = undefined;

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
        x += (props.funding ? "<br>Finantare: " + props.severance : '');

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
            x += (props.opening_date ? "<br>Dat in circulatie: " + props.opening_date : "");

        } else if (props.railway) {
            x += (props.start_date ? "<br>Data terminarii variantei noi: " + props.start_date : '');
            x += (props.opening_date ? "<br>Data terminarii reabilitarii: " + props.opening_date : '');
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
    console.log(zoomPrecisionMap[map.getZoom()])
    fetch(`${MAP_ROOT}/click?latLng=${latlngStr}&max=${zoomPrecisionMap[map.getZoom()]}`).then(response => response.json()).then(data => {
        if (data === null) return
        showPopupDetails(event.latlng, data);
    });
}

function loadDoc(zoom) {
    zoom = zoom || 7;


    map = new L.Map('mymap', {
        minZoom: 7,
        maxZoom: 18
    });
    L.DomUtil.addClass(map._container, 'default-cursor');

    // create the OpenStreetMap layer

    const osmLink = '<a href="https://openstreetmap.org">OpenStreetMap</a>',
        thunLink = '<a href="https://thunderforest.com/">Thunderforest</a>';

    var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; ' + osmLink + ' Contributors',
        roadQUrl1 = MAP_ROOT + '/infraPbf/{z}/{x}/{y}.pbf',
        //osmBwUrl= 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
        landUrl = 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=' + thunderforestKey,
        //        landUrl = 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
        //      hikeBikeUrl='https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
        googleUrl = 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}'
        , thunAttrib = '&copy; ' + osmLink + ' Contributors & ' + thunLink;
    createLegend().addTo(map);

    var //osmMap = L.tileLayer(osmUrl, {attribution: osmAttrib, edgeBufferTiles:2}),
        googleMap = L.tileLayer(googleUrl, { edgeBufferTiles: EDGE }),
        //      osmBwMap=L.tileLayer(osmBwUrl, {attribution: osmAttrib}),
        landMap = L.tileLayer(landUrl, { attribution: thunAttrib, edgeBufferTiles: EDGE }),
        //      osmHikeBikeMap = L.tileLayer(hikeBikeUrl, {attribution: thunAttrib}),
        //      roadQMap1= L.tileLayer(roadQUrl1),
        dummy = 0;

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


    // SLD style
    const defaultStyle = {
        clickable: true,
        color: "#000",
        // "fillColor": "#00D",
        weight: 3.0,
        // "opacity": 0.6,
        // "fillOpacity": 0.2,        
        // fillOpacity: 0.8,
    };

    const invisibleStyle = {
        opacity: 0.000001
    };
    const greenStyle = {
        color: "#00FF00",
    };
    const highwayStyle = {
        clickable: true,
        color: "#0000ff",
        weight: 3.0,
    };
    const proposedHighwayStyle = {
        clickable: true,
        color: "#ffbdbd",
        weight: 3.0,
    };

    const underConstructionHighway = {
        clickable: true,
        color: Color.DEEP_SKY_BLUE,
        weight: 3.0,
    };

    var hoverStyle = {
        "fillOpacity": 0.5
    };

    var options = {
        maxZoom: 18,
        pane: 'overlayPane',
        tolerance: 5,
        debug: true,
        solidChildren: true,
        edgeBufferTiles: EDGE,
        keepBuffer: 4,
        style(feature) {
            const tags = feature.tags;
            // if (feature.type == 1) console.log(feature.type, tags)

            if (tags.highway === 'proposed') return proposedHighwayStyle;
            if (tags.highway === 'construction') return underConstructionHighway;
            if (['motorway', 'primary', 'trunk', 'rest_area'].includes(tags.highway)) return highwayStyle;

            if (tags.highway === 'lot_limit' || tags.railway === 'lot_limit') return invisibleStyle;

            // if(props.bridge ) return {
            //     "clickable": true,
            //     "color": "#000",
            //     "fillColor": "#00D",
            //     "weight": 2.0,
            //     "opacity": 0.8,
            //     "fillOpacity": 0.2,
            // }
            return defaultStyle;
        },
        filter: function (feature, layer) {
            const found = legend.projectTypes.find(p => p.condition(feature.tags));
            if (found) return !found.hidden;
            return true;
        }
    };

    const lotLimits= L.geoJSON(null, {
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                const popupHtmlContent = getPopupHtmlContent(feature.properties);
                layer.bindPopup(popupHtmlContent);
            }
        }
    });
    fetch("/maps/data/lot_limits.json").then(r=> r.json()).then(function(data){ lotLimits.addData(data); });
    
    fetch("/maps/data/data-sql-infra.geo.json").then(r => r.json()).then(function (data) {
        console.time("Preprocess geoJson");
        for (const feature of data.features) computeStatus(feature.properties);
        console.timeEnd("Preprocess geoJson");

        roadsLayer = L.geoJson.vt(data, options);
        roadsLayer.addTo(map);
        lotLimits.addTo(map);
        //roadsLayer.bindPopup('Hi There!');
        map.on('click', mapClick);

        L.control.layers(
            {
                "Google": googleMap,
                "Landscape": landMap,
                //"Hike & bike": osmHikeBikeMap,
                //  "OSM B&W":osmBwMap
            },
            {
                "Projects (client)": roadsLayer,
                "Projects (server)": L.tileLayer('/infraGraphic/{z}/{x}/{y}.png'),
                "Limite de lot": lotLimits,
            }
        ).addTo(map);
        /*layer.bindPopup(function(layer){
            console.log(layer);
        }).addTo(map);*/
    });

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
    map.addLayer(googleMap);
    //map.addLayer(pbfLayer);

    map.on('dragend', changeUrl);
    map.on('zoomend', changeUrl);


    map.setView(new L.LatLng(lat, lng), zoom);


    changeUrl();
}

