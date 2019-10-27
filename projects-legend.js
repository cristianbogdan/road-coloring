let legend={
    basicStyle:'position:relative; display:inline-block; width:35px; height:3px; bottom:2px;',
    projectTypes:[
	{
	    symbol: 'background-color:'+clr(blue) +';',
	    text: "în circulație",
	    condition: p=> p.highway && !p.construction && !p.proposed &&  p.access!='no',
	    lineType: p=> [transp, blue],
	    canHide: true
	},
	{
	    symbol: 'background-color:'+clr(blue)+'; border-top:dotted red',
	    text: "recepționat/circulabil fără acces",
	    condition: p=> p.highway && !p.construction && !p.proposed &&  p.access=='no',
	    lineType: p=> [transp, blue, redDash],
	    canHide: true
	},
	{
	    symbol: 'background-color:'+clr(lightSkyBlue)+';',
	    text: 'în construcție, cu AC, stadiu:<br>'
	        +'<font color='+clr(gray)+'>0%</font> <font color='+clr(powderBlue)+'>&lt;25%</font> <font color='+clr(lightSkyBlue)+'>&lt;50%</font> <font color='+clr(deepSkyBlue)+'>&lt;75%</font> <font color='+clr(dodgerBlue)+'>&lt;100%</font>',
	    condition: p=> p.highway && p.construction && p.AC && p.builder,
	    lineType: p=>[transp, colorProgress(p.latestProgress)],
	    canHide: true
	},
	{
	    symbol: 'border-top:dotted '+clr(deepSkyBlue)+'; ',
	    text: 'neatribuit sau reziliat, cu AC',
	    condition: p=> p.highway && (p.proposed ||!p.builder) && p.AC,
	    lineType: p=>[transp, colorProgress(p.latestProgress), whiteDash],
	    canHide: true
	},
	{
	    symbol:'background-color:'+clr(red)+';',
	    text: ' atribuit, lipsă AM',
	    condition: p=> p.highway && p.builder && !p.AM && !p.PTE,
	    lineType: p=>[transp, a_missing(p)],
	    canHide: true
	},
	{
	    symbol:'background-color:'+clr(orangeRed)+';',
	    text: 'cu AM, fără PT aprobat',
	    condition: p=> p.highway && p.construction && p.builder && !p.PTE && p.AM,
	    lineType: p=>[transp, a_missing(p)],
	    canHide: true
	},
	{
	    symbol:'background-color:'+clr(orange)+';',	    
	    text: 'cu PT aprobat, fără AC',
	    condition: p=> p.highway && p.builder && !p.AC && p.PTE,
	    lineType: p=>[transp, a_missing(p)],
	    canHide: true
	},
	{
	    symbol:'border-top:dotted '+clr(orangeRed)+';',
	    text: 'neatribuit, lipsă AC/PT/AM',
	    condition: p=> p.highway && p.hadStatus  && (!p.AC || !p.PTE || !p.AM) ,
	    lineType: p=>[transp, a_missing(p), whiteDash],
	    canHide: true
	},
	{
	    symbol:'background-color:black; border-top:dotted '+clr(blue)+';' ,
	    text: 'CF cu reabilitare finalizată',
	    condition: p=> p.railway && p.latestProgress===100 /* && p.opening_date && !p.start_date */,
	    lineType: p=>[transp, blue, railDash],
	    canHide: true
	},
	/*
	{
	    symbol:'background-color:black; border-top:dotted '+clr(powderBlue)+';' ,
	    text: 'CF nouă finalizata',
	    condition: p=> p.railway && p.latestProgress===100 &&  && !p.opening_date && p.start_date ,
	    lineType: p=>[transp, blue, newrailDash],
	    canHide: true
	},
	*/
	{
	    symbol:'background-color:gray; border-top:dotted '+clr(powderBlue)+';' ,
	    text: 'CF nouă cu AC, în construcție',
	    condition: p=> p.railway && p.railway=='construction' ,
	    lineType: p=>[transp, colorProgress(p.latestProgress), newrailDash],
	    canHide: true
	},
		{
	    symbol:'background-color:black; border-top:dotted '+clr(powderBlue)+';' ,
	    text: 'CF cu AC, în reabilitare',
	    condition: p=> p.railway && p.railway!=='proposed' && !p.tender ,
	    lineType: p=>[transp, colorProgress(p.latestProgress), railDash],
	    canHide: true
	},
	{
	    symbol:'background-color:gray; border-top:dotted #ffbdbd;',
	    text: 'CF nouă, neatribuit',
	    condition: p=> p.railway==='proposed' /*&& p.tender*/,
	    lineType: p=> [transp,lightred, newrailDash],
	    canHide: true
	},
	{
	    symbol:'background-color:black; border-top:dotted #ffbdbd;',
	    text: 'CF vechi, neatribuit',
	    condition: p=> p.railway==='rail'  && p.tender ,
	    lineType: p=> [transp,lightred, railDash],
	    canHide: true
	},
	{
	    symbol:'border-top:dotted #ffbdbd;',	    
	    text: 'proiecte propuse (vise)',
	    condition: p=> p.highway && (p.proposed || p.hadStatus && !p.AC && !p.AM && !p.PTE),
	    lineType: p=> [transp, lightred, whiteDash],
	    canHide: true,
	    hidden: true
	},
	{
	    symbol:'background-color:#809bc0;',
	    text: 'statut necunoscut',
	    condition: p=> p.highway  && p.construction && !p.hadStatus,
	    lineType: p=> [transp, unknown],
	    canHide: true,
	},
	
    ]
}
