import { loadMap } from "./src/map";
import { legend } from "./src/road-style";
import type { LegendStateOptions } from "./src/road-style";
import * as storage from "./src/storage";


function getCurrentQueryParams() {
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

const queryParams = getCurrentQueryParams()

const mapOptions = {
    id: "leaflet-map",
    zoom: parseFloat(queryParams.get('zoom') as string) || 7,
    lat: parseFloat(queryParams.get('lat') as string) || 46,
    lng: parseFloat(queryParams.get('lng') as string) || 25,
    layers: storage.loadLayersFromLocalStorage() ?? ['Google', 'Proiecte infrastructura', 'Limite de lot'],
    legendState: storage.loadLegendFromLocalStorage() ?? {
        hidden: window.innerWidth < 600,  // or !L.Browser.mobile;,
        filters: legend.getDefaultFilters() as LegendStateOptions['filters']
    }
}

loadMap(mapOptions);