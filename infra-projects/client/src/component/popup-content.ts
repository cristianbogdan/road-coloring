import { Color } from '../constants';
import { computeStatus } from '../data-processing';
import { Props } from '../road-style';

function getProgressColor(percent?: number) {
    return !percent ? Color.BLIZZARD_BLUE : percent > 75 ? Color.DODGER_BLUE : percent > 50 ? Color.DEEP_SKY_BLUE : percent > 25 ? Color.LIGHT_SKY_BLUE : percent > 0 ? Color.POWDER_BLUE : Color.GRAY;
}
export default function generatePopupHtmlContent(props: Props) {
    if (props.comentarii_problema) {
        return '<b>' + props.nume + '</b><br/>'
            + props.comentarii_problema + '<br/><br/>'
            + props.comentarii_rezolvare_curenta + '<br/>'
            + 'Estimare: ' + props.estimare_rezolvare +
            (props.link ? ('<br/><a href="' + props.link + '" target="PUM">detalii</a>') : '');


    }
    if (props.highway == 'lot_limit' || props.railway == 'lot_limit')
        return 'Limita lot ' + (props.highway ? 'autostrada' : 'CF') + ' <a href=\"https://openstreetmap.org/node/' + props.osm_id + '\" target="OSM">' + props.name + '</a>';

    var x = (props.highway ? props.highway : props.railway)
        + ' <a href=\"https://openstreetmap.org/way/' + props.osm_id + '\" target="OSM">'
        + (props.ref ? props.ref + (props.name ? ('(' + props.name + ')') : '') : (props.name ? props.name : props.osm_id))
        + "</a>"
        //+"[<a href=\"https://openstreetmap.org/edit?way="+prop.osm_id+"\" target=\"OSMEdit\">edit</a>] "
        //    +"</a> [<a href=\"https://openstreetmap.org/edit?editor=potlatch2&way="+prop.osm_id+"\" target=\"OSMEdit\">edit-potlach</a>]"
        ;

    if (props.status) computeStatus(props);

    if (props.highway == 'construction' || props.highway == 'proposed' || (props.railway && props.latestProgress != 100)) {
        x += (props.opening_date ? "<br>Estimarea terminarii constructiei: " + props.opening_date : '');
        x += (props.access == 'no' ? "<br><font color='red'>Inchis traficului la terminarea constructiei</font>" : '');

        if (props.hadStatus)
            if (props.highway) x += "<br>" + (props.AC ? '<font color=' + Color.DEEP_SKY_BLUE + '>Autorizatie de construire</font>' : props.PTE ? '<font color=' + Color.ORANGE + '>Are Proiect Tehnic aprobat dar nu Autorizatie de Construire</font>' : props.AM ? '<font color=' + Color.ORANGE_RED + '>Are Acord de Mediu dar nu Proiect Tehnic aprobat, deci nu are Autorizatie de Construire</font>' : '<font color=' + Color.RED + '>Nu are Acord de Mediu, deci nu are Autorizatie de Construire</font>');
            else x += (props.AC ? "<br>" + '<font color=' + Color.DEEP_SKY_BLUE + '>Autorizatie de construire</font>' : '');
        else if (props.highway)
            x += "<br>Progresul constructiei necunoscut";
        if (props.tender) {
            x += "<br>In licitatie " + props.tender;
            if (props.winner) x += "<br> castigator " + props.winner;
        }
        x += (props.builder ? "<br>Constructor: " + props.builder : '');
        x += (props.severance ? "<br>Reziliat: " + props.severance : '');
        x += (props.financing ? "<br>Finantare: " + props.financing : '');

        if (props.progress) {
            var color = getProgressColor(props.latestProgress);
            x += "<br>Stadiul lucrarilor: <font color=" + color + "><b>" + props.progress[0] + "</b></font><font size=-2>"
                + props.progress.slice(1).reduce(function (s, e) {
                    return s + " " + e.trim();
                }, "")
                + "</font>";
        }
        if (props.progress_estimate) {
            var color_e = getProgressColor(props.latestProgress);
            x += "<br>Estimare stadiu: <font color=" + color_e + "><b>" + props.progress_estimate[0] + "</b></font><font size=-2>"
                + props.progress_estimate.slice(1).reduce(function (s, e) {
                    return s + " " + e.trim();
                }, "")
                + "</font>";
        }
    } else {
        if (props.highway) {
            x += (props.start_date ? "<br>Data terminarii constructiei: " + props.start_date : '');
            x += (props.access_note ? "<br>Dat in circulatie: " + props.access_note.split(' ').pop() : '');

        } else if (props.railway) {
            x += (props.start_date ? "<br>Data terminarii variantei noi: " + props.start_date : '');
            x += (props.start_date_note ? "<br>Data terminarii reabilitarii: " + props.start_date_note.split(' ').pop() : '');
        }
        x += props.access == 'no' ? "<br><font color='red'>Inchis traficului</font>" : "";
    }

    if (props.railway) {
        if (props.signal_progress && !props["railway:etcs"]) {
            x += "<br>Semnalizare ETCS: <font color=" + Color.ORANGE + "><b>" + props.signal_progress[0] + "</b></font><font size=-2><br>"
                + props.signal_progress.slice(1).reduce(function (s, e) {
                    return s + " " + e.trim();
                }, "")
        } else if (props["railway:etcs"]) x += "<br>Semnalizare ETCS: nivel " + props["railway:etcs"];
        else if (props["construction:railway:etcs"]) x += "<br>Semnalizare ETCS: implementare impreuna cu reabilitarea liniei, nivel " + props["construction:railway:etcs"];
        else x += "<br>Semnalizare ETCS: neimplementat";
    }

    x += props.bridge == 'yes' ? "<br>Pod" : "";
    x += props.tunnel == 'yes' ? "<br>Tunel" : "";
    return x;
}
