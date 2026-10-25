const P='step:profil',S='step:seances';let prof=ld(P,null),ses=ld(S,[]),tab='s';
const sv=()=>{localStorage[P]=JSON.stringify(prof);localStorage[S]=JSON.stringify(ses)};
const today=()=>new Date().toISOString().slice(0,10);
function show(t){tab=t;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==t));$('#app').innerHTML=(!prof||t=='p')?vProfil():t=='s'?vSeance():vCarnet();bind()}
const vProfil=()=>`<form class="card" id="fp"><h2>Mon identité</h2><small>Ces informations identifient ton fichier pour ton professeur. Elles restent sur ton appareil.</small>
<label>NOM<input id="nom" required autocomplete="family-name" value="${esc(prof?.nom)}"></label><label>Prénom<input id="prenom" required autocomplete="given-name" value="${esc(prof?.prenom)}"></label>
<label>Classe<input id="classe" required placeholder="ex : 1MELEC1" value="${esc(prof?.classe)}"></label><button>Enregistrer</button></form>`;
function vSeance(){const l=ses[0]||{};return`<form class="card" id="fs"><h2>Nouvelle séance</h2>
<label>Date<input type="date" id="date" required value="${today()}"></label>
<label>Forme en début de séance : <span id="vfd">Moyenne</span><input type="range" id="fd" min="1" max="5" value="3"></label>
<label>Objectif d'entraînement<select id="obj" required><option value="">Choisir…</option>${Object.entries(OBJ).map(([k,v])=>`<option value="${k}" ${l.obj==k?'selected':''}>${v}</option>`).join('')}</select></label>
<h2 style="margin-top:18px">Mes paramètres</h2><div class="g"><label>Sexe<select id="sexe" required><option value="">…</option><option value="M" ${l.sexe=='M'?'selected':''}>Masculin</option><option value="F" ${l.sexe=='F'?'selected':''}>Féminin</option></select></label>
<label>Âge<input type="number" id="age" min="10" max="80" required value="${l.age||''}"></label><label>FC repos (bpm)<input type="number" id="fcRepos" min="40" max="100" required value="${l.fcRepos||''}"></label></div>
<label>Intensité visée : <span id="vint">${l.int||80}</span> %<input type="range" id="int" min="60" max="100" step="10" value="${l.int||80}"></label>
<small>Karvonen : FCE = FC repos + (FC max − FC repos) × intensité</small>
<h2 style="margin-top:18px">FC à l'effort (bpm)</h2><div class="g">${[1,2,3,4,5].map(i=>`<label>FCE ${i}<input type="number" id="fce${i}" min="0" max="220" inputmode="numeric"></label>`).join('')}</div>
<div class="res" id="res" aria-live="polite"></div>
<label>Ressentis après la séance<textarea id="res2" rows="3" required></textarea></label>
<label>Forme en fin de séance : <span id="vff">Moyenne</span><input type="range" id="ff" min="1" max="5" value="3"></label><button>Enregistrer la séance</button></form>`}
function vCarnet(){const L=ses.slice(0,10).reverse(),ok=ses.filter(s=>calc(s).v=='validé').length;
return`<div class="card"><h2>Mon carnet</h2><div class="s"><div><b>${ses.length}</b>séances</div><div><b>${ses.length?Math.round(ok/ses.length*100):0}%</b>validées</div><div><b>${calc(ses[0]||{}).m||'–'}</b>dernière FC moy.</div></div></div>
${L.length?`<div class="card"><h2>FC moyenne par séance <small>(tirets = FCE visée)</small></h2><div class="bars">${L.map(s=>{const c=calc(s);return`<div style="height:${Math.min(100,c.m/220*100)}%;${c.v=='validé'?'background:var(--mint)':''}"><b>${c.m}</b>${c.t?`<i style="bottom:${c.t/c.m*100}%"></i>`:''}</div>`}).join('')}</div></div>`:''}
<div class="card"><h2>Historique</h2>${ses.map((s,i)=>{const c=calc(s);return`<p style="padding:8px 0;border-bottom:1px solid var(--line)"><b>${new Date(s.date).toLocaleDateString('fr-FR')}</b> · ${OBJ[s.obj]} · ${c.m} bpm <span class="pill ${vc(c.v)}">${c.v}</span> <button class="del" data-d="${i}" aria-label="Supprimer">✕</button><br><small>${esc(s.res)}</small></p>`}).join('')||'<small>Aucune séance.</small>'}</div>
<div class="card"><button id="ex" ${ses.length?'':'disabled'}>Exporter mon fichier .csv</button> <button class="alt" id="mp">Modifier mon identité</button> <button class="alt" id="rz">Tout effacer</button><p><small>Envoie le fichier .csv à ton professeur.</small></p></div>`}
function bind(){const q=id=>$('#'+id);
if(q('fp'))q('fp').onsubmit=e=>{e.preventDefault();const n=x=>q(x).value.trim();prof={nom:n('nom').toUpperCase(),prenom:n('prenom'),classe:n('classe').toUpperCase()};sv();show('s')};
if(q('fs')){const u=()=>{q('vfd').textContent=q('fd').value+' – '+FORME[q('fd').value];q('vff').textContent=q('ff').value+' – '+FORME[q('ff').value];q('vint').textContent=q('int').value;
const s=get(),c=calc(s);q('res').innerHTML=`FC max : <b>${c.mx||'–'}</b> · FCE visée : <b>${c.t||'–'}</b> · FC moyenne : <b>${c.m||'–'}</b> bpm<br><span class="pill ${vc(c.v)}">${c.v}</span>`};
const get=()=>({...prof,date:q('date').value,fd:q('fd').value,obj:q('obj').value,sexe:q('sexe').value,age:q('age').value,fcRepos:q('fcRepos').value,int:q('int').value,
fce1:q('fce1').value,fce2:q('fce2').value,fce3:q('fce3').value,fce4:q('fce4').value,fce5:q('fce5').value,res:q('res2').value.trim(),ff:q('ff').value});
q('fs').oninput=u;u();q('fs').onsubmit=e=>{e.preventDefault();if(!get().fce1&&!get().fce2&&!get().fce3){toast('Saisis au moins une FCE');return}ses.unshift(get());sv();toast('Séance enregistrée ✔');show('c')}}
document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{if(confirm('Supprimer cette séance ?')){ses.splice(+b.dataset.d,1);sv();show('c')}});
if(q('ex'))q('ex').onclick=async()=>{const txt=csvOut([HEAD,...ses.map(rowOf)]),n=`Step_${prof.nom}_${prof.prenom}_${prof.classe}.csv`.replace(/\s+/g,'-'),f=new File([txt],n,{type:'text/csv'});
if(navigator.canShare?.({files:[f]})){try{await navigator.share({files:[f],title:n});return}catch(e){if(e.name=='AbortError')return}}dl(n,txt)};
if(q('mp'))q('mp').onclick=()=>show('p');
if(q('rz'))q('rz').onclick=()=>{if(confirm('Effacer toutes tes séances et ton identité de cet appareil ?')){ses=[];prof=null;localStorage.removeItem(P);localStorage.removeItem(S);show('s')}}}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.t));show('s');
