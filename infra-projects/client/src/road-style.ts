import { Color, LineWeight, DashArray } from './constants'
import type { Props } from './types'


export const blackLine = {
    weight: LineWeight.THICK,
    color: Color.BLACK,
    dashArray: undefined
}

export const thickerBlackLine = {
    weight: LineWeight.THICKER,
    color: Color.BLACK,
    dashArray: undefined
}

export const thickerWhiteLine = {
    weight: LineWeight.THICKER,
    color: Color.WHITE,
    dashArray: undefined
}

export const blueLine = {
    weight: LineWeight.THICK,
    color: Color.BLUE,
    dashArray: undefined
}

export const lightBlueLine = {
    weight: LineWeight.THICK,
    color: Color.DEEP_SKY_BLUE,
    dashArray: undefined
}

export const orangeLine = {
    weight: LineWeight.THICK,
    color: Color.ORANGE,
    dashArray: undefined
}

export const yellowLine = {
    weight: LineWeight.THICK,
    color: Color.YELLOW,
    dashArray: undefined
}

export const amberLine = {
    weight: LineWeight.THICK,
    color: Color.AMBER,
    dashArray: undefined
}

export const orangeRedLine = {
    weight: LineWeight.THICK,
    color: Color.ORANGE_RED,
    dashArray: undefined
}

export const redLine = {
    weight: LineWeight.THICK,
    color: Color.RED,
    dashArray: undefined
}

export const rosePinkLine = {
    weight: LineWeight.THICK,
    color: Color.ROSE_PINK,
    dashArray: undefined
}

export const shipCoveLine = {
    weight: LineWeight.THICK,
    color: Color.SHIP_COVE,
    dashArray: undefined
}

export const progressLine = (percent?: number) => {
    return {
        weight: LineWeight.THICK,
        color: !percent ? Color.BLIZZARD_BLUE : percent > 75 ? Color.DODGER_BLUE : percent > 50 ? Color.DEEP_SKY_BLUE : percent > 25 ? Color.LIGHT_SKY_BLUE : percent > 0 ? Color.POWDER_BLUE : Color.GRAY,
        dashArray: undefined
    }
}

export const statusLine = (props: Props) => {
    return {
        weight: LineWeight.THICK,
        color: props.PTE ? Color.AMBER : props.AM ? Color.ORANGE_RED : Color.RED,
        dashArray: undefined
    }
}

export const whiteDashLine = {
    weight: LineWeight.THIN,
    color: Color.WHITE,
    dashArray: DashArray.DENSE
}

export const redDashLine = {
    weight: LineWeight.THIN,
    color: Color.RED,
    dashArray: DashArray.DENSE
}

export const blackDashLine = {
    weight: LineWeight.THIN,
    color: Color.BLACK,
    dashArray: DashArray.DENSE
}

