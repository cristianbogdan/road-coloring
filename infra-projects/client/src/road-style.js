import { Color, LineWeight, DashArray } from './constants'

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

export const progressLine = (percent) => {
    return {
        weight: LineWeight.THICK,
        color: !percent ? Color.BLIZZARD_BLUE : percent > 75 ? Color.DODGER_BLUE : percent > 50 ? Color.DEEP_SKY_BLUE : percent > 25 ? Color.LIGHT_SKY_BLUE : percent > 0 ? Color.POWDER_BLUE : Color.GRAY
    }
}

export const statusLine = (props) => {
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


export const legend = {
    basicStyle: "position: relative; display: inline-block; width: 35px; height: 3px; bottom: 2px;",
    getVisibleProjectTypes: function () {
        return this.projectTypes.filter(p => !p.hidden);
    },
    hideProjectTypeByIds: function (ids) {
        for (const projectType of this.projectTypes) {
            if (ids.includes(projectType.id) && projectType.canHide) projectType.hidden = true;
            else projectType.hidden = false;
        }
    },
    showProjectTypeByIds: function (ids) {
        for (const projectType of this.projectTypes) {
            if (ids.includes(projectType.id)) projectType.hidden = false;
            else projectType.hidden = true;
        }
    },
    projectTypes: [

        /* Highway */
        {
            id: "a-finalizata",
            symbol: `background-color: ${Color.BLUE};`,
            text: "în circulație",
            condition: (p) => p.highway && !p.construction && !p.proposed && p.access != 'no',
            lineType: (p) => [blueLine],
            canHide: true
        },
        {
            id: "a-fara-acces",
            symbol: `background-color: ${Color.BLUE}; border-top: dotted ${Color.RED};`,
            text: "recepționat/circulabil fără acces",
            condition: (p) => p.highway && !p.construction && !p.proposed && p.access == 'no',
            lineType: (p) => [blueLine, redDashLine],
            canHide: true
        },
        {
            id: "a-in-construire",
            symbol: `background-color: ${Color.LIGHT_SKY_BLUE};`,
            text: 'în construire, cu AC, stadiu:<br>'
                + '<font color=' + Color.BLIZZARD_BLUE + '>0%</font> <font color=' + Color.POWDER_BLUE + '>&lt;25%</font> <font color=' + Color.LIGHT_SKY_BLUE + '>&lt;50%</font> <font color=' + Color.DEEP_SKY_BLUE + '>&lt;75%</font> <font color=' + Color.DODGER_BLUE + '>&lt;100%</font>',
            condition: (p) => p.highway && p.construction && p.AC && p.builder,
            lineType: (p) => [progressLine(p.latestProgress)],
            canHide: true
        },
        {
            id: "a-neatribuita",
            symbol: `border-top: dotted ${Color.DEEP_SKY_BLUE};`,
            text: "neatribuit sau reziliat, cu AC",
            condition: (p) => p.highway && (p.proposed || !p.builder) && p.AC,
            lineType: (p) => [progressLine(p.latestProgress), whiteDashLine],
            canHide: true
        },
        {
            id: "a-atribuita-fara-am",
            symbol: `background-color: ${Color.RED};`,
            text: "atribuit, lipsă AM",
            condition: (p) => p.highway && p.builder && !p.AM && !p.PTE,
            lineType: (p) => [redLine],
            canHide: true
        },
        {
            id: "a-atribuita-fara-pt",
            symbol: `background-color: ${Color.ORANGE_RED};`,
            text: "cu AM, fără PT aprobat",
            condition: (p) => p.highway && p.construction && p.builder && !p.PTE && p.AM,
            lineType: (p) => [orangeRedLine],
            canHide: true
        },
        {
            id: "a-atribuita-fara-ac",
            symbol: `background-color: ${Color.AMBER};`,
            text: "cu PT aprobat, fără AC",
            condition: (p) => p.highway && p.builder && !p.AC && p.PTE,
            lineType: (p) => [amberLine],
            canHide: true
        },
        {
            id: "a-neatribuita-fara-avize",
            symbol: `border-top: dotted ${Color.ORANGE_RED};`,
            text: "neatribuit, lipsă AC/PT/AM",
            condition: (p) => p.highway && p.hadStatus && (!p.AC || !p.PTE || !p.AM),
            lineType: (p) => [statusLine(p), whiteDashLine],
            canHide: true
        },

        /* Railway */
        {
            id: "cf-noua",
            symbol: `background-color: ${Color.BLUE}; border-top: dotted ${Color.BLACK};`,
            text: "CF nouă finalizată",
            condition: (p) => p.railway && p.latestProgress === 100 && p.start_date,
            lineType: (p) => [blueLine, blackDashLine],
            canHide: true
        },
        {
            id: "cf-reabilitata",
            symbol: `border-top: dotted ${Color.BLACK};`,
            text: "CF cu reabilitare finalizată",
            condition: (p) => p.railway && p.latestProgress === 100 && p.start_date_note,
            lineType: (p) => [blackLine, whiteDashLine],
            canHide: true
        },
        {
            id: "cf-noua-in-construire",
            symbol: `background-color: ${Color.RED}; border-top: dotted ${Color.POWDER_BLUE};`,
            text: "CF nouă cu AC, în construire",
            condition: (p) => p.railway && p.railway == 'construction',
            lineType: (p) => [progressLine(p.latestProgress), redDashLine],
            canHide: true
        },
        {
            id: "cf-in-reabilitare",
            symbol: `background-color: ${Color.BLACK}; border-top: dotted ${Color.POWDER_BLUE};`,
            text: "CF cu AC, în reabilitare",
            condition: (p) => p.railway && p.railway !== 'proposed' && !p.tender,
            lineType: (p) => [progressLine(p.latestProgress), blackDashLine],
            canHide: true
        },
        {
            id: "cf-noua-neatribuita",
            symbol: `background-color: ${Color.RED}; border-top: dotted ${Color.ROSE_PINK};`,
            text: "CF nouă, neatribuită",
            condition: (p) => p.railway === 'proposed' /*&& p.tender*/,
            lineType: (p) => [rosePinkLine, redDashLine],
            canHide: true
        },
        {
            id: "cf-reabilitare-neatribuita",
            symbol: `background-color: ${Color.BLACK}; border-top: dotted ${Color.ROSE_PINK};`,
            text: "CF vechi, neatribuită",
            condition: (p) => p.railway === 'rail' && p.tender,
            lineType: (p) => [rosePinkLine, blackDashLine],
            canHide: true
        },

        /* Proposed projects */
        {
            id: "proiecte-propuse",
            symbol: `border-top: dotted ${Color.ROSE_PINK};`,
            text: "proiecte propuse",
            condition: (p) => p.highway && (p.proposed || p.hadStatus && !p.AC && !p.AM && !p.PTE),
            lineType: (p) => [rosePinkLine, whiteDashLine],
            canHide: true,
            hidden: true
        },
        {
            id: "status-necunoscut",
            symbol: `background-color: ${Color.SHIP_COVE};`,
            text: "status necunoscut",
            condition: (p) => p.highway && p.construction && !p.hadStatus,
            lineType: (p) => [shipCoveLine],
            canHide: true,
            hidden: true
        }
    ],

}


// legend.projectTypes.map(l => l.id)
// console.log(`legend:${legend.projectTypes.map(l => l.id)}`)





// // automatically generated IDs for legend project types
// for (const projectType of legend.projectTypes) {
//     projectType.id = pickFirstLetterOfEachWord(convertsStringToLatin(projectType.text))
// }

// console.log(legend.projectTypes.map(l => l.id))

// function pickFirstLetterOfEachWord(str) {
//     return str.split(" ").map(word => word[0]).join("")
// }



// function convertsStringToLatin(str) {
//     return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
// }

// // let en = btoa(strin)
// // let dec = JSON.parse(atob(en))
