import geojsonvt from 'geojson-vt';
import config from '../../config';
import { Coords, DoneCallback } from 'leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { Props } from '../../types';
import type { Feature, LineString } from '@turf/turf';


// interface APIFeature extends GeoJSON.Feature<GeoJSON.Geometry, any> { }
interface APIGeoJSON extends GeoJSON.FeatureCollection<GeoJSON.LineString, Props> { }
interface GeoJSONVTOptions extends L.GridLayerOptions, geojsonvt.Options {
    async?: boolean;    // not used anymore
    filter?: (feature: Props) => boolean;
    style?: L.GeoJSONVTStyleOptions | ((feature: Props) => L.GeoJSONVTStyleOptions[]);
};

interface ClosestFeatureOptions {
    maxDistance?: number;
    units?: turf.Units;
}
const CACHE_MAX_SIZE = 200;


class GeoJSONVT extends L.GridLayer {
    private tileIndex?: ReturnType<typeof geojsonvt>;
    private cache: Map<string, HTMLCanvasElement> = new Map();
    private keys: string[] = [];
    private filteredData: APIGeoJSON = { features: [], type: "FeatureCollection" };
    private originalData: APIGeoJSON = { features: [], type: "FeatureCollection" };

    declare options: GeoJSONVTOptions;

    initialize(data?: APIGeoJSON, options?: GeoJSONVTOptions) {
        if (options) L.setOptions(this, options);
        if (data) {
            this.originalData = data;
            // this.setFilteredData(this.originalData);

        }
        if (this.originalData && this.options.filter !== options?.filter) {
            this.setFilteredData(this.originalData);
            this.tileIndex = geojsonvt(this.filteredData, this.options);

        }
        this.initCache();
    }

    reinitialize() {
        this.initialize();
        this.redraw();
        return this;
    }

    protected initCache() {
        // TODO: should be a WeakMap
        this.cache = new Map();
        this.keys = [];
    }

    addData(data: APIGeoJSON) {
        this.initialize(data);
        this.redraw()
        return this;
    }

    setFilteredData(data: APIGeoJSON) {
        if (!this.options.filter) {
            this.filteredData = data;
            return this;
        }

        // console.time('filtering-data');
        this.filteredData = { features: [], type: "FeatureCollection" };
        for (const feature of data.features) {
            if (this.options.filter(feature.properties)) {
                this.filteredData.features.push(feature);
            }
        }
        // console.timeEnd('filtering-data');
        return this;
    }

    getClosestFeature(latlng: L.LatLng, options?: ClosestFeatureOptions) {
        // console.time('getting-closest-feature');

        let closestFeature = {
            distance: Infinity,
            feature: undefined
        } as {
            distance: number,
            feature?: GeoJSON.Feature
        }

        for (const feature of this.filteredData.features) {
            const distance = turf.pointToLineDistance([latlng.lng, latlng.lat], feature.geometry, { method: "geodesic", units: options?.units }) // takes lng lat
            if (distance < closestFeature.distance) {
                closestFeature = {
                    distance,
                    feature
                }
            }
        }
        // console.timeEnd('getting-closest-feature');

        if (options?.maxDistance) {
            return options.maxDistance > closestFeature.distance ? closestFeature : null;
        }
        return closestFeature;
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

    shouldDrawFeature(properties: Props) {
        return !this.options.filter || this.options.filter(properties);
    }

    getStyles(feature: geojsonvt.Feature) {
        let style = this.options.style instanceof Function ? this.options.style(feature.tags as Props) : this.options.style;
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
                this.drawPolygon(ctx, feature.geometry as any as geojsonvt.Geometry[][]);
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
L.geoJSON.VT = function (data?: APIGeoJSON, options?: GeoJSONVTOptions) {
    // @ts-ignore
    return new GeoJSONVT(data, options) as L.GeoJSON.VT;
};


declare module 'leaflet' {
    namespace GeoJSON {
        class VT extends L.GridLayer {
            constructor(data?: APIGeoJSON, options?: GeoJSONVTOptions);
            addData(data: APIGeoJSON): L.GeoJSON.VT;
            reinitialize(): L.GeoJSON.VT;
            getClosestFeature(latlng: L.LatLng, options?: ClosestFeatureOptions): {
                distance: number,
                feature: Feature<LineString, Props>
            } | null;
        }
    }

    // todo: with export or without?
    namespace geoJSON {
        function VT(geojson?: APIGeoJSON, options?: GeoJSONVTOptions): L.GeoJSON.VT;
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