const defaultLegendFilters = [
    /* Highway */
    {
        id: "a-finalizata",
        style: [blueLine],
        text: "în circulație",
        condition: (p: Props) => p.highway && !p.construction && !p.proposed && p.access != 'no',
        lineType: function (_p: Props) { return this.style },
        hidden: false
    },
    {
        id: "a-fara-acces",
        style: [blueLine, redDashLine],
        text: "recepționat/circulabil fără acces",
        condition: (p: Props) => p.highway && !p.construction && !p.proposed && p.access == 'no',
        lineType: function (_p: Props) { return this.style },
        hidden: false
    },
    {
        id: "a-in-construire",
        style: [progressLine(25)],
        text: 'în construire, cu AC, stadiu:<br>'
            + '<font color=' + Color.BLIZZARD_BLUE + '>0%</font> <font color=' + Color.POWDER_BLUE + '>&lt;25%</font> <font color=' + Color.LIGHT_SKY_BLUE + '>&lt;50%</font> <font color=' + Color.DEEP_SKY_BLUE + '>&lt;75%</font> <font color=' + Color.DODGER_BLUE + '>&lt;100%</font>',
        condition: (p: Props) => p.highway && p.construction && p.AC && p.builder,
        lineType: (p: Props) => [progressLine(p.latestProgress)],
        hidden: false
    },
    {
        id: "a-neatribuita",
        style: [progressLine(25), whiteDashLine],
        text: "neatribuit sau reziliat, cu AC",
        condition: (p: Props) => p.highway && (p.proposed || !p.builder) && p.AC,
        lineType: (p: Props) => [progressLine(p.latestProgress), whiteDashLine],
        hidden: false
    },
    {
        id: "a-atribuita-fara-am",
        style: [redLine],
        text: "atribuit, lipsă AM",
        condition: (p: Props) => p.highway && p.builder && !p.AM && !p.PTE,
        lineType: function (_p: Props) { return this.style },
        hidden: false
    },
    {
        id: "a-atribuita-fara-pt",
        style: [orangeRedLine],
        text: "cu AM, fără PT aprobat",
        condition: (p: Props) => p.highway && p.construction && p.builder && !p.PTE && p.AM,
        lineType: function (_p: Props) { return this.style },
        hidden: false
    },
    {
        id: "a-atribuita-fara-ac",
        style: [amberLine],
        text: "cu PT aprobat, fără AC",
        condition: (p: Props) => p.highway && p.builder && !p.AC && p.PTE,
        lineType: function (_p: Props) { return this.style },
        hidden: false
    },
    {
        id: "a-neatribuita-fara-avize",
        style: [statusLine({ AM: true }), whiteDashLine],
        text: "neatribuit, lipsă AC/PT/AM",
        condition: (p: Props) => p.highway && p.hadStatus && (!p.AC || !p.PTE || !p.AM),
        lineType: (p: Props) => [statusLine(p), whiteDashLine],
        hidden: false
    },

    /* Railway */
    {
        id: "cf-noua",
        style: [blueLine, blackDashLine],
        text: "CF nouă finalizată",
        condition: (p: Props) => p.railway && p.latestProgress === 100 && p.start_date,
        hidden: false
    },
    {
        id: "cf-reabilitata",
        style: [blackLine, whiteDashLine],
        text: "CF cu reabilitare finalizată",
        condition: (p: Props) => p.railway && p.latestProgress === 100 && p.start_date_note,
        lineType: function (_p: Props) { return this.style },
        hidden: false
    },
    {
        id: "cf-noua-in-construire",
        style: [progressLine(25), redDashLine],
        text: "CF nouă cu AC, în construire",
        condition: (p: Props) => p.railway && p.railway == 'construction',
        lineType: (p: Props) => [progressLine(p.latestProgress), redDashLine],
        hidden: false
    },
    {
        id: "cf-in-reabilitare",
        style: [progressLine(25), blackDashLine],
        text: "CF cu AC, în reabilitare",
        condition: (p: Props) => p.railway && p.railway !== 'proposed' && !p.tender,
        lineType: (p: Props) => [progressLine(p.latestProgress), blackDashLine],
        hidden: false
    },
    {
        id: "cf-noua-neatribuita",
        style: [rosePinkLine, redDashLine],
        text: "CF nouă, neatribuită",
        condition: (p: Props) => p.railway === 'proposed' /*&& p.tender*/,
        lineType: function (_p: Props) { return this.style },
        hidden: false
    },
    {
        id: "cf-reabilitare-neatribuita",
        style: [rosePinkLine, blackDashLine],
        text: "CF vechi, neatribuită",
        condition: (p: Props) => p.railway === 'rail' && p.tender,
        lineType: function (_p: Props) { return this.style },
        hidden: false
    },

    /* Proposed projects */
    {
        id: "proiecte-propuse",
        style: [rosePinkLine, whiteDashLine],
        text: "proiecte propuse",
        condition: (p: Props) => p.highway && (p.proposed || p.hadStatus && !p.AC && !p.AM && !p.PTE),
        lineType: function (_p: Props) { return this.style },
        hidden: true
    },
    {
        id: "status-necunoscut",
        style: [shipCoveLine],
        text: "status necunoscut",
        condition: (p: Props) => p.highway && p.construction && !p.hadStatus,
        lineType: function (_p: Props) { return this.style },
        hidden: true
    }
]


export interface LegendFilterState {
    id: string;
    hidden: boolean;
}
export interface LegendState {
    hidden: boolean;
    filters: LegendFilterState[];
}
export interface LegendStateOptions extends Partial<LegendState> { }

export const legend = {
    hidden: false,
    basicStyle: "position: relative; display: inline-block; width: 35px; height: 3px; bottom: 2px;",
    getVisibleFilters: function () {
        return this.filters.filter(p => !p.hidden);
    },
    getHiddenFilters: function () {
        return this.filters.filter(p => p.hidden);
    },
    setState: function (options: LegendStateOptions) {
        this.hidden = options.hidden ?? this.hidden;
        if (options.filters) {
            for (const filter of options.filters) {
                const projectType = this.filters.find(p => p.id === filter.id);
                if (projectType) projectType.hidden = filter.hidden;
            }
        }
    },
    getState: function () {
        return {
            hidden: this.hidden,
            filters: this.filters.map(p => ({ id: p.id, hidden: p.hidden }))
        }
    },
    filters: [...defaultLegendFilters],
    getDefaultFilters() {
        return [...defaultLegendFilters];
    }
}
