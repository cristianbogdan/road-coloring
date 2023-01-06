const Color = {
    BLACK: '#000000',
    WHITE: '#ffffff',
    RED: '#ff0000',
    ORANGE: '#ff8000',
    GRAY: '#808080',
	GREEN:	'#d0f5e4',
    BLUE: '#0000ff',
    POWDER_BLUE: '#b0e0e6',
    LIGHT_SKY_BLUE: '#87cefa',
    DEEP_SKY_BLUE: '#00bfff',
    ORANGE_RED: '#ff4500',
    DODGER_BLUE: '#1e90ff',
    ROSE_PINK: '#ffbdbd',
    SHIP_COVE: '#6c7b8b'
}

const LineWeight = {
    THIN: 2.0,
    THICK: 4.0
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

function colorProgress(latestProgress) {
    return !latestProgress ? Color.GREEN : latestProgress > 75 ? Color.DODGER_BLUE : latestProgress > 50 ? Color.DEEP_SKY_BLUE : latestProgress > 25 ? Color.LIGHT_SKY_BLUE : latestProgress > 0 ? Color.POWDER_BLUE : Color.GRAY;
}

function a_missing(p) {
    return p.PTE ? orange : p.AM ? orangeRed : red;
}

const blackLine = {
    weight: LineWeight.THICK,
    color: Color.BLACK
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

// const transparentBlueLine = (percent) => {
//     return {
//         weight: LineWeight.THICK,
//         color: `rgba(0, 0, 255, ${percent})`
//     }

// }

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
            condition: p => p.highway && !p.construction && !p.proposed && p.access != 'no',
            lineType: [blueLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.BLUE}; border-top: dotted ${Color.RED};`,
            text: "recepționat/circulabil fără acces",
            condition: p => p.highway && !p.construction && !p.proposed && p.access == 'no',
            lineType: [blueLine, redDashLine],
            canHide: true
        },
        {
            symbol: 'background-color:' + Color.LIGHT_SKY_BLUE + ';',
            text: 'în construire, cu AC, stadiu:<br>'
                + '<font color=' + Color.GRAY + '>0%</font> <font color=' + Color.POWDER_BLUE + '>&lt;25%</font> <font color=' + Color.LIGHT_SKY_BLUE + '>&lt;50%</font> <font color=' + Color.DEEP_SKY_BLUE + '>&lt;75%</font> <font color=' + Color.DODGER_BLUE + '>&lt;100%</font>',
            condition: p => p.highway && p.construction && p.AC && p.builder,
            //lineType: [colorProgress(p.latestProgress)],
            lineType: [lightBlueLine],
            canHide: true
        },
        {
            symbol: `border-top: dotted ${Color.DEEP_SKY_BLUE};`,
            text: "neatribuit sau reziliat, cu AC",
            condition: p => p.highway && (p.proposed || !p.builder) && p.AC,
            // lineType: [colorProgress(p.latestProgress), whiteDash],
            lineType: [lightBlueLine, whiteDashLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.RED};`,
            text: "atribuit, lipsă AM",
            condition: p => p.highway && p.builder && !p.AM && !p.PTE,
            lineType: [redLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.ORANGE_RED};`,
            text: "cu AM, fără PT aprobat",
            condition: p => p.highway && p.construction && p.builder && !p.PTE && p.AM,
            lineType: [orangeRedLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.ORANGE};`,
            text: "cu PT aprobat, fără AC",
            condition: p => p.highway && p.builder && !p.AC && p.PTE,
            lineType: [orangeLine],
            canHide: true
        },
        {
            symbol: `border-top: dotted ${Color.ORANGE_RED};`,
            text: "neatribuit, lipsă AC/PT/AM",
            condition: p => p.highway && p.hadStatus && (!p.AC || !p.PTE || !p.AM),
            lineType: [orangeRedLine, whiteDashLine],
            canHide: true
        },

        /* Railway */
        {
            symbol: `background-color: ${Color.BLUE}; border-top: dotted ${Color.BLACK};`,
            text: "CF nouă finalizată",
            condition: p => p.railway && p.latestProgress === 100 && !p.opening_date && p.start_date,
            lineType: [blueLine, blackDashLine],
            canHide: true
        },
        {
            symbol: `border-top: dotted ${Color.BLACK};`,
            text: "CF cu reabilitare finalizată",
            condition: p => p.railway && p.latestProgress === 100 && p.opening_date && !p.start_date,
            lineType: [blackLine, whiteDashLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.RED}; border-top: dotted ${Color.POWDER_BLUE};`,
            text: "CF nouă cu AC, în construire",
            condition: p => p.railway && p.railway == 'construction',
            // lineType: [colorProgress(p.latestProgress), redDash],
            lineType: [lightBlueLine, redDashLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.BLACK}; border-top: dotted ${Color.POWDER_BLUE};`,
            text: "CF cu AC, în reabilitare",
            condition: p => p.railway && p.railway !== 'proposed' && !p.tender,
            // lineType: [colorProgress(p.latestProgress), railDash],
            lineType: [lightBlueLine, blackDashLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.RED}; border-top: dotted ${Color.ROSE_PINK};`,
            text: "CF nouă, neatribuită",
            condition: p => p.railway === 'proposed' /*&& p.tender*/,
            lineType: [rosePinkLine, redDashLine],
            canHide: true
        },
        {
            symbol: `background-color: ${Color.BLACK}; border-top: dotted ${Color.ROSE_PINK};`,
            text: "CF vechi, neatribuită",
            condition: p => p.railway === 'rail' && p.tender,
            lineType: [rosePinkLine, blackDashLine],
            canHide: true
        },

        /* Proposed projects */
        {
            symbol: `border-top: dotted ${Color.ROSE_PINK};`,
            text: "proiecte propuse",
            condition: p => p.highway && (p.proposed || p.hadStatus && !p.AC && !p.AM && !p.PTE),
            lineType: [rosePinkLine, whiteDashLine],
            canHide: true,
            hidden: true
        },
        {
            symbol: `background-color: ${Color.SHIP_COVE};`,
            text: "status necunoscut",
            condition: p => p.highway && p.construction && !p.hadStatus,
            lineType: [shipCoveLine],
            canHide: true,
			hidden: true
        },

    ]
}
