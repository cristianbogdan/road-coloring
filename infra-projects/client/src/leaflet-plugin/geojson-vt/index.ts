import geojsonvt from 'geojson-vt';
import config from '../../config';
import { Coords, DoneCallback } from 'leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { Props } from '../../types';
import type { FeatureCollection, Feature, LineString, Position } from '@turf/turf';


// interface APIFeature extends GeoJSON.Feature<GeoJSON.Geometry, any> { }
interface APIGeoJSON extends FeatureCollection<LineString, Props> { }
interface GeoJSONVTOptions extends L.GridLayerOptions, geojsonvt.Options {
    async?: boolean;    // not used anymore
    filter?: (feature: Props) => boolean;
    style?: L.GeoJSONVTStyleOptions | ((feature: Props) => L.GeoJSONVTStyleOptions[]);
    lineLabel?: (feature: Props) => L.GeoJSONVTlineLabel | undefined;
};

interface ClosestFeatureOptions {
    maxDistance?: number;
    units?: turf.Units;
}
const CACHE_MAX_SIZE = 200;


class GeoJSONVT extends L.GridLayer {
    protected tileIndex?: ReturnType<typeof geojsonvt>;
    protected cache: Map<string, HTMLCanvasElement> = new Map();
    protected keys: string[] = [];
    protected filteredData: APIGeoJSON = { features: [], type: "FeatureCollection" };
    protected originalData: APIGeoJSON = { features: [], type: "FeatureCollection" };
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

