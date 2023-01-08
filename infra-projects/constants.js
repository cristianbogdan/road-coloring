const Color = {
    BLACK: '#000000',
    WHITE: '#ffffff',

    RED: '#ff0000',
    ORANGE: '#ff8000',
    YELLOW: '#ffff00',
    AMBER: '#ffbf00',
    GRAY: '#808080',

    BLUE: '#0000ff',
    DODGER_BLUE: '#199a8d',
    DEEP_SKY_BLUE: '#20c5b5',
    LIGHT_SKY_BLUE: '#40e0d0',
    POWDER_BLUE: '#91ede4',
    BLIZZARD_BLUE: '#AEEEEA',

    ORANGE_RED: '#ff4500',
    ROSE_PINK: '#ffbdbd',
    
    SHIP_COVE: '#6c7b8b'
}

const LineWeight = {
    THIN: 2.0,
    THICK: 4.0,
    THICKER: 6.0
}

const DashArray = {
    DENSE: [5, 7],
    SPARSE: [10, 10]
}

const zoomPrecisionMap = {
    7: 8000,
    8: 4000,
    9: 2000,
    10: 1000,
    11: 500,
    12: 300,
    13: 200,
    14: 100,
    15: 50,
    16: 25,
    17: 15,
    18: 10
}

const blackLine = {
    weight: LineWeight.THICK,
    color: Color.BLACK
}

const thickerBlackLine = {
    weight: LineWeight.THICKER,
    color: Color.BLACK
}

const thickerWhiteLine = {
    weight: LineWeight.THICKER,
    color: Color.WHITE
}

const blueLine = {
    weight: LineWeight.THICK,
    color: Color.BLUE
}

const lightBlueLine = {
    weight: LineWeight.THICK,
    color: Color.DEEP_SKY_BLUE
}

const orangeLine = {
    weight: LineWeight.THICK,
    color: Color.ORANGE
}

const yellowLine = {
    weight: LineWeight.THICK,
    color: Color.YELLOW
}

const amberLine = {
    weight: LineWeight.THICK,
    color: Color.AMBER
}

const orangeRedLine = {
    weight: LineWeight.THICK,
    color: Color.ORANGE_RED
}

const redLine = {
    weight: LineWeight.THICK,
    color: Color.RED
}

const rosePinkLine = {
    weight: LineWeight.THICK,
    color: Color.ROSE_PINK
}

const shipCoveLine = {
    weight: LineWeight.THICK,
    color: Color.SHIP_COVE
}

const progressLine = (percent) => {
    return {
        weight: LineWeight.THICK,
        color: !percent ? Color.BLIZZARD_BLUE : percent > 75 ? Color.DODGER_BLUE : percent > 50 ? Color.DEEP_SKY_BLUE : percent > 25 ? Color.LIGHT_SKY_BLUE : percent > 0 ? Color.POWDER_BLUE : Color.GRAY
    }
}

const whiteDashLine = {
    weight: LineWeight.THIN,
    color: Color.WHITE,
    dashArray: DashArray.DENSE
}

const redDashLine = {
    weight: LineWeight.THIN,
    color: Color.RED,
    dashArray: DashArray.DENSE
}

const blackDashLine = {
    weight: LineWeight.THIN,
    color: Color.BLACK,
    dashArray: DashArray.DENSE
}

