import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const q=(s,c=document)=>c.querySelector(s), qa=(s,c=document)=>[...c.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.min(Math.max(n,a),b);

// Boot
const boot=q('.boot'),bootNum=q('.boot-copy b'),bootBar=q('.boot-line i');
let pct=0;const bootTimer=setInterval(()=>{pct=Math.min(100,pct+Math.ceil(Math.random()*14));bootNum.textContent=String(pct).padStart(2,'0');bootBar.style.width=pct+'%';if(pct>=100){clearInterval(bootTimer);setTimeout(()=>boot.classList.add('done'),250)}},90);

// Cursor + magnetic
const cursor=q('.cursor');let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY});
function cursorLoop(){cx+=(mx-cx)*.18;cy+=(my-cy)*.18;if(cursor)cursor.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;requestAnimationFrame(cursorLoop)}cursorLoop();
qa('[data-cursor],a,button').forEach(el=>{el.addEventListener('mouseenter',()=>{cursor?.classList.add('active');const label=el.dataset.cursor||'OPEN';const span=cursor?.querySelector('span');if(span)span.textContent=label});el.addEventListener('mouseleave',()=>cursor?.classList.remove('active'))});
qa('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(innerWidth<1000)return;const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.18,y=(e.clientY-r.top-r.height/2)*.18;el.style.transform=`translate(${x}px,${y}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});

// Reveal / sections
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
qa('.reveal').forEach(el=>observer.observe(el));
const sceneObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const scenes=qa('.scene'),idx=scenes.indexOf(e.target);q('.rail>span').textContent=String(idx+1).padStart(2,'0');q('.rail>b').textContent=e.target.dataset.scene||'SECTION';q('.rail-line i').style.height=`${((idx+1)/scenes.length)*100}%`}}),{threshold:.45});
qa('.scene').forEach(s=>sceneObserver.observe(s));
addEventListener('scroll',()=>{const d=document.documentElement,progress=d.scrollTop/(d.scrollHeight-d.clientHeight);q('.progress i').style.height=(progress*100)+'%';q('.nav').classList.toggle('scrolled',scrollY>30)},{passive:true});

// Menu
q('.menu')?.addEventListener('click',()=>{const n=q('.nav-links');n.style.display=n.style.display==='flex'?'none':'flex';if(n.style.display==='flex'){Object.assign(n.style,{position:'absolute',top:'74px',left:'0',right:'0',padding:'28px 5vw',background:'#080808f2',backdropFilter:'blur(18px)',flexDirection:'column',alignItems:'flex-start',borderBottom:'1px solid #ffffff18'})}});

// Ask portfolio modal
const command=q('.command'),output=q('.command-output'),input=q('.command-form input');
function openCommand(){command.classList.add('open');command.setAttribute('aria-hidden','false');setTimeout(()=>input?.focus(),80)}
function closeCommand(){command.classList.remove('open');command.setAttribute('aria-hidden','true')}
qa('.command-open').forEach(b=>b.addEventListener('click',openCommand));q('.command-close')?.addEventListener('click',closeCommand);q('.command-backdrop')?.addEventListener('click',closeCommand);
addEventListener('keydown',e=>{if(e.key==='Escape')closeCommand();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand()}});
const answers=[
  {keys:['hire','why'],text:'Adnan combines operational discipline from Deloitte with hands-on AI, data and full-stack building. He can work from messy data or a vague product problem through to a usable interface, and he communicates the system clearly.'},
  {keys:['qms','masala','spice'],text:'QMS — Qureshi Masala Spices — is a live commerce project Adnan designed and developed end-to-end, including product discovery, recipe-led storytelling, responsive UX, motion, authentication work and ongoing storefront improvements.'},
  {keys:['rag','ai project','projects'],text:'His AI work includes a retrieval-augmented generation pipeline, an AI-assisted documentation workflow, MLP face-recognition work, a GAN fashion generator and other applied ML experiments.'},
  {keys:['cert','oracle','anthropic'],text:'His flagship credentials are Claude Certified Architect — Professional from Anthropic, Agentic AI for Oracle AI Database Certified Professional, OCI 2025 Certified Generative AI Professional and OCI 2025 Certified Data Science Professional.'},
  {keys:['deloitte','experience'],text:'At Deloitte USI he supports Talent and U.S. Payroll operations using Python-based processing and validation, KPI reporting, Power BI and Excel, GenAI-assisted documentation and cross-functional delivery. He has received 10 consecutive Stacks recognitions.'},
  {keys:['skill','stack','technology'],text:'Core stack: Python, SQL, JavaScript, React, Node.js, Express, MongoDB, Supabase, Power BI, Tableau, Excel, Git/GitHub, RAG architecture, prompt engineering and cloud AI platforms.'}
];
function respond(text){const low=text.toLowerCase();const hit=answers.find(a=>a.keys.some(k=>low.includes(k)));const msg=hit?hit.text:'Ask about Adnan’s AI projects, QMS, Deloitte experience, technical stack or certifications and I’ll point you to the relevant part of the portfolio.';output.innerHTML+=`<p><span>YOU:</span> ${text.replace(/</g,'&lt;')}</p><p><b>AI:</b> ${msg}</p>`;output.scrollTop=output.scrollHeight}
q('.command-form')?.addEventListener('submit',e=>{e.preventDefault();const v=input.value.trim();if(!v)return;respond(v);input.value=''});
qa('.command-suggestions button').forEach(b=>b.addEventListener('click',()=>respond(b.textContent)));

