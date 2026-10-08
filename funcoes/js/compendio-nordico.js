(function(){
"use strict";
const db=window.HURRAS_NORDICO,root=document.getElementById("north-results"),eventRoot=document.getElementById("north-event-list");
const search=document.getElementById("north-search"),group=document.getElementById("north-group"),order=document.getElementById("north-order"),count=document.getElementById("north-count");
if(!db||!Array.isArray(db.fichas)||!Array.isArray(db.camposBatalha)){root.textContent="Não foi possível carregar as fichas dos deuses.";return}
const STORAGE="hurras_deuses_historico_batalha_v1";
let state={};
try{const stored=JSON.parse(localStorage.getItem(STORAGE)||"{}");if(stored&&typeof stored==="object"&&!Array.isArray(stored))state=stored}catch(e){}
function put(){try{localStorage.setItem(STORAGE,JSON.stringify(state));return true}catch(e){return false}}
function elem(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined&&txt!==null)e.textContent=String(txt);return e}
function section(parent,title){const sec=elem("section","norse-block");sec.append(elem("h4",null,title));parent.append(sec);return sec}
function idFor(r){const slug=r.nome.split(" — ")[0].normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");return "ficha-"+slug+"-"+r.pagina+(r.ordem?"-"+r.ordem:"")}
function userState(r){const id=idFor(r);if(!state[id]||typeof state[id]!=="object")state[id]={};
const st=state[id];if(!st.pontos||typeof st.pontos!=="object")st.pontos={};if(!st.recursos||typeof st.recursos!=="object")st.recursos={};if(!Array.isArray(st.eventos))st.eventos=[];return st}
function stat(r,label){const hit=(r.atributos||[]).find(a=>a[0]===label);return hit?hit[1]:null}
function record(r,description,kind){const st=userState(r);st.eventos.unshift({data:new Date().toISOString(),tipo:kind||"combate",texto:String(description).slice(0,900)});
st.eventos=st.eventos.slice(0,250);put();}
function item(parent,value){const parts=String(value).split(" — ");const div=elem("div","norse-item");if(parts.length>1){div.append(elem("strong",null,parts[0]),elem("span",null,parts.slice(1).join(" — ")));}else div.append(elem("span",null,value));parent.append(div)}
function entries(parent,title,arr,callback){if(!arr||!arr.length)return;const b=section(parent,title);arr.forEach(text=>{if(!callback){item(b,text);return}const row=elem("div","north-entry-with-action");item(row,text);const btn=elem("button","north-log-button","Registrar uso");btn.type="button";btn.addEventListener("click",()=>callback(text));row.append(btn);b.append(row)})}
function stats(parent,values){const dl=elem("dl","norse-stats");values.forEach(([label,value])=>{const row=elem("div","norse-stat");row.append(elem("dt",null,label),elem("dd",null,value));dl.append(row)});parent.append(dl)}
function formatPool(pool){return pool.map(p=>p.dados+"d"+p.faces+" "+p.tipo).join(" + ")}
function range(pool){const min=pool.reduce((s,p)=>s+p.dados,0),max=pool.reduce((s,p)=>s+p.dados*p.faces,0),mean=pool.reduce((s,p)=>s+p.dados*(p.faces+1)/2,0);return min+"–"+max+" (média "+String(mean).replace(".",",")+")"}
function rollPool(pool){let total=0;const results=[];for(const p of pool){const dice=[];for(let i=0;i<p.dados;i++){const v=1+Math.floor(Math.random()*p.faces);dice.push(v);total+=v}results.push(p.tipo+": ["+dice.join(", ")+"] = "+dice.reduce((s,x)=>s+x,0))}return {total,details:results.join(" · ")}}
function battlePanel(r){
 const id=idFor(r),st=userState(r),outer=elem("section","north-battle"),header=elem("div","north-battle-header");
 header.append(elem("div","north-battle-title","⚔ Histórico de batalha e pontos"),elem("p",null,"Valores de 0 a 12 para consulta em combate. Eles não substituem os atributos originais do compêndio."));
 outer.append(header);
 const columns=elem("div","north-battle-columns"),left=elem("div","north-battle-attributes"),right=elem("div","north-battle-history");
 const skillTitle=elem("h4",null,"Atributos de batalha • 36 campos");left.append(skillTitle);
 const skillGrid=elem("div","north-skill-groups");
 db.camposBatalha.forEach((g,ix)=>{
  const details=elem("details","north-skill-group");details.open=ix===0;
  details.append(elem("summary",null,g.titulo+" ("+g.campos.length+")"));
  const list=elem("div","north-point-list");
  g.campos.forEach(label=>{
   const row=elem("label","north-point-row"),name=elem("span",null,label),wrap=elem("span","north-number-wrap");
   const input=elem("input","north-number-field");input.type="number";input.min="0";input.max="12";input.step="1";input.inputMode="numeric";
   input.setAttribute("aria-label",label+" de "+r.nome+", 0 a 12");input.placeholder="—";
   if(Object.prototype.hasOwnProperty.call(st.pontos,label)){const v=Number(st.pontos[label]);if(Number.isInteger(v)&&v>=0&&v<=12)input.value=String(v)}
   const max=elem("small",null,"/ 12");
   input.addEventListener("change",()=>{
    const before=Object.prototype.hasOwnProperty.call(st.pontos,label)?String(st.pontos[label]):"—";
    const value=input.value.trim();
    if(value!==""){const n=Number(value);if(!Number.isInteger(n)||n<0||n>12){input.value=before==="—"?"":before;msg.textContent="Use um número inteiro de 0 a 12.";return}st.pontos[label]=n;input.value=String(n)}
    else delete st.pontos[label];
    const after=value===""?"—":input.value;
    if(before!==after){record(r,label+": "+before+" → "+after,"atributo");renderHistory();}
    msg.textContent="Pontos atualizados neste navegador.";
   });
   wrap.append(input,max);row.append(name,wrap);list.append(row);
  });
  details.append(list);skillGrid.append(details);
 });
 left.append(skillGrid);
 right.append(elem("h4",null,"Registro individual de combate"));
 const resourceGrid=elem("div","north-current-resources");
 for(const [key,label,source] of [["pv","Vitalidade atual","Vitalidade"],["mana","Mana atual","Mana"]]){
  const field=elem("label","north-resource-label");
  const input=elem("input","north-resource-number");input.type="number";input.min="0";input.step="1";input.inputMode="numeric";
  const official=stat(r,source);
  input.value=Object.prototype.hasOwnProperty.call(st.recursos,key)?String(st.recursos[key]):official===null?"":String(official);
  input.placeholder="Não informado";field.append(elem("span",null,label),input);resourceGrid.append(field);
  input.addEventListener("change",()=>{
    const before=Object.prototype.hasOwnProperty.call(st.recursos,key)?st.recursos[key]:official;
    const raw=input.value.trim();
    if(raw===""){delete st.recursos[key];record(r,label+": valor não informado","recurso");input.value="";renderHistory();return}
    const value=Number(raw);
    if(!Number.isSafeInteger(value)||value<0||value>100000000){input.value=before===null?"":String(before);msg.textContent="Informe um número válido, igual ou maior que zero.";return}
    if(value!==before){st.recursos[key]=value;record(r,label+": "+(before===null?"—":before)+" → "+value,"recurso");renderHistory()}
   });
 }
 right.append(resourceGrid);
 const logTitle=elem("label","north-history-label","Descreva o que aconteceu no turno");
 const note=elem("textarea","north-history-note");note.rows=2;note.maxLength=900;note.placeholder="Ex.: Thor acertou o alvo, sofreu 15 de dano, usou a passiva...";
 const actions=elem("div","north-history-actions");
 const add=elem("button","north-action-primary","Registrar evento");
 const clear=elem("button","north-action-secondary","Limpar histórico");
 const msg=elem("p","north-history-status");msg.setAttribute("aria-live","polite");
 const history=elem("ol","north-log-list");
 function renderHistory(){history.replaceChildren();if(!st.eventos.length){history.append(elem("li","north-log-empty","Nenhum combate registrado ainda."));return}
  st.eventos.forEach((e,i)=>{const li=elem("li","north-log-entry");let when="";try{when=new Date(e.data).toLocaleString("pt-BR")}catch(ex){when="Sem data"};li.append(elem("small",null,when+" · "+(e.tipo||"combate")),elem("p",null,e.texto));history.append(li)})}
 add.type="button";add.addEventListener("click",()=>{const text=note.value.trim();if(!text){msg.textContent="Descreva o acontecimento antes de registrar.";return}record(r,text,"ação do Mestre");note.value="";msg.textContent="Evento registrado.";renderHistory()});
 clear.type="button";clear.addEventListener("click",()=>{if(!st.eventos.length)return;if(!confirm("Limpar o histórico de "+r.nome+" neste navegador?"))return;st.eventos=[];put();renderHistory();msg.textContent="Histórico limpo. Os atributos de combate foram mantidos."});
 actions.append(add,clear);right.append(logTitle,note,actions,msg,history);renderHistory();
 columns.append(left,right);outer.append(columns);
 return {root:outer,recordAttack:(text,kind)=>{record(r,text,kind);renderHistory();msg.textContent="Golpe registrado no histórico."}};
}
function detailedAttacks(r,host,onLog){
 if(!Array.isArray(r.golpesDetalhados)||!r.golpesDetalhados.length)return;
 const area=section(host,"Ataques: dano base e com bônus");
 if(r.bonusInfo)area.append(elem("p","north-bonus-hint",r.bonusInfo));
 for(const attack of r.golpesDetalhados){
  const article=elem("article","north-attack-card");article.append(elem("h5",null,attack.nome));
  for(const [label,pool] of [["Sem bônus",attack.base],["Com bônus",attack.comBonus]]){
   const rline=elem("div","north-attack-dice");rline.append(elem("strong",null,label+": "),elem("span",null,formatPool(pool)));article.append(rline);
   article.append(elem("p","north-dice-range",label+" • "+range(pool)));
  }
  const actions=elem("div","north-history-actions");
  for(const [label,pool,buffed] of [["🎲 Rolar base",attack.base,false],["⚡ Rolar com bônus",attack.comBonus,true]]){
   const button=elem("button",buffed?"north-action-secondary":"north-action-primary",label);button.type="button";
   button.addEventListener("click",()=>{const rolled=rollPool(pool);const who=buffed?"com bônus opcional":"sem bônus";
     const text=attack.nome+" ("+who+"): "+formatPool(pool)+" = "+rolled.total+". Dados: "+rolled.details+(buffed?". Bônus de 2 turnos não cumulativo; Mana de ativação controlada manualmente.":"");
     onLog(text,"rolagem");last.textContent="Resultado: "+rolled.total+" • "+rolled.details;
   });
   actions.append(button);
  }
  const last=elem("output","north-roll-output","Role os dados para registrar o resultado na batalha.");
  article.append(actions,last);area.append(article);
 }
}
function renderOne(r){
 const d=elem("details","north-card");d.id=idFor(r);d.open=r.nome.startsWith("THOR —")||r.nome.startsWith("SOLVEIG —");
 const summary=elem("summary"),head=elem("div"),subtitle=r.grupo==="chefes"?"Chefe do Ragnarök":r.grupo==="criaturas"?"Criatura do Ragnarök":"Deus, semideus ou descendente";
 head.append(elem("div","norse-title",r.nome),elem("div","norse-sub",subtitle));summary.append(head,elem("span","norse-pill",r.nivel===null||r.nivel===undefined?"Nível não informado":"Nível "+r.nivel));d.append(summary);
 let loaded=false;
 function populate(){if(loaded)return;loaded=true;
  const wrap=elem("div","norse-columns"),left=elem("section","norse-side"),right=elem("section","norse-side");
  left.setAttribute("aria-label","Atributos e equipamento de "+r.nome);right.setAttribute("aria-label","Poderes e ataques de "+r.nome);
  left.append(elem("h3",null,"01 • Atributos e equipamento"));
  if(r.atributos.length)stats(left,r.atributos);else left.append(elem("p","norse-muted","Atributos originais não informados nesta ficha."));
  if(r.anteriores&&r.anteriores.length){const b=section(left,"Atributos da versão anterior");stats(b,r.anteriores);b.append(elem("p","norse-alert","Valores da antiga versão do Thor (nível 15); não confirmados na ficha de nível 20."))}
  if(r.contexto.length){const b=section(left,"Descrição");r.contexto.forEach(x=>b.append(elem("p","norse-plain",x)))}
  entries(left,"Arma e bônus",r.secoes.arma);entries(left,"Recompensas",r.secoes.drop);
  right.append(elem("h3",null,"02 • Ataques e habilidades"));
  const attackLog=[];
  const b=battlePanel(r);
  const recorder=(text,kind)=>b.recordAttack(text,kind);
  detailedAttacks(r,right,recorder);
  entries(right,"Ataques",r.secoes.ataques,text=>recorder("Ataque utilizado: "+text,"ataque"));
  entries(right,"Magias e técnicas",r.secoes.poderes,text=>recorder("Habilidade utilizada: "+text,"habilidade"));
  entries(right,"Habilidade suprema",r.secoes.suprema,text=>recorder("Suprema utilizada: "+text,"suprema"));
  entries(right,"Passiva",r.secoes.passiva,text=>recorder("Passiva usada: "+text,"passiva"));
  if(!r.secoes.ataques.length&&!r.secoes.poderes.length&&!r.secoes.suprema.length&&!r.secoes.passiva.length&&!r.golpesDetalhados?.length)right.append(elem("p","norse-muted","Ataques não informados nesta ficha."));
  wrap.append(left,right);d.append(wrap,b.root);
 }
 if(d.open)populate();
 d.addEventListener("toggle",()=>{if(d.open)populate()});
 return d;
}
let visible=[];
function render(){const q=search.value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
 visible=db.fichas.filter(r=>(group.value==="todos"||group.value===r.grupo)&&(!q||JSON.stringify(r).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().includes(q)));
 if(order.value==="nome")visible.sort((a,b)=>a.nome.localeCompare(b.nome,"pt-BR"));
 if(order.value==="nivel")visible.sort((a,b)=>(b.nivel??-1)-(a.nivel??-1)||a.nome.localeCompare(b.nome,"pt-BR"));
 root.replaceChildren();visible.forEach(r=>root.append(renderOne(r)));
 if(!visible.length)root.append(elem("p","north-empty","Nenhuma ficha encontrada."));
 count.textContent=visible.length+" de "+db.fichas.length+" fichas disponíveis.";
 document.getElementById("north-toggle").textContent="Expandir todas";
}
search.addEventListener("input",render);group.addEventListener("change",render);order.addEventListener("change",render);
document.getElementById("north-toggle").addEventListener("click",function(){const all=Array.from(root.querySelectorAll("details.north-card"));const shouldOpen=!all.every(d=>d.open);all.forEach(d=>{d.open=shouldOpen});this.textContent=shouldOpen?"Recolher todas":"Expandir todas"});
document.getElementById("north-backup").addEventListener("click",()=>{
 const payload=JSON.stringify({formato:"hurras_deuses_historico_v1",exportadoEm:new Date().toISOString(),dados:state},null,2);
 const url=URL.createObjectURL(new Blob([payload],{type:"application/json"}));const anchor=document.createElement("a");anchor.href=url;anchor.download="hurras-historico-batalhas.json";anchor.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
});
let previous=null;
function beforePrint(){if(previous)return;previous=Array.from(root.querySelectorAll("details.north-card")).map(x=>[x,x.open]);previous.forEach(([x])=>x.open=true)}
function afterPrint(){if(!previous)return;previous.forEach(([x,was])=>x.open=was);previous=null}
window.addEventListener("beforeprint",beforePrint);window.addEventListener("afterprint",afterPrint);
document.getElementById("north-print").addEventListener("click",()=>{beforePrint();window.print()});
db.eventos.forEach(e=>{const card=elem("article","north-event-card");card.append(elem("h3",null,e.titulo),elem("p",null,e.texto));eventRoot.append(card)});
document.getElementById("thor-shortcut").addEventListener("click",()=>{search.value="";group.value="todos";order.value="original";render()});
render();
})();