const legend = {
    basicStyle: "position: relative; display: inline-block; width: 35px; height: 3px; bottom: 2px;",
    projectTypes: [

        /* Highway */
        {
            symbol: `background-color: ${Color.BLUE};`,
            text: "în circulație",
            condition: (p) => p.highway && !p.construction && !p.proposed && p.access != 'no',
            lineType: (p) => [blueLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.BLUE}; border-top: dotted ${Color.RED};`,
            text: "recepționat/circulabil fără acces",
            condition: (p) => p.highway && !p.construction && !p.proposed && p.access == 'no',
            lineType: (p) => [blueLine, redDashLine],
            canHide: true
        },
        {
            symbol: 'background-color:' + Color.LIGHT_SKY_BLUE + ';',
            text: 'în construire, cu AC, stadiu:<br>'
                + '<font color=' + Color.BLIZZARD_BLUE + '>0%</font> <font color=' + Color.POWDER_BLUE + '>&lt;25%</font> <font color=' + Color.LIGHT_SKY_BLUE + '>&lt;50%</font> <font color=' + Color.DEEP_SKY_BLUE + '>&lt;75%</font> <font color=' + Color.DODGER_BLUE + '>&lt;100%</font>',
            condition: (p) => p.highway && p.construction && p.AC && p.builder,
            lineType: (p) => [progressLine(p.latestProgress)],
            canHide: true
        },
        {
            symbol: `border-top: dotted ${Color.DEEP_SKY_BLUE};`,
            text: "neatribuit sau reziliat, cu AC",
            condition: (p) => p.highway && (p.proposed || !p.builder) && p.AC,
            lineType: (p) => [progressLine(p.latestProgress), whiteDashLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.RED};`,
            text: "atribuit, lipsă AM",
            condition: (p) => p.highway && p.builder && !p.AM && !p.PTE,
            lineType: (p) => [redLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.ORANGE_RED};`,
            text: "cu AM, fără PT aprobat",
            condition: (p) => p.highway && p.construction && p.builder && !p.PTE && p.AM,
            lineType: (p) => [orangeRedLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.AMBER};`,
            text: "cu PT aprobat, fără AC",
            condition: (p) => p.highway && p.builder && !p.AC && p.PTE,
            lineType: (p) => [amberLine],
            canHide: true
        },
        {
            symbol: `border-top: dotted ${Color.ORANGE_RED};`,
            text: "neatribuit, lipsă AC/PT/AM",
            condition: (p) => p.highway && p.hadStatus && (!p.AC || !p.PTE || !p.AM),
            lineType: (p) => [orangeRedLine, whiteDashLine],
            canHide: true
        },

        /* Railway */
        {
            symbol: `background-color: ${Color.BLUE}; border-top: dotted ${Color.BLACK};`,
            text: "CF nouă finalizată",
            condition: (p) => p.railway && p.latestProgress === 100 && !p.opening_date && p.start_date,
            lineType: (p) => [blueLine, blackDashLine],
            canHide: true
        },
        {
            symbol: `border-top: dotted ${Color.BLACK};`,
            text: "CF cu reabilitare finalizată",
            condition: (p) => p.railway && p.latestProgress === 100 && p.opening_date && !p.start_date,
            lineType: (p) => [blackLine, whiteDashLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.RED}; border-top: dotted ${Color.POWDER_BLUE};`,
            text: "CF nouă cu AC, în construire",
            condition: (p) => p.railway && p.railway == 'construction',
            lineType: (p) => [progressLine(p.latestProgress), redDashLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.BLACK}; border-top: dotted ${Color.POWDER_BLUE};`,
            text: "CF cu AC, în reabilitare",
            condition: (p) => p.railway && p.railway !== 'proposed' && !p.tender,
            lineType: (p) => [progressLine(p.latestProgress), blackDashLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.RED}; border-top: dotted ${Color.ROSE_PINK};`,
            text: "CF nouă, neatribuită",
            condition: (p) => p.railway === 'proposed' /*&& p.tender*/,
            lineType: (p) => [rosePinkLine, redDashLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.BLACK}; border-top: dotted ${Color.ROSE_PINK};`,
            text: "CF vechi, neatribuită",
            condition: (p) => p.railway === 'rail' && p.tender,
            lineType: (p) => [rosePinkLine, blackDashLine],
            canHide: true
        },

        /* Proposed projects */
        {
            symbol: `border-top: dotted ${Color.ROSE_PINK};`,
            text: "proiecte propuse",
            condition: (p) => p.highway && (p.proposed || p.hadStatus && !p.AC && !p.AM && !p.PTE),
            lineType: (p) => [rosePinkLine, whiteDashLine],
            canHide: true,
            hidden: true
        },
        {
            symbol: `background-color: ${Color.SHIP_COVE};`,
            text: "status necunoscut",
            condition: (p) => p.highway && p.construction && !p.hadStatus,
            lineType: (p) => [shipCoveLine],
            canHide: true,
            hidden: true
        },

    ]
}