// Three.js procedural digital human
const canvas=q('#world');
let renderer,scene,camera,human,particles,lines,shoulders,halo;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:devicePixelRatio<2});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,100);camera.position.set(0,0,6.3);
  human=new THREE.Group();scene.add(human);

  const pos=[],cols=[];const c1=new THREE.Color('#ff665a'),c2=new THREE.Color('#a98aff'),c3=new THREE.Color('#eee7dd');
  const segY=75,segX=110;
  for(let iy=0;iy<=segY;iy++){
    const v=iy/segY,phi=v*Math.PI;
    for(let ix=0;ix<segX;ix++){
      const u=ix/segX,theta=u*Math.PI*2;
      let x=.93*Math.sin(phi)*Math.cos(theta),y=1.18*Math.cos(phi),z=.82*Math.sin(phi)*Math.sin(theta);
      const front=Math.max(0,z);
      const nose=Math.exp(-(x*x/0.045+(y-.05)*(y-.05)/.08))*front*.32;
      z+=nose;
      if(y<-.45){const jaw=clamp((y+1.18)/.73,0,1);x*=.72+.28*jaw}
      if(y>.72)x*=.9;
      x+=Math.sin(y*4.2)*.018;
      pos.push(x,y,z);
      const mix=(y+1.2)/2.4;const col=mix>.55?c3.clone().lerp(c2,(mix-.55)*1.4):c1.clone().lerp(c2,mix*1.1);
      cols.push(col.r,col.g,col.b);
    }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  particles=new THREE.Points(geo,new THREE.PointsMaterial({size:.014,vertexColors:true,transparent:true,opacity:.88,blending:THREE.AdditiveBlending,depthWrite:false}));
  human.add(particles);

  const linePts=[];
  for(let iy=0;iy<=segY;iy+=5){for(let ix=0;ix<segX;ix+=4){const a=(iy*segX+ix)*3,b=(iy*segX+((ix+4)%segX))*3;linePts.push(pos[a],pos[a+1],pos[a+2],pos[b],pos[b+1],pos[b+2])}}
  const lgeo=new THREE.BufferGeometry();lgeo.setAttribute('position',new THREE.Float32BufferAttribute(linePts,3));
  lines=new THREE.LineSegments(lgeo,new THREE.LineBasicMaterial({color:0xbca7ff,transparent:true,opacity:.08,blending:THREE.AdditiveBlending}));human.add(lines);

  const shPos=[];for(let i=0;i<3200;i++){const a=Math.random()*Math.PI*2,r=Math.pow(Math.random(),.45);let x=Math.cos(a)*r*1.75,y=-1.15-Math.random()*.9,z=Math.sin(a)*r*.6;if(Math.abs(x)<.5)y+=.25*(1-Math.abs(x)/.5);shPos.push(x,y,z)}
  const sgeo=new THREE.BufferGeometry();sgeo.setAttribute('position',new THREE.Float32BufferAttribute(shPos,3));shoulders=new THREE.Points(sgeo,new THREE.PointsMaterial({color:0x8a725f,size:.012,transparent:true,opacity:.32,depthWrite:false}));human.add(shoulders);

  halo=new THREE.Mesh(new THREE.TorusGeometry(1.62,.008,8,180),new THREE.MeshBasicMaterial({color:0xff4b3e,transparent:true,opacity:.23}));halo.rotation.x=1.18;human.add(halo);
  human.position.set(1.9,.05,0);human.rotation.y=-.26;

  const starGeo=new THREE.BufferGeometry(),starPos=[];for(let i=0;i<800;i++)starPos.push((Math.random()-.5)*14,(Math.random()-.5)*9,(Math.random()-.5)*8-1);
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:.008,transparent:true,opacity:.18})));
}catch(err){console.warn('3D fallback active',err)}

let tx=0,ty=0;addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5);ty=(e.clientY/innerHeight-.5)});
function render3d(t){
  if(renderer&&human){
    const time=t*.001;const scroll=scrollY/Math.max(1,document.body.scrollHeight-innerHeight);
    human.rotation.y+=((-.22+tx*.38)-human.rotation.y)*.045;human.rotation.x+=((-ty*.11)-human.rotation.x)*.04;
    human.position.y=Math.sin(time*.65)*.035 + scroll*.25;
    halo.rotation.z=time*.12;halo.rotation.y=Math.sin(time*.25)*.25;
    particles.material.opacity=.84+Math.sin(time*.8)*.06;
    renderer.render(scene,camera);
  }requestAnimationFrame(render3d)
}requestAnimationFrame(render3d);
addEventListener('resize',()=>{if(renderer&&camera){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);human.position.x=innerWidth<900?.7:1.9;human.scale.setScalar(innerWidth<640?.72:1)}});

// Subtle card depth
qa('.interactive-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(innerWidth<1000)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1200px) rotateX(${-y*1.5}deg) rotateY(${x*1.8}deg)`});card.addEventListener('pointerleave',()=>card.style.transform='')});
