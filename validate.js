// uso: node validate.js content/w1.js [content/w2.js ...]
const fs=require('fs'),vm=require('vm');
const ctx={window:{}};vm.createContext(ctx);let errs=0,tot=0;
const err=(w,m)=>{errs++;console.log('✗',w,m)};
for(const f of process.argv.slice(2)){vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});}
const BT=['text','cards','flip','compare','analogy','trap','sort','order','check','keypoints'];
const ids=new Set();
for(const w of ctx.window.AZ.worlds){
  if(!w.id||!w.title||!w.weight||typeof w.share!=='number')err(w.id,'mundo incompleto');
  for(const l of w.levels){
    const W=l.id; if(ids.has(W))err(W,'id duplicado');ids.add(W);
    if(!l.title||!l.goal||!Array.isArray(l.lesson)||!Array.isArray(l.questions))err(W,'nivel incompleto');
    const types=l.lesson.map(b=>b.type);
    types.forEach(t=>{if(!BT.includes(t))err(W,'bloque desconocido '+t)});
    if(types[types.length-1]!=='keypoints')err(W,'keypoints no es el último');
    if(!types.some(t=>t==='cards'||t==='flip'))err(W,'falta cards/flip');
    if(!types.some(t=>['sort','order','check'].includes(t)))err(W,'falta interactivo');
    if(!types.includes('trap'))err(W,'falta trap');
    for(const b of l.lesson){
      if(b.type==='sort')b.items.forEach(i=>{if(!(i.bucket>=0&&i.bucket<b.buckets.length))err(W,'sort bucket inválido')});
      if(b.type==='check'&&!(b.a>=0&&b.a<b.o.length&&b.why))err(W,'check inválido');
      if(b.type==='compare')b.rows.forEach(r=>{if(r.length!==b.head.length)err(W,'compare fila con columnas distintas')});
    }
    if(l.questions.length<20)err(W,'menos de 20 preguntas ('+l.questions.length+')');
    const qs=new Set();
    l.questions.forEach((q,i)=>{tot++;const Q=W+'#'+i;
      if(qs.has(q.q+(q.s?JSON.stringify(q.s):'')+(q.pairs?JSON.stringify(q.pairs):'')))err(Q,'pregunta duplicada');qs.add(q.q+(q.s?JSON.stringify(q.s):'')+(q.pairs?JSON.stringify(q.pairs):''));
      if(!q.why||!q.q)err(Q,'falta q/why');if(![1,2,3].includes(q.d))err(Q,'d inválido');
      switch(q.t){
        case 'single':if(!(Number.isInteger(q.a)&&q.a>=0&&q.a<q.o.length&&q.o.length>=3))err(Q,'single inválida');break;
        case 'multi':if(!(Array.isArray(q.a)&&q.a.length>=2&&q.a.every(x=>x>=0&&x<q.o.length)&&new Set(q.a).size===q.a.length))err(Q,'multi inválida');break;
        case 'yn':if(!(q.s&&q.s.length===3&&q.s.every(s=>typeof s.a==='boolean'&&s.text)))err(Q,'yn inválida');break;
        case 'drop':if(!(q.q.split('___').length===2&&q.a>=0&&q.a<q.o.length))err(Q,'drop inválida');break;
        case 'match':if(!(q.pairs&&q.pairs.length>=3&&new Set(q.pairs.map(p=>p[1])).size===q.pairs.length))err(Q,'match inválida');break;
        default:err(Q,'tipo desconocido '+q.t);
      }});
    const pos=l.questions.filter(q=>q.t==='single').map(q=>q.a);const c=[0,0,0,0,0];pos.forEach(p=>c[p]++);
    if(pos.length>4&&Math.max(...c)>pos.length*0.5)err(W,'respuestas single concentradas en una posición '+c);
    console.log(`  ${W} ${l.title}: ${l.lesson.length} bloques, ${l.questions.length} preguntas`);
  }
}
console.log(errs?`\n${errs} errores`:`\nOK — ${tot} preguntas`);process.exit(errs?1:0);
