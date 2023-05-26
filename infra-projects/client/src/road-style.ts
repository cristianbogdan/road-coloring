import { Color, LineWeight, DashArray } from './constants'

export interface LotLimitProps {
    highway: string | null,
    name: string,
    osm_id: number,
    railway: string | null,
}
export interface RawProps {
    osm_id?: number,
    ref?: string,
    name?: string,
    railway?: string,
    highway?: string,
    construction?: string,
    proposed?: string,
    bridge?: string,
    tunnel?: string,
    status?: string,
    start_date?: string,
    opening_date?: string,
    access?: string,
    access_note?: string,
    start_date_note?: string
}
export interface Props extends RawProps {
    PTE?: boolean,
    AM?: boolean,
    AC?: boolean,
    PT?: boolean,   // check number of occurrences
    severance?: string
    progress?: string[],    // data has only one element 
    signal_progress?: string[],   // data has only one element
    latestProgress?: number,
    latestSignalProgress?: number,
    tender?: string,
    hadStatus?: boolean,
    winner?: string,
    financing?: string,
    builder?: string,
    progress_estimate?: string[],   // data has only one element

    // verify where are these coming from
    comentarii_problema?: string,
    nume?: string,
    comentarii_rezolvare_curenta?: string,
    estimare_rezolvare?: string,
    link?: string,
    "construction:railway:etcs"?: string,
    ["railway:etcs"]?: string,

}

export const blackLine = {
    weight: LineWeight.THICK,
    color: Color.BLACK
}

export const thickerBlackLine = {
    weight: LineWeight.THICKER,
    color: Color.BLACK
}

export const thickerWhiteLine = {
    weight: LineWeight.THICKER,
    color: Color.WHITE
}

export const blueLine = {
    weight: LineWeight.THICK,
    color: Color.BLUE
}

export const lightBlueLine = {
    weight: LineWeight.THICK,
    color: Color.DEEP_SKY_BLUE
}

export const orangeLine = {
    weight: LineWeight.THICK,
    color: Color.ORANGE
}

export const yellowLine = {
    weight: LineWeight.THICK,
    color: Color.YELLOW
}

export const amberLine = {
    weight: LineWeight.THICK,
    color: Color.AMBER
}

export const orangeRedLine = {
    weight: LineWeight.THICK,
    color: Color.ORANGE_RED
}

export const redLine = {
    weight: LineWeight.THICK,
    color: Color.RED
}

export const rosePinkLine = {
    weight: LineWeight.THICK,
    color: Color.ROSE_PINK
}

export const shipCoveLine = {
    weight: LineWeight.THICK,
    color: Color.SHIP_COVE
}

export const progressLine = (percent?: number) => {
    return {
        weight: LineWeight.THICK,
        color: !percent ? Color.BLIZZARD_BLUE : percent > 75 ? Color.DODGER_BLUE : percent > 50 ? Color.DEEP_SKY_BLUE : percent > 25 ? Color.LIGHT_SKY_BLUE : percent > 0 ? Color.POWDER_BLUE : Color.GRAY
    }
}

