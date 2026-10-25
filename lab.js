(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>Array.from(c.querySelectorAll(s));
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
let mode=reduce?"lite":"cinematic";
function setMode(m){mode=m;document.body.dataset.mode=m;$("#mode-button").firstChild.textContent=m.toUpperCase()+" ";$("#mode-menu").hidden=true;}setMode(mode);
$("#mode-button").onclick=()=>$("#mode-menu").hidden=!$("#mode-menu").hidden;
$$("[data-mode]").filter(x=>x.tagName==="BUTTON").forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
const progress=$(".top-progress");function scrollUI(){let r=document.documentElement;progress.style.width=(r.scrollTop/(r.scrollHeight-r.clientHeight||1)*100)+"%";}
addEventListener("scroll",scrollUI,{passive:true});
addEventListener("pointermove",e=>{if(mode==="cinematic"){$(".pointer-glow").style.left=e.clientX+"px";$(".pointer-glow").style.top=e.clientY+"px";}},{passive:true});
$$("[data-jump]").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.jump)?.scrollIntoView({behavior:reduce?"instant":"smooth"}));

// Digital twin: procedurally rendered illustrative portrait, not a real likeness.
const canvas=$("#avatar-canvas"),ctx=canvas.getContext("2d");let avatarType="neural",ax=0,ay=0,frame=0,animating=false;
function drawAvatar(){if(!ctx)return;let w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
const cx=w*.51+ax*18,cy=h*.44+ay*10;
const glow=ctx.createRadialGradient(cx,cy,25,cx,cy,270);glow.addColorStop(0,"#ad81c037");glow.addColorStop(1,"#090b1200");ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
ctx.save();ctx.translate(cx,cy);
ctx.lineWidth=1;
let points=[];for(let i=0;i<=62;i++){let v=i/62*Math.PI;for(let j=0;j<92;j++){let u=j/92*Math.PI*2;let x=Math.sin(v)*Math.cos(u)*154;let y=Math.cos(v)*206;let z=Math.sin(v)*Math.sin(u)*125;if(y>90)x*=.85; if(y>140)x*=.8;if(z>0&&Math.abs(x)<45&&Math.abs(y)<48)z+=(1-Math.abs(x)/45)*28;points.push({x:x+z*.12+ax*10,y:y-z*.04,z});}}
for(let i=0;i<points.length;i++){let p=points[i];if(p.z< -38)continue;let depth=(p.z+150)/300;ctx.fillStyle=avatarType==="wire"?"#c0c0ef":avatarType==="particles"?"#fc8e83":depth>.6?"#f0d6ee":"#ad86cc";ctx.globalAlpha=.2+depth*.72;
if(avatarType==="wire"){if(i%92!==91){let n=points[i+1];if(n&&n.z>-38){ctx.strokeStyle="#ab88de";ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(n.x,n.y);ctx.stroke();}}}
else{let radius=avatarType==="particles"?1.1+depth*1.4:1.2;ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill();}
}
ctx.globalAlpha=1;let grad=ctx.createLinearGradient(-150,200,150,320);grad.addColorStop(0,"#ff665a35");grad.addColorStop(1,"#a98aff22");ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(0,240,226,112,0,Math.PI,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ff634e66";ctx.beginPath();ctx.ellipse(0,0,234,254,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
canvas.addEventListener("pointermove",e=>{if(mode==="lite")return;let r=canvas.getBoundingClientRect();ax=(e.clientX-r.left)/r.width-.5;ay=(e.clientY-r.top)/r.height-.5;drawAvatar();});
canvas.addEventListener("pointerleave",()=>{ax=0;ay=0;drawAvatar()});
$$("[data-avatar]").forEach(b=>b.addEventListener("click",()=>{avatarType=b.dataset.avatar;$$("[data-avatar]").forEach(x=>x.classList.toggle("selected",x===b));$("#avatar-status").textContent=avatarType.toUpperCase()+" / ACTIVE";drawAvatar();}));drawAvatar();

// Local assistant, with explicit send, and transparent scope.
const facts=[
{tags:["hire","fit","why","value"],answer:"Adnan combines practical data and operational discipline from Deloitte USI with hands-on AI, RAG, automation and full-stack product work. QMS is a concrete example of taking an idea through to a live user-facing product."},
{tags:["rag","retrieval","embedding","document"],answer:"Adnan's RAG pipeline focuses on document chunking, retrieval, contextual prompting and grounding generated answers in relevant source material. Explore the RAG Lab below to see a transparent local retrieval walkthrough."},
{tags:["qms","masala","spice","brand","packaging","commerce"],answer:"QMS is Qureshi Masala Spices, a live storefront featuring recipe-led product discovery, responsive UX, visual branding and evolving commerce/authentication flows. Visit qureshismasalaspices.com for the live product."},
{tags:["cert","oracle","claude","anthropic","credential"],answer:"Credentials include Claude Certified Architect — Professional, Agentic AI for Oracle AI Database Professional, OCI Generative AI Professional 2025, and OCI Data Science Professional 2025. Verified issuer links are in the Credentials Vault."},
{tags:["skill","tech","python","stack","react","sql","cloud"],answer:"His stack includes Python, SQL, JavaScript, React, Node.js, Express, MongoDB, Supabase, Power BI, Excel, RAG design, prompt engineering and cloud AI tools."},
{tags:["deloitte","experience","intern","career"],answer:"At Deloitte USI, Adnan has worked on data processing/validation, KPI reporting, dashboards and documentation with global teams. Earlier work includes AI and MERN stack internships."},
{tags:["email","contact","reach","recruit"],answer:"You can contact Adnan at mohammedadnan170204@gmail.com. The Recruiter Hub below has an at-a-glance view of his projects, experience and credentials."},
{tags:["education","mca","bca","college"],answer:"Adnan completed his BCA in 2025 at Presidency College, Bangalore, and is pursuing an MCA focused on Artificial Intelligence at Manipal Academy of Higher Education."}
];
function answer(q){let text=q.toLowerCase(),rank=facts.map(f=>({f,score:f.tags.reduce((n,t)=>n+(text.includes(t)?(t.length>4?2:1):0),0)})).sort((a,b)=>b.score-a.score);return rank[0].score?rank[0].f.answer:"I can answer from Adnan's published portfolio on his projects, skills, experience, credentials and education. Try asking about QMS, RAG or Deloitte. This guide uses local facts rather than a connected generative AI model."}
let busy=false;function bubble(str,who){let e=document.createElement("div");e.className="bubble "+who;e.textContent=str;$("#chat-feed").appendChild(e);$("#chat-feed").scrollTop=$("#chat-feed").scrollHeight;return e;}
$("#chat-form").onsubmit=async e=>{e.preventDefault();if(busy)return;let inp=$("#chat-input"),question=inp.value.trim();if(!question)return;busy=true;bubble(question,"user");inp.value="";let b=bubble("Thinking…","bot");await new Promise(r=>setTimeout(r,450));b.textContent=answer(question);busy=false;inp.focus()};
$$("[data-question]").forEach(b=>b.onclick=()=>{$("#chat-input").value=b.dataset.question;$("#chat-input").focus()});

// Retrieval demo: lexical sentence ranking with explicitly identified source.
const documents={
 qms:["QMS is a live ecommerce storefront for Qureshi Masala Spices.","Adnan worked on mobile-first brand presentation, product discovery, recipes and visual UI motion.","QMS includes work on customer flows, favorites, authentication and cart behavior."],
 deloitte:["Deloitte USI experience includes processing and validating data.","Adnan has worked on KPI reporting, Power BI and Excel dashboards and GenAI-assisted documentation.","The role includes quality review and cross-functional global delivery."],
 ml:["MLP face recognition experiments involved data preprocessing, feature representation and model evaluation.","GAN fashion-generation work explored deep-learning architectures and optimization.","The RAG project combines source text retrieval and grounded question answering."]
};
$("#rag-run").onclick=async()=>{let key=$("#rag-doc").value,text=$("#rag-question").value.toLowerCase();const steps=$$(".pipeline div");steps.forEach((s,i)=>s.classList.toggle("active",i===0));$("#rag-chunks").textContent="Retrieving…";$("#rag-answer").textContent="Evaluating context…";await new Promise(r=>setTimeout(r,250));steps[1].classList.add("active");
let words=text.split(/[^a-z0-9]+/).filter(x=>x.length>3),rank=documents[key].map((s,i)=>({s,i,score:words.reduce((a,w)=>a+(s.toLowerCase().includes(w)?1:0),0)})).sort((a,b)=>b.score-a.score||a.i-b.i);
steps[2].classList.add("active");$("#rag-chunks").replaceChildren(...rank.map((r,i)=>{let e=document.createElement("div");e.className="chunk";let t=document.createElement("small");t.textContent="SOURCE "+(r.i+1)+" / MATCH "+r.score;e.append(t,document.createTextNode(r.s));return e}));
await new Promise(r=>setTimeout(r,250));steps[3].classList.add("active");$("#rag-answer").textContent=rank.slice(0,2).map(r=>r.s+" [Source "+(r.i+1)+"]").join("\n\n");};$("#rag-run").click();

// Product controls
const flavors={biryani:["BIRYANI<br>MASALA","linear-gradient(150deg,#ab2927,#380e13 53%,#062817 54%,#081611)"],kebab:["CHICKEN<br>KEBAB","linear-gradient(150deg,#531013,#160b0c 53%,#ae2d24 54%,#3b0c0b)"],heritage:["HERITAGE<br>BLEND","linear-gradient(150deg,#4b792d,#0e301c 53%,#d0a954 54%,#52400f)"]};
$$("[data-flavor]").forEach(b=>b.onclick=()=>{let [name,bg]=flavors[b.dataset.flavor];$("#pouch-name").innerHTML=name;$(".pouch-front").style.background=bg;$$("[data-flavor]").forEach(x=>x.classList.toggle("selected",x===b));});
function angle(){const v=Number($("#product-angle").value);$("#pouch").style.transform="rotateY("+v+"deg) rotateX(4deg)";$("#angle-display").textContent=v+"°"}$("#product-angle").oninput=angle;angle();

// Certificates: native swipe + buttons + share
let track=$("#cert-track");$("#cert-left").onclick=()=>track.scrollBy({left:-Math.min(440,track.clientWidth),behavior:"smooth"});$("#cert-right").onclick=()=>track.scrollBy({left:Math.min(440,track.clientWidth),behavior:"smooth"});
$$(".cert-share").forEach(b=>b.onclick=async()=>{let card=b.closest(".cert"),title=card.dataset.cert,url=location.origin+location.pathname+"#certs";try{if(navigator.share)await navigator.share({title,text:title+" — Mohammed Adnan A",url});else{await navigator.clipboard.writeText(title+" "+url);b.textContent="COPIED ✓";setTimeout(()=>b.textContent="SHARE ↗",1500)}}catch{}});
const beats=[
{label:"01 / THE HOOK",visual:"THE PHONE\nRINGS AT 3:17.",script:"A silent room. The phone lights up. The caller ID displays a name that should be impossible.",board:"SHOT 01: Tight close-up of a phone vibrating in a blacked-out room. An unnatural, low-frequency ring."},
{label:"02 / THE BUILD",visual:"SOMEONE\nIS WATCHING.",script:"He answers. A familiar voice whispers: Do not turn around. The hallway light flickers.",board:"SHOT 02: Long hallway shot, slow push-in, flickering practical light, distorted audio."},
{label:"03 / THE TURN",visual:"IT'S HIS\nOWN VOICE.",script:"The voice on the line is his. It tells him exactly what will happen in ten seconds.",board:"SHOT 03: Extreme close-up. Sound drops out. The call timer starts counting backwards."},
{label:"04 / CLIFFHANGER",visual:"THEN HE\nSEES HIMSELF.",script:"In the dark reflection of the window stands another version of him. CUT TO BLACK. TO BE CONTINUED.",board:"SHOT 04: Reflection reveal with a whip-pan into absolute black. Final impact sound."}
];let beat=0,filmType="script";function film(){let d=beats[beat];$("#film-beat-number").textContent=d.label;$("#film-visual").textContent=d.visual;$("#film-text").textContent=d[filmType==="script"?"script":"board"];$$("[data-beat]").forEach(b=>b.classList.toggle("selected",Number(b.dataset.beat)===beat));$$("[data-film]").forEach(b=>b.classList.toggle("selected",b.dataset.film===filmType))}$$("[data-beat]").forEach(b=>b.onclick=()=>{beat=Number(b.dataset.beat);film()});$$("[data-film]").forEach(b=>b.onclick=()=>{filmType=b.dataset.film;film()});film();

// Keyboard-searchable command center
const entries=[["Experience Lab","#intro"],["Portfolio home","index.html"],["Digital Twin","#intro"],["Universe","#explore"],["AI assistant","#agent"],["RAG playground","#rag"],["QMS product studio","#product"],["Certifications","#certs"],["Film studio","#film"],["Career timeline","#timeline"],["Recruiter Hub","#recruiter"],["Contact","mailto:mohammedadnan170204@gmail.com"]];
const command=$("#command"),commandInput=$("#command-input"),results=$("#command-results");let activeResult=0;
function renderCmd(){const q=commandInput.value.toLowerCase();let found=entries.filter(e=>e[0].toLowerCase().includes(q));results.replaceChildren(...found.map((e,i)=>{let b=document.createElement("button");b.textContent=e[0]+" ↗";b.classList.toggle("active",i===activeResult);b.onclick=()=>{location.href=e[1];closeCmd()};return b}));}
function openCmd(){command.hidden=false;activeResult=0;commandInput.value="";renderCmd();commandInput.focus()}function closeCmd(){command.hidden=true;$("#cmd-button").focus()}$("#cmd-button").onclick=openCmd;$("#command-close").onclick=closeCmd;command.addEventListener("click",e=>{if(e.target===command)closeCmd()});commandInput.addEventListener("input",()=>{activeResult=0;renderCmd()});commandInput.addEventListener("keydown",e=>{const bs=$$("button",results);if(e.key==="ArrowDown"){e.preventDefault();activeResult=Math.min(bs.length-1,activeResult+1);renderCmd()}if(e.key==="ArrowUp"){e.preventDefault();activeResult=Math.max(0,activeResult-1);renderCmd()}if(e.key==="Enter"){e.preventDefault();bs[activeResult]?.click()}});addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openCmd()}if(e.key==="Escape"&&!command.hidden)closeCmd()});
})();