        var tile = L.DomUtil.create("canvas", "leaflet-tile");
        const drawLater = () => {
            if (!this.tileIndex) {
                // fine in case no data was added yet
                done(undefined, tile);
                return tile;
            }
            // setup tile width and height according to the options
            const tileSize = this.getTileSize();
            tile.width = tileSize.x;
            tile.height = tileSize.y;

            // get a canvas context and draw something on it using coords.x, coords.y and coords.z
            const ctx = tile.getContext("2d");
            if (ctx === null) {
                console.warn("Canvas is null");
                done(undefined, tile);
                return tile;
            }

            const tileInfo = this.tileIndex.getTile(coords.z, coords.x, coords.y);
            const features = tileInfo ? tileInfo.features : [];

            for (const feature of features) {
                this.drawFeature(ctx, feature);
            }


            if (this.options.lineLabel) {
                let longestFeatureLine: {
                    distance: number,
                    feature: geojsonvt.Feature,
                    lineLabel: L.GeoJSONVTlineLabel
                } | undefined;

                for (const feature of features) {
                    const distance = this.lineLength(feature.geometry[0] as any as Position[]);
                    const lineLabel = this.options.lineLabel(feature.tags as Props);
                    if (!lineLabel) continue;

                    if (distance > (longestFeatureLine?.distance ?? 0)) {
                        longestFeatureLine = {
                            distance,
                            feature,
                            lineLabel
                        }
                    }
                }

                if (longestFeatureLine) {
                    this.drawLineLabel(ctx,
                        longestFeatureLine.feature.geometry[0] as any as Position[],
                        longestFeatureLine.lineLabel);
                }
            }

            // tile.style.backgroundImage = `url(${strKey})`;
            // const img = new window.Image();
            // img.addEventListener("load", function () {
            //     ctx.drawImage(img, 0, 0);
            // });
            // img.setAttribute("src", strKey);

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
                this.drawPolygon(ctx, feature.geometry as any as Position[][]);
                break;
            case 1:
                this.drawPoint(ctx, feature.geometry);
                break;
        }
    }

    angleBetweenPoints(startPoint: Position, endPoint: Position) {
        const dx = endPoint[0] / 16.0 - startPoint[0] / 16.0;
        const dy = endPoint[1] / 16.0 - startPoint[1] / 16.0;
        return Math.atan2(dy, dx);
    }

    distanceBetweenPoints(startPoint: Position, endPoint: Position) {
        const dx = endPoint[0] / 16.0 - startPoint[0] / 16.0;
        const dy = endPoint[1] / 16.0 - startPoint[1] / 16.0;
        return Math.sqrt(dx * dx + dy * dy);
    }

    interpolatePoint(startPoint: Position, endPoint: Position, distance: number) {
        const dx = endPoint[0] / 16.0 - startPoint[0] / 16.0;
        const dy = endPoint[1] / 16.0 - startPoint[1] / 16.0;
        const distanceBetweenPoints = Math.sqrt(dx * dx + dy * dy);
        const interpolationRatio = distance / distanceBetweenPoints;
        return [
            startPoint[0] / 16.0 + dx * interpolationRatio,
            startPoint[1] / 16.0 + dy * interpolationRatio
        ] as Position;
    }

    getTextCanvasMetrics(ctx: CanvasRenderingContext2D, text: string) {
        const metrics = ctx.measureText(text);
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        const width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
        return { width, height };
    }

    lineLength(lineGeometry: Position[]) {
        let distance = 0;
        for (let i = 0; i < lineGeometry.length - 1; i++) {
            distance += this.distanceBetweenPoints(lineGeometry[i], lineGeometry[i + 1]);
        }
        return distance;
    }

    drawLineLabel(ctx: CanvasRenderingContext2D, lineGeometry: Position[], lineLabel: L.GeoJSONVTlineLabel) {
        const { text } = lineLabel;

        ctx.save()
        this.setLabelStyle(ctx, lineLabel.style);

        let textDistance = this.getTextCanvasMetrics(ctx, text).width;
        const lineDistance = this.lineLength(lineGeometry);

        // if the text is longer than the line, don't draw it
        if (textDistance + ctx.lineWidth > lineDistance) {
            // console.log("Filtered out text ", text, "with distance", textDistance, "because it's longer than the line", lineDistance);
            ctx.restore();
            return;
        }

        // ensures the text is not upside down
        const firstPoint = lineGeometry[0];
        const lastPoint = lineGeometry[lineGeometry.length - 1];
        if (firstPoint[0] > lastPoint[0]) {
            lineGeometry.reverse(); // TODO: don't reverse the original geometry?
        }
        // try this one if the above implementation for upside down text has problems
        // if (!turf.booleanClockwise(feature.geometry)) {
        //     geometry.reverse();
        // }

        let progress = (lineDistance - textDistance) / 2;
        let currentPointIdx = 1;

        let distanceTraveledSoFar = 0;
        let distBetweenCurrentPoints = this.distanceBetweenPoints(lineGeometry[currentPointIdx], lineGeometry[currentPointIdx - 1]);

        const elementsToDraw = [];
        for (const letter of text) {
            const letterWidth = this.getTextCanvasMetrics(ctx, letter).width;
            const requestedDistanceOnLine = progress + letterWidth / 2;

            // verify and increment distance and line points until we reach the next desired distance and point intervals on the line
            while (distanceTraveledSoFar + distBetweenCurrentPoints < requestedDistanceOnLine) {
                distanceTraveledSoFar += distBetweenCurrentPoints;
                currentPointIdx += 1;
                distBetweenCurrentPoints = this.distanceBetweenPoints(lineGeometry[currentPointIdx], lineGeometry[currentPointIdx - 1]);
            }

            const interpolationDistance = requestedDistanceOnLine - distanceTraveledSoFar;
            const letterPosition = this.interpolatePoint(lineGeometry[currentPointIdx - 1], lineGeometry[currentPointIdx], interpolationDistance);
            const letterAngle = this.angleBetweenPoints(lineGeometry[currentPointIdx - 1], lineGeometry[currentPointIdx]);

            elementsToDraw.push({
                text: letter,
                x: letterPosition[0],
                y: letterPosition[1],
                angle: letterAngle,
            });

            progress += letterWidth;
        }

        // TODO: invalidate based on angles array?
        // if available draw the stroke first so it will be drawn behind the text
        if (ctx.lineWidth) {
        for (const textToDraw of elementsToDraw) {
            ctx.save();
            ctx.translate(textToDraw.x, textToDraw.y);
            ctx.rotate(textToDraw.angle);
                ctx.strokeText(textToDraw.text, 0, 0);
                ctx.restore();
            }
        }
        for (const textToDraw of elementsToDraw) {
            ctx.save();
            ctx.translate(textToDraw.x, textToDraw.y);
            ctx.rotate(textToDraw.angle);
            ctx.fillText(textToDraw.text, 0, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    drawPolygon(ctx: CanvasRenderingContext2D, geometry: Position[][]) {
        for (const ring of geometry) {
            ctx.moveTo(ring[0][0] / 16.0, ring[0][1] / 16.0);
            for (let i = 1; i < ring.length; i++) {
                ctx.lineTo(ring[i][0] / 16.0, ring[i][1] / 16.0);
            }
        }
    }

    drawPoint(ctx: CanvasRenderingContext2D, geometry: Position[]) {
        for (const point of geometry) {
            const [x, y] = point;
            ctx.arc(x / 16.0, y / 16.0, 2, 0, Math.PI * 2, true);
        }
    }

    setStyle(ctx: CanvasRenderingContext2D, style?: L.GeoJSONVTStyleOptions) {
        const {
            color = "#000",
            weight = 1,
            opacity,
            dashArray,
            dashOffset,
        } = style ?? {};

        if (dashArray) ctx.setLineDash(dashArray);
        if (dashOffset) ctx.lineDashOffset = dashOffset;
        ctx.strokeStyle = opacity ? setOpacity(color, opacity) : color;
        ctx.lineWidth = weight;
    }

    setLabelStyle(ctx: CanvasRenderingContext2D, style?: L.GeoJSONVTLabelStyleOptions) {
        const {
            font = "bold 11px Calibri",
            color = "#000",
            borderSize = 2.5,
            borderColor = "#fff",
            textBaseline = "middle",
            textAlign = "center",
        } = style ?? {};

        ctx.font = font;
        ctx.fillStyle = color;
        ctx.lineWidth = borderSize;
        ctx.strokeStyle = borderColor;
        ctx.textBaseline = textBaseline;
        ctx.textAlign = textAlign;
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

    // TODO: with export or without?
    namespace geoJSON {
        function VT(geojson?: APIGeoJSON, options?: GeoJSONVTOptions): L.GeoJSON.VT;
    }

    interface GeoJSONVTlineLabel {
        text: string;
        style?: GeoJSONVTLabelStyleOptions;
    }

    interface GeoJSONVTLabelStyleOptions {
        font?: string;
        color?: string;
        borderSize?: number;
        borderColor?: string;
        textBaseline?: CanvasTextBaseline;
        textAlign?: CanvasTextAlign;
    }

    interface GeoJSONVTStyleOptions {
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

