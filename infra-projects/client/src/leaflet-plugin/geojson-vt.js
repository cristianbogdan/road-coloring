import geojsonvt from 'geojson-vt';
import config from '../config';
const tileLayer = false;
const MAX = 200;

L.GeoJSON.VT = (tileLayer ? L.TileLayer : L.GridLayer).extend({
    options: {
        async: false,
    },

    initialize: function (geojson, options) {
        if (options) L.setOptions(this, options);
        if (geojson) this.tileIndex = geojsonvt(geojson, this.options);
        this.initCache();
    },

    reinitialize: function () {
        this.initialize();
        this.redraw();
    },

    initCache() {
        // TODO: should be a WeakMap
        this.cache = new Map();
        this.keys = [];
    },

    addData(geojson) {
        this.initialize(geojson);
        this.redraw()
    },

    createTile: function (coords, done) {
        const strKey = `${config.URL_PUM_API}/infra/${coords.z}/${coords.x}/${coords.y}.png`;

        const cachedTile = this.cache.get(strKey);
        if (cachedTile) {
            setTimeout(function () { done(null, cachedTile); });
            return cachedTile;
        }
        // create a <canvas> element for drawing       
        var tile = L.DomUtil.create("canvas", "leaflet-tile");

        function drawLater() {
            if (!this.tileIndex) return;
            // setup tile width and height according to the options
            var size = this.getTileSize();
            tile.width = size.x;
            tile.height = size.y;

            // get a canvas context and draw something on it using coords.x, coords.y and coords.z
            var ctx = tile.getContext("2d");
            // ctx.font = "12px Arial";
            // ctx.fillText(`${coords.z}/${coords.x}/${coords.y}`, 0, 10);

            var tileInfo = this.tileIndex.getTile(coords.z, coords.x, coords.y);
            var features = tileInfo ? tileInfo.features : [];
            for (const feature of features) {
                this.drawFeature(ctx, feature);
            }

            var img = new window.Image();
            img.addEventListener("load", function () {
                ctx.drawImage(img, 0, 0);
            });
            img.setAttribute("src", strKey);

            if (coords.z < 12) {
                this.cache.set(strKey, tile);
                this.keys.push(strKey);
                if (this.keys.length == MAX) {
                    for (let i = 0; i < 10; i++)
                        this.cache.delete(this.keys[i]);
                    this.keys.splice(0, 10);
                }
            }

            // return the tile so it can be rendered on screen
            done(undefined, tile);
        };

        //looks like if there's a few ms timeout, Leaflet will not have the "zoom level mix" problem
        setTimeout(drawLater.bind(this));
        return tile;
    },

    drawFeature: function (ctx, feature) {
        if (!this.shouldDrawFeature(feature)) {
            return;
        }
    
        const styles = this.getStyles(feature);
    
        for (const currentStyle of styles) {
            ctx.save();
            ctx.beginPath();
    
            this.setStyle(ctx, currentStyle);
            this.drawGeometry(ctx, feature.type, feature.geometry);

            ctx.stroke();
            ctx.restore();
        }
    },
    
    shouldDrawFeature: function (feature) {
        return !this.options.filter || (this.options.filter instanceof Function && this.options.filter(feature));
    },
    
    getStyles: function (feature) {
        let style = this.options.style instanceof Function ? this.options.style(feature) : this.options.style;
        if (!style) {
            return [{}];
        } else if (!Array.isArray(style)) {
            return [style];
        }
        return style;
    },
    
    drawGeometry: function (ctx, type, geometry) {
        switch (type) {
            case 2:
            case 3:
                this.drawPolygon(ctx, geometry);
                break;
            case 1:
                this.drawPoint(ctx, geometry);
                break;
        }
    },
    
    drawPolygon: function (ctx, geometry) {
        for (const ring of geometry) {
            ctx.moveTo(ring[0][0] / 16.0, ring[0][1] / 16.0);
            for (let i = 1; i < ring.length; i++) {
                ctx.lineTo(ring[i][0] / 16.0, ring[i][1] / 16.0);
            }
        }
    },
    
    drawPoint: function (ctx, geometry) {
        for (const point of geometry) {
            const [x, y] = point;
            ctx.arc(x / 16.0, y / 16.0, 2, 0, Math.PI * 2, true);
        }
    },

    setStyle: function (ctx, style = {}) {
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
        ctx.strokeStyle = opacity ? this.setOpacity(color, opacity) : color;
        ctx.lineWidth = weight;

        if (!stroke) ctx.strokeStyle = "rgba(0,0,0,0)";

    },

    setOpacity: function (hexColor, opacity) {
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
    },
});

L.geoJson.vt = function (geojson, options) {
    return new L.GeoJSON.VT(geojson, options);
};
