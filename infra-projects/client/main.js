import { loadMap } from "./src/tiles-vt";
import { legend } from "./src/road-style";

function getQueryParams() {
    // backwards compatibility
    if (window.location.href.includes('#map=')) {
        const [zoom = null, lat = null, lng = null] = window.location.href.split('#map=')[1].split('/');

        const urlParams = new URLSearchParams();
        urlParams.append('zoom', zoom);
        urlParams.append('lat', lat);
        urlParams.append('lng', lng);

        return urlParams;
    }

    // new format
    return new URLSearchParams(window.location.search)
}

const queryParams = getQueryParams()

const mapOptions = {
    id: "leaflet-map",
    zoom: parseFloat(queryParams.get('zoom')) || 7,
    lat: parseFloat(queryParams.get('lat')) || 46,
    lng: parseFloat(queryParams.get('lng')) || 25,
    selectedLegendFilterIDs: queryParams.get('legend') ?? legend.getVisibleProjectTypes().map(el => el.id),
}

loadMap(mapOptions);