import L from 'leaflet';


L.Control.Layers.include({
    getLayers: function () {
        const allControlLayers: L.Control.ControlLayer[] = this._layers;
        const map: L.Map = this._map;

        for (const controlLayer of allControlLayers) {
            controlLayer.visible = map.hasLayer(controlLayer.layer);
        }

        return allControlLayers as L.Control.ControlLayer[];
    },
    loadLayers: function (layers: string[]) {
        if (!layers) return this;
        const map: L.Map = this._map;
        const allControlLayers: L.Control.ControlLayer[] = this._layers;
        
        for (const layerName of layers) {
            const controlLayer = allControlLayers.find(x => x.name === layerName);
            if (controlLayer) {
                map.addLayer(controlLayer.layer);
            }
        }
        
        return this;
    }
});

declare module 'leaflet' {
    namespace Control {
        export interface Layers {
            getLayers(): ControlLayer[];
            loadLayers(layers: string[]): L.Control.Layers;
        }
        export interface ControlLayer {
            layer: L.Layer;
            name: string;
            overlay: boolean;
            visible?: boolean;
        }

        export type LoadControlLayersOptions = Pick<ControlLayer, 'name' | 'visible'>[];
    }
}
