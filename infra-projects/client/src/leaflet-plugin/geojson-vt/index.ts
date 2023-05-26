import geojsonvt from 'geojson-vt';
import config from '../../config';
import { Coords, DoneCallback } from 'leaflet';
import L from 'leaflet';

// interface APIFeature extends GeoJSON.Feature<GeoJSON.Geometry, any> { }
interface APIGeoJSON extends GeoJSON.FeatureCollection<GeoJSON.Geometry, any> { }
interface GeoJSONVTOptions extends L.GridLayerOptions, geojsonvt.Options {
    async?: boolean;    // not used anymore
    filter?: (feature: geojsonvt.Feature) => boolean;
    style?: L.GeoJSONVTStyleOptions | ((feature:  geojsonvt.Feature) => L.GeoJSONVTStyleOptions[]);
};

const CACHE_MAX_SIZE = 200;


class GeoJSONVT extends L.GridLayer {
    private tileIndex?: ReturnType<typeof geojsonvt>;
    private cache: Map<string, HTMLCanvasElement> = new Map();
    private keys: string[] = [];
    declare options: GeoJSONVTOptions;

    initialize(data?: APIGeoJSON, options?: GeoJSONVTOptions) {
        if (options) L.setOptions(this, options);
        if (data) this.tileIndex = geojsonvt(data, this.options);
        this.initCache();
    }

    reinitialize() {
        this.initialize();
        this.redraw();
        return this;
    }

    initCache() {
        // TODO: should be a WeakMap
        this.cache = new Map();
        this.keys = [];
    }

    addData(geojson: APIGeoJSON) {
        this.initialize(geojson);
        this.redraw()
        return this;
    }

    createTile(coords: Coords, done: DoneCallback): HTMLElement {
        const strKey = `${config.URL_PUM_API}/infra/${coords.z}/${coords.x}/${coords.y}.png`;

        // this.cache = new Map();
        const cachedTile = this.cache.get(strKey);
        if (cachedTile) {
            setTimeout(function () { done(undefined, cachedTile); });
            return cachedTile;
        }
        // create a <canvas> element for drawing       
        var tile = L.DomUtil.create("canvas", "leaflet-tile");

        const drawLater = () => {
            if (!this.tileIndex) {
                return;
            }
            // setup tile width and height according to the options
            const size = this.getTileSize();
            tile.width = size.x;
            tile.height = size.y;

            // get a canvas context and draw something on it using coords.x, coords.y and coords.z
            const ctx = tile.getContext("2d");
            if (ctx === null) {
                console.warn("Canvas is null");
                return;
            }

            // ctx.font = "12px Arial";
            // ctx.fillText(`${coords.z}/${coords.x}/${coords.y}`, 0, 10);
            const tileInfo = this.tileIndex.getTile(coords.z, coords.x, coords.y);
            const features = tileInfo ? tileInfo.features : [];
            
            for (const feature of features) {
                this.drawFeature(ctx, feature);
            }

            const img = new window.Image();
            img.addEventListener("load", function () {
                ctx?.drawImage(img, 0, 0);
            });
            img.setAttribute("src", strKey);

            if (coords.z < 12) {
                this.cache.set(strKey, tile);
                this.keys.push(strKey);
                if (this.keys.length == CACHE_MAX_SIZE) {
                    for (let i = 0; i < 10; i++)
                        this.cache.delete(this.keys[i]);
                    this.keys.splice(0, 10);
                }
            }

            // return the tile so it can be rendered on screen
            done(undefined, tile);
        };

        //looks like if there's a few ms timeout, Leaflet will not have the "zoom level mix" problem
        // setTimeout(drawLater.bind(this));
        setTimeout(drawLater);
        return tile;
    }

    drawFeature(ctx: CanvasRenderingContext2D, feature: geojsonvt.Feature) {
        if (!this.shouldDrawFeature(feature)) {
            return;
        }

        const styles = this.getStyles(feature);

        for (const currentStyle of styles) {
            ctx.save();
            ctx.beginPath();

            this.setStyle(ctx, currentStyle);
            this.drawGeometry(ctx, feature);

            ctx.stroke();
            ctx.restore();
        }
    }

    shouldDrawFeature(feature: geojsonvt.Feature) {
        return !this.options.filter || (this.options.filter instanceof Function && this.options.filter(feature));
    }

