(function () {
"use strict";
var db=window.HURRAS_NORDICO;
var root=document.getElementById("north-results");
var eventRoot=document.getElementById("north-event-list");
var input=document.getElementById("north-search");
var group=document.getElementById("north-group");
var order=document.getElementById("north-order");
var count=document.getElementById("north-count");
if (!db||!Array.isArray(db.fichas)){root.textContent="Não foi possível carregar as fichas nórdicas.";return;}
function make(tag,cls,content){var e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined&&content!==null)e.textContent=String(content);return e;}
function colTitle(parent,title){parent.appendChild(make("h3",null,title));}
function block(parent,title){var sec=make("section","norse-block");sec.appendChild(make("h4",null,title));parent.appendChild(sec);return sec;}
function item(parent,value){var part=String(value).split(" — ");var div=make("div","norse-item");
 if(part.length>=2){div.appendChild(make("strong",null,part[0]));div.appendChild(make("span",null,part.slice(1).join(" — ")));}
 else{div.appendChild(make("span",null,value));}
 parent.appendChild(div);
}
function entries(parent,title,values){if(!values||!values.length)return;var section=block(parent,title);values.forEach(function(x){item(section,x);});}
function stats(parent,values){var dl=make("dl","norse-stats");(values||[]).forEach(function(pair){var row=make("div","norse-stat");row.appendChild(make("dt",null,pair[0]));row.appendChild(make("dd",null,pair[1]));dl.appendChild(row);});parent.appendChild(dl);}
function idFor(r){var name=r.nome.split(" — ")[0].normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");return "ficha-"+name+"-"+r.pagina+(r.ordem?"-"+r.ordem:"");}
function renderOne(r){var d=make("details","north-card");d.id=idFor(r);if(r.nome.indexOf("THOR —")===0)d.open=true;
var summary=make("summary");var head=make("div");head.appendChild(make("div","norse-title",r.nome));head.appendChild(make("div","norse-sub",r.grupo==="chefes"?"Chefe do Ragnarök":r.grupo==="criaturas"?"Criatura do Ragnarök":"Deus, descendente ou ser nórdico"));summary.appendChild(head);
summary.appendChild(make("span","norse-pill","Nível "+r.nivel));d.appendChild(summary);
var wrap=make("div","norse-columns"),left=make("section","norse-side"),right=make("section","norse-side");
left.setAttribute("aria-label","Atributos e equipamentos de "+r.nome);right.setAttribute("aria-label","Ataques e habilidades de "+r.nome);
colTitle(left,"01 • Atributos e equipamento");
if(r.atributos.length){stats(left,r.atributos);}else left.appendChild(make("p","norse-muted","Os atributos numéricos não constam nesta ficha."));
if(r.anteriores&&r.anteriores.length){var b=block(left,"Atributos da versão anterior");stats(b,r.anteriores);b.appendChild(make("p","norse-alert","Atenção: estes seis valores são da versão anterior do Thor (nível 15). O compêndio de nível 20 não os confirma."));}
if(r.contexto.length){var context=block(left,"Função e contexto");r.contexto.forEach(function(x){context.appendChild(make("p","norse-plain",x));});}
entries(left,"Arma e bônus",r.secoes.arma);
entries(left,"Recompensas / drop",r.secoes.drop);
colTitle(right,"02 • Ataques e habilidades");
var sections=[["Ataques",r.secoes.ataques],["Magias, poderes e técnicas",r.secoes.poderes],["Habilidade suprema",r.secoes.suprema],["Passiva",r.secoes.passiva]];
var has=false;sections.forEach(function(x){if(x[1]&&x[1].length){has=true;entries(right,x[0],x[1]);}});
if(!has)right.appendChild(make("p","norse-muted","Nenhum ataque ou poder adicional consta nesta ficha."));
wrap.appendChild(left);wrap.appendChild(right);d.appendChild(wrap);return d;}
var visible=[];
function filter(){var search=input.value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
visible=db.fichas.filter(function(r){return (group.value==="todos"||r.grupo===group.value)&&(!search||JSON.stringify(r).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().includes(search));});
if(order.value==="nome")visible.sort(function(a,b){return a.nome.localeCompare(b.nome,"pt-BR");});
if(order.value==="nivel")visible.sort(function(a,b){return b.nivel-a.nivel||a.nome.localeCompare(b.nome,"pt-BR");});
root.replaceChildren();visible.forEach(function(r){root.appendChild(renderOne(r));});
if(!visible.length)root.appendChild(make("p","north-empty","Nenhuma ficha encontrada. Tente outro termo ou categoria."));
count.textContent=visible.length+" de "+db.fichas.length+" fichas encontradas.";
document.getElementById("north-toggle").textContent="Expandir todas";
}
input.addEventListener("input",filter);group.addEventListener("change",filter);order.addEventListener("change",filter);
document.getElementById("north-toggle").addEventListener("click",function(){var ds=Array.from(root.querySelectorAll("details"));var open=ds.length&&ds.every(function(d){return d.open;});ds.forEach(function(d){d.open=!open;});this.textContent=open?"Expandir todas":"Recolher todas";});
var saved=null;
function openAll(){if(saved)return;saved=Array.from(root.querySelectorAll("details")).map(function(d){return [d,d.open];});saved.forEach(function(x){x[0].open=true;});}
function restore(){if(saved){saved.forEach(function(x){x[0].open=x[1];});saved=null;}}
window.addEventListener("beforeprint",openAll);window.addEventListener("afterprint",restore);
document.getElementById("north-print").addEventListener("click",function(){openAll();window.print();});
db.eventos.forEach(function(ev){var el=make("article","north-event-card");el.appendChild(make("h3",null,ev.titulo));el.appendChild(make("p",null,ev.texto));eventRoot.appendChild(el);});
filter();
document.getElementById("thor-shortcut").addEventListener("click",function(){input.value="";group.value="todos";order.value="original";filter();});
})();