export const statusLine = (props: Props) => {
    return {
        weight: LineWeight.THICK,
        color: props.PTE ? Color.AMBER : props.AM ? Color.ORANGE_RED : Color.RED
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
        symbol: `background-color: ${Color.BLUE};`,
        text: "în circulație",
        condition: (p: Props) => p.highway && !p.construction && !p.proposed && p.access != 'no',
        lineType: (_p: Props) => [blueLine],
        hidden: false
    },
    {
        id: "a-fara-acces",
        symbol: `background-color: ${Color.BLUE}; border-top: dotted ${Color.RED};`,
        text: "recepționat/circulabil fără acces",
        condition: (p: Props) => p.highway && !p.construction && !p.proposed && p.access == 'no',
        lineType: (_p: Props) => [blueLine, redDashLine],
        hidden: false
    },
    {
        id: "a-in-construire",
        symbol: `background-color: ${Color.LIGHT_SKY_BLUE};`,
        text: 'în construire, cu AC, stadiu:<br>'
            + '<font color=' + Color.BLIZZARD_BLUE + '>0%</font> <font color=' + Color.POWDER_BLUE + '>&lt;25%</font> <font color=' + Color.LIGHT_SKY_BLUE + '>&lt;50%</font> <font color=' + Color.DEEP_SKY_BLUE + '>&lt;75%</font> <font color=' + Color.DODGER_BLUE + '>&lt;100%</font>',
        condition: (p: Props) => p.highway && p.construction && p.AC && p.builder,
        lineType: (p: Props) => [progressLine(p.latestProgress)],
        hidden: false
    },
    {
        id: "a-neatribuita",
        symbol: `border-top: dotted ${Color.DEEP_SKY_BLUE};`,
        text: "neatribuit sau reziliat, cu AC",
        condition: (p: Props) => p.highway && (p.proposed || !p.builder) && p.AC,
        lineType: (p: Props) => [progressLine(p.latestProgress), whiteDashLine],
        hidden: false
    },
    {
        id: "a-atribuita-fara-am",
        symbol: `background-color: ${Color.RED};`,
        text: "atribuit, lipsă AM",
        condition: (p: Props) => p.highway && p.builder && !p.AM && !p.PTE,
        lineType: (_p: Props) => [redLine],
        hidden: false
    },
    {
        id: "a-atribuita-fara-pt",
        symbol: `background-color: ${Color.ORANGE_RED};`,
        text: "cu AM, fără PT aprobat",
        condition: (p: Props) => p.highway && p.construction && p.builder && !p.PTE && p.AM,
        lineType: (_p: Props) => [orangeRedLine],
        hidden: false
    },
    {
        id: "a-atribuita-fara-ac",
        symbol: `background-color: ${Color.AMBER};`,
        text: "cu PT aprobat, fără AC",
        condition: (p: Props) => p.highway && p.builder && !p.AC && p.PTE,
        lineType: (_p: Props) => [amberLine],
        hidden: false
    },
    {
        id: "a-neatribuita-fara-avize",
        symbol: `border-top: dotted ${Color.ORANGE_RED};`,
        text: "neatribuit, lipsă AC/PT/AM",
        condition: (p: Props) => p.highway && p.hadStatus && (!p.AC || !p.PTE || !p.AM),
        lineType: (p: Props) => [statusLine(p), whiteDashLine],
        hidden: false
    },

    /* Railway */
    {
        id: "cf-noua",
        symbol: `background-color: ${Color.BLUE}; border-top: dotted ${Color.BLACK};`,
        text: "CF nouă finalizată",
        condition: (p: Props) => p.railway && p.latestProgress === 100 && p.start_date,
        lineType: (_p: Props) => [blueLine, blackDashLine],
        hidden: false
    },
    {
        id: "cf-reabilitata",
        symbol: `border-top: dotted ${Color.BLACK};`,
        text: "CF cu reabilitare finalizată",
        condition: (p: Props) => p.railway && p.latestProgress === 100 && p.start_date_note,
        lineType: (_p: Props) => [blackLine, whiteDashLine],
        hidden: false
    },
    {
        id: "cf-noua-in-construire",
        symbol: `background-color: ${Color.RED}; border-top: dotted ${Color.POWDER_BLUE};`,
        text: "CF nouă cu AC, în construire",
        condition: (p: Props) => p.railway && p.railway == 'construction',
        lineType: (p: Props) => [progressLine(p.latestProgress), redDashLine],
        hidden: false
    },
    {
        id: "cf-in-reabilitare",
        symbol: `background-color: ${Color.BLACK}; border-top: dotted ${Color.POWDER_BLUE};`,
        text: "CF cu AC, în reabilitare",
        condition: (p: Props) => p.railway && p.railway !== 'proposed' && !p.tender,
        lineType: (p: Props) => [progressLine(p.latestProgress), blackDashLine],
        hidden: false
    },
    {
        id: "cf-noua-neatribuita",
        symbol: `background-color: ${Color.RED}; border-top: dotted ${Color.ROSE_PINK};`,
        text: "CF nouă, neatribuită",
        condition: (p: Props) => p.railway === 'proposed' /*&& p.tender*/,
        lineType: (_p: Props) => [rosePinkLine, redDashLine],
        hidden: false
    },
    {
        id: "cf-reabilitare-neatribuita",
        symbol: `background-color: ${Color.BLACK}; border-top: dotted ${Color.ROSE_PINK};`,
        text: "CF vechi, neatribuită",
        condition: (p: Props) => p.railway === 'rail' && p.tender,
        lineType: (_p: Props) => [rosePinkLine, blackDashLine],
        hidden: false
    },

    /* Proposed projects */
    {
        id: "proiecte-propuse",
        symbol: `border-top: dotted ${Color.ROSE_PINK};`,
        text: "proiecte propuse",
        condition: (p: Props) => p.highway && (p.proposed || p.hadStatus && !p.AC && !p.AM && !p.PTE),
        lineType: (_p: Props) => [rosePinkLine, whiteDashLine],
        hidden: true
    },
    {
        id: "status-necunoscut",
        symbol: `background-color: ${Color.SHIP_COVE};`,
        text: "status necunoscut",
        condition: (p: Props) => p.highway && p.construction && !p.hadStatus,
        lineType: (_p: Props) => [shipCoveLine],
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
