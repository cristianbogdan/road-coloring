import { loadMap } from "./src/map";
import { legend } from "./src/road-style";

function getQueryParams() {
    // backwards compatibility
    if (window.location.href.includes('#map=')) {
        const [zoom, lat, lng] = window.location.href.split('#map=')[1].split('/');
        
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
    zoom: parseFloat(queryParams.get('zoom') as string) || 7,
    lat: parseFloat(queryParams.get('lat') as string) || 46,
    lng: parseFloat(queryParams.get('lng') as string) || 25,
    selectedLegendFilterIDs: queryParams.get('legend')?.split("_") ?? legend.getVisibleProjectTypes().map(el => el.id),
}

loadMap(mapOptions);