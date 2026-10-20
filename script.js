"use strict";
const $=id=>document.getElementById(id),N=100;
const LS="brainiq100";let S={best:{},done:0,daily:{},snd:true,theme:""};
try{Object.assign(S,JSON.parse(localStorage.getItem(LS)||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}};
const TG=Array.from({length:N},(_,i)=>i+1);
function validateBoard(b){if(!Array.isArray(b)||b.length!==100)return false;const s=new Set();for(const n of b){if(!Number.isInteger(n)||n<1||n>100||s.has(n))return false;s.add(n)}return s.size===100}
function validateSlide(b){if(!Array.isArray(b)||b.length!==100)return false;const s=new Set();for(const n of b){if(!Number.isInteger(n)||n<0||n>99||s.has(n))return false;s.add(n)}return s.size===100}
const SLT=[...TG.slice(0,99),0];
const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const seedOf=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function fy(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function minSwaps(b){const seen=new Array(N).fill(false);let cyc=0;for(let i=0;i<N;i++){if(!seen[i]){cyc++;let j=i;while(!seen[j]){seen[j]=true;j=b[j]-1}}}return N-cyc}
const ND=(i,j)=>Math.abs((i/10|0)-(j/10|0))+Math.abs(i%10-j%10)===1;
const D={Easy:{sw:8,ad:20,sl:30,h:10},Medium:{sw:30,ad:80,sl:100,h:5},Hard:{sw:60,ad:200,sl:300,h:3},Expert:{sw:92,ad:420,sl:800,h:1}};
function gen(mode,diff,r,full){
 let b;
 if(mode==="swap"){
  if(full){do{b=fy(TG.slice(),r)}while(minSwaps(b)===0)}
  else{b=TG.slice();let k=0,t=D[diff].sw,g=0;while(k<t&&g++<20000){const i=Math.floor(r()*N),j=Math.floor(r()*N);if(i===j)continue;[b[i],b[j]]=[b[j],b[i]];if(minSwaps(b)===k+1)k++;else[b[i],b[j]]=[b[j],b[i]]}}
 }else if(mode==="adj"){
  b=TG.slice();const n=full?600:D[diff].ad;let last=-1;
  for(let k=0;k<n||b.every((v,i)=>v===i+1);k++){const i=Math.floor(r()*N),nb=[i-10,i+10,i-1,i+1].filter(j=>j>=0&&j<N&&ND(i,j));const j=nb[Math.floor(r()*nb.length)];[b[i],b[j]]=[b[j],b[i]]}
 }else{
  b=SLT.slice();let z=99,prev=-1;const n=full?900:D[diff].sl;
  for(let k=0;k<n;k++){const nb=[z-10,z+10,z-1,z+1].filter(j=>j>=0&&j<N&&ND(z,j)&&j!==prev);const j=nb[Math.floor(r()*nb.length)];b[z]=b[j];b[j]=0;prev=z;z=j}
 }
 return b}
const ok=b=>G.mode==="slide"?validateSlide(b):validateBoard(b);
let G={mode:"swap",diff:"Medium",board:[],hist:[],redo:[],sel:null,hints:0,used:0,act:0,t0:0,paused:false,done:false,daily:null,hc:[],assisted:false,full:false,seed:null};
const MN={swap:"Swap",adj:"Adjacent Swap",slide:"Sliding"};
function newGame(opts){
 Object.assign(G,{mode:$("mode").value,diff:$("diff").value,daily:null,full:false},opts||{});
 let b,r=G.daily?mulberry(seedOf("brainiq100-v1-"+G.daily+"-"+G.mode)):Math.random;
 for(let a=0;a<5;a++){b=gen(G.mode,G.diff,r,G.full);if(ok(b))break;b=null}
 if(!b){msg("Could not generate a valid puzzle. Please try again.");return false}
 G.start=b.slice();G.board=b.slice();reset();$("home").style.display="none";$("game").style.display="block";render();return true}
function reset(){clearInterval(G.tm);Object.assign(G,{hist:[],redo:[],sel:null,used:0,act:0,t0:performance.now(),paused:false,done:false,hc:[],assisted:false,auto:false});G.hints=D[G.diff].h;$("pov").style.display="none";$("pz").textContent="⏸ Pause";msg("")}
const tgt=()=>G.mode==="slide"?SLT:TG;
const elapsed=()=>G.done||G.paused?G.act:G.act+(performance.now()-G.t0);
function score(){const s=1000-5*G.hist.length-Math.floor(elapsed()/5000)-20*G.used;return Math.max(0,s)}
const key=()=>G.mode+"-"+G.diff;
function minMoves(){return G.mode==="swap"?minSwaps(G.board):null}
function render(){
 const bd=$("board"),T=tgt();bd.innerHTML="";
 const nbs=new Set();
 if(G.mode==="adj"&&G.sel!=null)[G.sel-10,G.sel+10,G.sel-1,G.sel+1].forEach(j=>{if(j>=0&&j<N&&ND(G.sel,j))nbs.add(j)});
 const z=G.board.indexOf(0);
 if(G.mode==="slide")[z-10,z+10,z-1,z+1].forEach(j=>{if(j>=0&&j<N&&ND(z,j))nbs.add(j)});
 G.board.forEach((v,i)=>{const c=document.createElement("button");c.className="c"+(v===T[i]&&v?" ok":"")+(G.sel===i?" sel":"")+(nbs.has(i)?" nb":"")+(G.hc.includes(i)?" hint":"")+(v===0?" blank":"");
  c.textContent=v||"";c.tabIndex=i===(G.fi||0)?0:-1;c.dataset.i=i;c.setAttribute("aria-label",v?"Row "+(i/10+1|0)+", column "+(i%10+1)+", number "+v+(v===T[i]?", correct":""):"Empty cell");c.onclick=()=>click(i);bd.appendChild(c)});
 $("tgt").innerHTML=T.map(v=>"<i>"+(v||"·")+"</i>").join("");
 stats();
 $("hd").textContent=G.diff+" · "+MN[G.mode]+(G.daily?" · Daily "+G.daily:"");
 $("undo").disabled=!G.hist.length||G.done;$("redo").disabled=!G.redo.length||G.done;
 $("sol").disabled=G.mode==="slide";$("sol").title=G.mode==="slide"?"No verified solver for sliding mode":"";
}
function correct(){const T=tgt();return G.board.filter((v,i)=>v&&v===T[i]).length}
function stats(){const c=correct(),tot=G.mode==="slide"?99:100;
 $("sT").textContent=fmt(elapsed());$("sM").textContent=G.hist.length;$("sS").textContent=score();$("sC").textContent=c;$("sR").textContent=tot-c;$("sH").textContent=Math.max(0,G.hints-G.used);
 $("sB").textContent=S.best[key()]??"–";
 const m=minMoves();$("sMin").textContent=m==null?(G.mode==="adj"?"not exact":"n/a"):m;
 $("status").textContent=G.done?"Solved! 🎉":G.sel!=null?"Tile selected. Choose another.":"Select a tile to begin."}
const fmt=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
function msg(t){$("msg").textContent=t}
function beep(f,d){if(!S.snd)return;try{const a=beep.a||(beep.a=new (window.AudioContext||window.webkitAudioContext)()),o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch(e){}}
function apply(a,b,rec){[G.board[a],G.board[b]]=[G.board[b],G.board[a]];if(rec){G.hist.push([a,b]);G.redo=[]}G.hc=[]}
function click(i){
 G.fi=i;if(G.paused||G.done||G.auto)return;
 if(G.mode==="slide"){const z=G.board.indexOf(0);if(i!==z&&ND(i,z)){apply(i,z,true);beep(520,.06);after()}else msg("Only tiles next to the blank can slide.");return}
 if(G.sel==null){G.sel=i;msg("");render();return}
 if(G.sel===i){G.sel=null;render();return}
 if(G.mode==="adj"&&!ND(G.sel,i)){msg("Adjacent mode: choose a neighbouring cell (no diagonals).");return}
 apply(G.sel,i,true);G.sel=null;beep(520,.06);msg("");after()}
function after(){if(!ok(G.board)){msg("Board validation failed. Restarting puzzle.");G.board=G.start.slice();reset()}
 render();const T=tgt();if(G.board.every((v,i)=>v===T[i]))win()}
function win(){G.act=elapsed();G.done=true;render();beep(880,.3);
 const base=score(),bonus=G.assisted?0:Math.floor(base/10),fin=G.assisted?0:base+bonus;let extra="";
 if(!G.assisted){S.done++;if(!(S.best[key()]>=fin))S.best[key()]=fin;
  if(G.daily){if(!S.daily[G.daily]){S.daily[G.daily]={moves:G.hist.length,score:fin,diff:G.diff};extra="<p>Daily challenge recorded.</p>"}else extra="<p>Daily challenge was already completed today — no repeat reward.</p>"}save()}
 const m=G.mode==="swap"?"<li>Minimum possible: "+minSwaps(G.start)+" swaps</li>":"";
 dlg("<h2>Puzzle solved!</h2><ul><li>Moves: "+G.hist.length+"</li><li>Time: "+fmt(G.act)+"</li><li>Hints used: "+G.used+"</li>"+m+"<li>"+(G.assisted?"Solution was viewed — no score recorded.":"Score: "+base+" + bonus "+bonus+" = <b>"+fin+"</b>")+"</li></ul>"+extra+"<button class='btn p' onclick=\"dlg.close()\">Close</button>")}
const dlg=h=>{const d=$("dlg");d.innerHTML=h;d.showModal()};
dlg.close=()=>$("dlg").close();$("dlg").addEventListener("close",()=>{if(G.hp){G.hp=false;if(G.paused)pause()}});
function undo(){if(!G.hist.length||G.done||G.paused||G.auto)return;const[a,b]=G.hist.pop();apply(a,b,false);G.redo.push([a,b]);G.sel=null;render()}
function redo(){if(!G.redo.length||G.done||G.paused||G.auto)return;const[a,b]=G.redo.pop();apply(a,b,false);G.hist.push([a,b]);G.sel=null;render();const T=tgt();if(G.board.every((v,i)=>v===T[i]))win()}
function pairs(b){b=b.slice();const out=[];
 if(G.mode==="swap"){for(let i=0;i<N;i++)while(b[i]!==i+1){const j=b.indexOf(i+1);[b[i],b[j]]=[b[j],b[i]];out.push([i,j])}}
 else for(let v=1;v<=N;v++){const t=v-1;let p=b.indexOf(v);const mv=q=>{[b[p],b[q]]=[b[q],b[p]];out.push([p,q]);p=q};
  if(p===t)continue;
  if(((p/10)|0)===((t/10)|0)){while(p>t)mv(p-1)}
  else{const tc=t%10;while(p%10!==tc)mv(p%10>tc?p-1:p+1);while(p>t)mv(p-10)}}
 return out}
function hint(){if(G.paused||G.done||G.auto)return;if(G.used>=G.hints){msg("No hints left for this difficulty.");return}
 if(G.mode==="slide"){const z=G.board.indexOf(0),T=SLT,d=(i,j)=>Math.abs((i/10|0)-(j/10|0))+Math.abs(i%10-j%10);
  const pos=v=>T.indexOf(v);const c=[z-10,z+10,z-1,z+1].filter(j=>j>=0&&j<N&&ND(z,j)).find(j=>d(z,pos(G.board[j]))<d(j,pos(G.board[j])));
  G.hc=[c??[z-10,z+10,z-1,z+1].find(j=>j>=0&&j<N&&ND(z,j))];msg("Heuristic hint (moves a tile toward its home). Not guaranteed optimal.")}
 else{const p=pairs(G.board)[0];G.hc=p;msg(G.mode==="swap"?"Swap the outlined cells: it places a number home.":"Outlined cells start a valid route (not proven shortest).")}
 G.used++;render()}
function solution(){if(G.mode==="slide")return;const p=pairs(G.board);
 const note=G.mode==="swap"?"This is an <b>exact minimum</b> ("+p.length+" swaps), from cycle decomposition.":"This is a valid route of "+p.length+" adjacent swaps. <b>It is not proven optimal</b>; exact minimum is unavailable for grid-adjacent mode.";
 const lab=i=>"r"+((i/10|0)+1)+"c"+(i%10+1);
 dlg("<h2>Solution</h2><p>"+note+"</p><p class='mt'>Viewing it means this game will not be scored.</p><div class='sol card'>"+p.map((x,k)=>(k+1)+". "+lab(x[0])+" ↔ "+lab(x[1])).join("<br>")+"</div><div class='row'><button class='btn p' id='ap'>Auto-play it</button><button class='btn' onclick=\"dlg.close()\">Close</button></div>");
 G.assisted=true;$("ap").onclick=()=>{dlg.close();let k=0;G.auto=true;G.sel=null;clearInterval(G.tm);G.tm=setInterval(()=>{if(k>=p.length||G.done||!G.auto){clearInterval(G.tm);G.auto=false;return}apply(p[k][0],p[k][1],true);k++;render();if(k===p.length){G.auto=false;clearInterval(G.tm);win()}},40)}}
function pause(){if(G.done)return;if(!G.paused){G.act=elapsed();G.paused=true;$("pov").style.display="flex";$("pz").textContent="▶ Resume"}else{G.paused=false;G.t0=performance.now();$("pov").style.display="none";$("pz").textContent="⏸ Pause"}stats()}
function rules(cb){const m=$("mode").value,tx={swap:"Pick any two tiles to swap them. Each swap is one move. Goal: 1 to 100 in order, row by row. Minimum swaps are calculated exactly.",adj:"Swap two tiles that touch horizontally or vertically — no diagonals. Goal: 1 to 100 in order. Exact minimum is not computed; the solution shown is valid but not proven optimal.",slide:"Separate mode with its own rules: 99 numbered tiles (1–99) and one blank. The target is 1–99 in order with the blank in the bottom-right corner. Slide a tile next to the blank into it. Puzzles are generated by legal moves from the target, so they are always solvable."}[m];
 dlg("<h2>"+MN[m]+" rules</h2><p>"+tx+"</p><ul><li>Score: start at 1000, −5 per move, −1 per 5 s of active time, −20 per hint, never below 0, plus a 10% completion bonus.</li><li>Move counter = length of your current move path; undo lowers it.</li><li>Viewing the solution disables scoring for that game.</li><li>Keys: arrows move, Enter/Space selects, Esc cancels.</li></ul><div class='row'><button class='btn p' id='go'>Start</button><button class='btn' onclick=\"dlg.close()\">Cancel</button></div>");
 if(cb)$("go").onclick=()=>{dlg.close();cb()};else $("go").remove()}
let seen=false;
const start=o=>{if(!seen){rules(()=>{seen=true;newGame(o)})}else newGame(o)};
function homeSum(){const bs=Object.values(S.best);$("sum").textContent="Games completed: "+S.done+" · Best score: "+(bs.length?Math.max(...bs):"–")+" · Daily done: "+Object.keys(S.daily).length}
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
function daily(){const d=today(),df=["Easy","Medium","Hard","Expert"][seedOf(d)%4],done=S.daily[d];
 dlg("<h2>Daily Challenge</h2><p>Date: "+d+"<br>Mode: Swap · Difficulty: "+df+"<br>Status: "+(done?"Completed in "+done.moves+" moves (score "+done.score+")":"Not completed yet")+"</p><p class='mt'>Same puzzle for everyone on this version. Results stay on this device only.</p><div class='row'><button class='btn p' id='dg'>Play</button><button class='btn' onclick=\"dlg.close()\">Cancel</button></div>");
 $("dg").onclick=()=>{dlg.close();$("mode").value="swap";$("diff").value=df;start({mode:"swap",diff:df,daily:d})}}
function theme(){const dk=getComputedStyle(document.body).backgroundColor;const cur=S.theme||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");S.theme=cur==="dark"?"light":"dark";document.documentElement.dataset.theme=S.theme;save()}
function snd(){S.snd=!S.snd;$("snd").textContent="🔊 Sound: "+(S.snd?"on":"off");$("snd2").textContent=S.snd?"🔊":"🔇";save()}
$("play").onclick=()=>start();$("rand").onclick=()=>start({full:true});$("daily").onclick=daily;$("how").onclick=()=>rules();
$("help").onclick=()=>{if(!G.paused&&!G.done&&!G.auto){pause();G.hp=true}rules()};$("snd").onclick=$("snd2").onclick=snd;$("thm").onclick=$("thm2").onclick=theme;
$("home2").onclick=()=>{$("game").style.display="none";$("home").style.display="block";homeSum()};
$("undo").onclick=undo;$("redo").onclick=redo;$("hint").onclick=hint;$("pz").onclick=pause;$("sol").onclick=solution;
$("rs").onclick=()=>{G.board=G.start.slice();reset();render()};
$("np").onclick=()=>{if(G.daily){G.daily=null}newGame()};
$("board").addEventListener("keydown",e=>{const c=document.activeElement,i=+c.dataset.i;const m={ArrowRight:1,ArrowLeft:-1,ArrowDown:10,ArrowUp:-10}[e.key];
 if(m!==undefined){e.preventDefault();let j=i+m;if((m===1&&i%10===9)||(m===-1&&i%10===0)||j<0||j>=N)return;G.fi=j;$("board").children[i].tabIndex=-1;const t=$("board").children[j];t.tabIndex=0;t.focus()}
 else if(e.key==="Escape"){G.sel=null;render();$("board").children[G.fi||0].focus()}
 else if(e.key==="Enter"||e.key===" "){e.preventDefault();click(i);$("board").children[i].focus()}});
setInterval(()=>{if($("game").style.display==="block"&&!G.done&&!G.paused){$("sT").textContent=fmt(elapsed());$("sS").textContent=score()}},250);
if(S.theme)document.documentElement.dataset.theme=S.theme;
snd();snd();homeSum();
// self-test
console.assert(validateBoard(TG)&&!validateBoard(TG.slice(1))&&!validateBoard(TG.map((v,i)=>i?v:2)),"validation self-test");
