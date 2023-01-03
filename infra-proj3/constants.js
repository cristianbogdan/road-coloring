const Color = {
    BLACK: '#000000',
    RED: '#ff0000',
    ORANGE: '#ff8000',
    GRAY: '#808080',
    BLUE: '#0000ff',
    POWDER_BLUE: '#b0e0e6',
    LIGHT_SKY_BLUE: '#87cefa',
    DEEP_SKY_BLUE: '#00bfff',
    ORANGE_RED: '#ff4500',
    DODGER_BLUE: '#1e90ff'
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

const legend = {
    basicStyle: 'position:relative; display:inline-block; width:35px; height:3px; bottom:2px;',
    projectTypes: [

        /* Rutier */
        {
            symbol: 'background-color:' + Color.BLUE + ';',
            text: "în circulație",
            condition: p => p.highway && !p.construction && !p.proposed && p.access != 'no',
            lineType: p => [transp, blue],
            canHide: true
        },
        {
            symbol: 'background-color:' + Color.BLUE + '; border-top:dotted red',
            text: "recepționat/circulabil fără acces",
            condition: p => p.highway && !p.construction && !p.proposed && p.access == 'no',
            lineType: p => [transp, blue, redDash],
            canHide: true
        },
        {
            symbol: 'background-color:' + Color.LIGHT_SKY_BLUE + ';',
            text: 'în construcție, cu AC, stadiu:<br>'
                + '<font color=' + Color.GRAY + '>0%</font> <font color=' + Color.POWDER_BLUE + '>&lt;25%</font> <font color=' + Color.LIGHT_SKY_BLUE + '>&lt;50%</font> <font color=' + Color.DEEP_SKY_BLUE + '>&lt;75%</font> <font color=' + Color.DODGER_BLUE + '>&lt;100%</font>',
            condition: p => p.highway && p.construction && p.AC && p.builder,
            lineType: p => [transp, colorProgress(p.latestProgress)],
            canHide: true
        },
        {
            symbol: 'border-top:dotted ' + Color.DEEP_SKY_BLUE + '; ',
            text: 'neatribuit sau reziliat, cu AC',
            condition: p => p.highway && (p.proposed || !p.builder) && p.AC,
            lineType: p => [transp, colorProgress(p.latestProgress), whiteDash],
            canHide: true
        },
        {
            symbol: 'background-color:' + Color.RED + ';',
            text: ' atribuit, lipsă AM',
            condition: p => p.highway && p.builder && !p.AM && !p.PTE,
            lineType: p => [transp, a_missing(p)],
            canHide: true
        },
        {
            symbol: 'background-color:' + Color.ORANGE_RED + ';',
            text: 'cu AM, fără PT aprobat',
            condition: p => p.highway && p.construction && p.builder && !p.PTE && p.AM,
            lineType: p => [transp, a_missing(p)],
            canHide: true
        },
        {
            symbol: 'background-color:' + Color.ORANGE + ';',
            text: 'cu PT aprobat, fără AC',
            condition: p => p.highway && p.builder && !p.AC && p.PTE,
            lineType: p => [transp, a_missing(p)],
            canHide: true
        },
        {
            symbol: 'border-top:dotted ' + Color.ORANGE_RED + ';',
            text: 'neatribuit, lipsă AC/PT/AM',
            condition: p => p.highway && p.hadStatus && (!p.AC || !p.PTE || !p.AM),
            lineType: p => [transp, a_missing(p), whiteDash],
            canHide: true
        },

        /* Feroviar */
        {
            symbol: 'background-color:blue; border-top:dotted #000000 ;',
            text: 'CF nouă finalizata',
            condition: p => p.railway && p.latestProgress === 100 && !p.opening_date && p.start_date,
            lineType: p => [transp, blue, railDash],
            canHide: true
        },
        {
            symbol: 'border-top:dotted' + Color.BLACK + ' ;',
            text: 'CF cu reabilitare finalizată',
            condition: p => p.railway && p.latestProgress === 100 && p.opening_date && !p.start_date,
            lineType: p => [transp, black, whiteDash],
            canHide: true
        },
        {
            symbol: 'background-color:red; border-top:dotted ' + Color.POWDER_BLUE + ';',
            text: 'CF nouă cu AC, în construcție',
            condition: p => p.railway && p.railway == 'construction',
            lineType: p => [transp, colorProgress(p.latestProgress), redDash],
            canHide: true
        },
        {
            symbol: 'background-color:black; border-top:dotted ' + Color.POWDER_BLUE + ';',
            text: 'CF cu AC, în reabilitare',
            condition: p => p.railway && p.railway !== 'proposed' && !p.tender,
            lineType: p => [transp, colorProgress(p.latestProgress), railDash],
            canHide: true
        },
        {
            symbol: 'background-color:red; border-top:dotted #ffbdbd;',
            text: 'CF nouă, neatribuită',
            condition: p => p.railway === 'proposed' /*&& p.tender*/,
            lineType: p => [transp, lightred, redDash],
            canHide: true
        },
        {
            symbol: 'background-color:black; border-top:dotted #ffbdbd;',
            text: 'CF vechi, neatribuită',
            condition: p => p.railway === 'rail' && p.tender,
            lineType: p => [transp, lightred, railDash],
            canHide: true
        },

        /* Proiecte propuse */
        {
            symbol: 'border-top:dotted #ffbdbd;',
            text: 'proiecte propuse',
            condition: p => p.highway && (p.proposed || p.hadStatus && !p.AC && !p.AM && !p.PTE),
            lineType: p => [transp, lightred, whiteDash],
            canHide: true,
            hidden: true
        },
        {
            symbol: 'background-color:#809bc0;',
            text: 'statut necunoscut',
            condition: p => p.highway && p.construction && !p.hadStatus,
            lineType: p => [transp, unknown],
            canHide: true,
        },

    ]
}
