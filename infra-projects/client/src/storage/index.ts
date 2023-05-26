import type { LegendStateOptions } from "../road-style";
// import type { ControlLayer } from "../leaflet-plugin/control-layers";

const LEGEND_KEY = 'legend';
const LAYERS_KEY = 'layers';

export function saveLegendToLocalStorage(legendState: LegendStateOptions) {
    localStorage.setItem(LEGEND_KEY, JSON.stringify(legendState));
}

export function loadLegendFromLocalStorage() {
    const legendStateStr = localStorage.getItem(LEGEND_KEY)
    if (!legendStateStr) return null;

    const legendFilters = JSON.parse(legendStateStr);
    return legendFilters as LegendStateOptions;
}

export function saveLayersToLocalStorage(layers: string[]) {
    // const payload: Record<string, boolean> = layers.reduce((acc: Record<string, boolean>, layer) => {
    //     acc[layer.name] = layer.visible;
    //     return acc;
    // }, {});
    localStorage.setItem(LAYERS_KEY, JSON.stringify(layers));
}

export function loadLayersFromLocalStorage() {
    const layersStr = localStorage.getItem(LAYERS_KEY)
    if (!layersStr) return null;

    const layers = JSON.parse(layersStr);
    return layers as string[];
}
