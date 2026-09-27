export const MONTH_QUESTIONS=['¿Qué me ayudó?','¿Qué me costó?','¿Qué quiero ajustar?'];
export function readMonthlyReview(text=''):{answers:string[];legacy:string}{
 try{const p=JSON.parse(text);if(p.format==='monthly-v1'&&Array.isArray(p.answers)&&p.answers.length===3)return{answers:p.answers,legacy:p.legacy??''};}catch{}
 const markers=MONTH_QUESTIONS.map(q=>q+'\n');const points=markers.map(m=>text.indexOf(m));
 if(points[0]>=0&&points[1]>points[0]&&points[2]>points[1])return {legacy:text.slice(0,points[0]).replace(/^Revisión anterior\n/,'').trim(),answers:points.map((at,i)=>text.slice(at+markers[i].length,i===2?undefined:points[i+1]).trim())};
 return {answers:['','',''],legacy:text};
}
export function writeMonthlyReview(answers:string[],legacy=''){return (legacy?'Revisión anterior\n'+legacy+'\n\n':'')+MONTH_QUESTIONS.map((q,i)=>q+'\n'+answers[i].trim()).join('\n\n');}