    getStyles(feature: geojsonvt.Feature) {
        let style = this.options.style instanceof Function ? this.options.style(feature) : this.options.style;
        if (!style) {
            return [{}];
        } else if (!Array.isArray(style)) {
            return [style];
        }
        return style;
    }

    drawGeometry(ctx: CanvasRenderingContext2D, feature: geojsonvt.Feature) {
        // geojsonvt.FeatureTypes is undefined, so we use numbers for the switch case
        switch (feature.type) {
            case 2:
                // line string
            case 3:
                // "as any" to disable type checking, geojsonvt.Geometry or geojsonvt.Feature are having some problems
                this.drawPolygon(ctx, feature.geometry as any as geojsonvt.Geometry[][]) ;
                break;
            case 1:
                this.drawPoint(ctx, feature.geometry);
                break;
        }
    }

    drawPolygon(ctx: CanvasRenderingContext2D, geometry: geojsonvt.Geometry[][]) {
        for (const ring of geometry) {
            ctx.moveTo(ring[0][0] / 16.0, ring[0][1] / 16.0);
            for (let i = 1; i < ring.length; i++) {
                ctx.lineTo(ring[i][0] / 16.0, ring[i][1] / 16.0);
            }
        }
    }

    drawPoint(ctx: CanvasRenderingContext2D, geometry: geojsonvt.Geometry[]) {
        for (const point of geometry) {
            const [x, y] = point;
            ctx.arc(x / 16.0, y / 16.0, 2, 0, Math.PI * 2, true);
        }
    }

    setStyle(ctx: CanvasRenderingContext2D, style: L.GeoJSONVTStyleOptions) {
        const {
            stroke = true,
            color = "#3388ff",
            weight = 1,
            opacity,
            dashArray = [],
            dashOffset = 0,
            // fill = false,
            // fillColor,
            // fillOpacity = 0.2,
            // fillRule = "evenodd",
        } = style;
        ctx.setLineDash(dashArray);
        ctx.lineDashOffset = dashOffset;
        ctx.strokeStyle = opacity ? setOpacity(color, opacity) : color;
        ctx.lineWidth = weight;

        if (!stroke) ctx.strokeStyle = "rgba(0,0,0,0)";

    }
}

function setOpacity(hexColor: string, opacity: number) {
    var r, g, b;

    if (hexColor.length === 4) {
        r = `0x${hexColor[1]}${hexColor[1]}`;
        g = `0x${hexColor[2]}${hexColor[2]}`;
        b = `0x${hexColor[3]}${hexColor[3]}`;
    } else {
        r = `0x${hexColor[1]}${hexColor[2]}`;
        g = `0x${hexColor[3]}${hexColor[4]}`;
        b = `0x${hexColor[5]}${hexColor[6]}`;
    }
    // return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    return `rgba(${[r, g, b].map(c => parseInt(c))}, ${opacity})`;
}

// @ts-ignore
// the constructor signature is different from the one in the declaration
// the constructor is actually the initialize() function
// this is how Leaflet works when extending one of their classes
L.GeoJSON.VT = GeoJSONVT;
L.geoJSON.VT = function (geojson?: APIGeoJSON, options?: GeoJSONVTOptions) {
    // @ts-ignore
    return new GeoJSONVT(geojson, options);
};


declare module 'leaflet' {
    namespace GeoJSON {
        class VT extends L.GridLayer {
            constructor(data?: APIGeoJSON, options?: GeoJSONVTOptions);
            addData(geojson: APIGeoJSON): L.GeoJSON.VT;
            reinitialize(): L.GeoJSON.VT;
        }
    }

    // todo: with export or without?
    namespace geoJSON {
        function VT(data?: APIGeoJSON, options?: GeoJSONVTOptions): L.GeoJSON.VT;
    }

    interface GeoJSONVTStyleOptions {
        stroke?: boolean;
        color?: string;
        weight?: number;
        opacity?: number;
        dashArray?: number[];
        dashOffset?: number;
    
        // these might be implemented in the future, keeping them for reference,
        // inspired from other Leaflet and 2D Canvas APIs
        // fill?: boolean;
        // fillColor?: string;
        // fillOpacity?: number;
        // fillRule?: FillRule;
        
        // these are also kept for reference, but not sure if they will be implemented
        // renderer?: Renderer;
        // className?: string;
        // lineCap?: LineCapShape;
        // lineJoin?: LineJoinShape;
    }
}

