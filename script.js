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
function getAnswer(text){
  const low=text.toLowerCase();
  const hit=answers.find(a=>a.keys.some(k=>low.includes(k)));
  return hit?hit.text:'Ask about Adnan’s AI projects, QMS, Deloitte experience, technical stack, education, or certifications and I’ll point you to the relevant part of the portfolio.';
}
function addMessage(role,text,extra=''){
  const p=document.createElement('p');
  p.className='chat-message '+role+(extra?' '+extra:'');
  const label=document.createElement('span');
  label.className='chat-label';
  label.textContent=role==='user'?'YOU':'AI';
  const body=document.createElement('span');
  body.className='chat-body';
  body.textContent=text;
  p.append(label,body);
  output.appendChild(p);
  output.scrollTop=output.scrollHeight;
  return p;
}
let chatBusy=false;
async function sendQuestion(text){
  const clean=text.trim();
  if(!clean||chatBusy)return;
  chatBusy=true;
  addMessage('user',clean);
  input.value='';
  input.disabled=true;
  const sendBtn=q('.command-form button');
  if(sendBtn){sendBtn.disabled=true;sendBtn.textContent='THINKING…'}
  const typing=addMessage('assistant','Thinking','typing');
  await new Promise(r=>setTimeout(r,520));
  typing.remove();
  addMessage('assistant',getAnswer(clean));
  input.disabled=false;
  if(sendBtn){sendBtn.disabled=false;sendBtn.textContent='SEND ↗'}
  chatBusy=false;
  input.focus();
}
q('.command-form')?.addEventListener('submit',e=>{
  e.preventDefault();
  sendQuestion(input.value);
});
qa('.command-suggestions button').forEach(b=>b.addEventListener('click',()=>{
  input.value=b.textContent;
  input.focus();
  input.setSelectionRange(input.value.length,input.value.length);
}));
input?.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){
    e.preventDefault();
    sendQuestion(input.value);
  }
});

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
function render3dLegacy(t){
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


// === CINEMATIC ENGINE V2 ===
const bars=q('.cinema-bars'), flash=q('.scene-flash'), leak=q('.light-leak');
setTimeout(()=>bars?.classList.add('active'),900);
setTimeout(()=>bars?.classList.remove('active'),2600);

// Scene-aware cinematic transitions
let activeScene=null;
const cinemaObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    if(activeScene!==e.target){
      activeScene=e.target;
      e.target.classList.add('scene-enter');
      flash?.classList.remove('fire'); void flash?.offsetWidth; flash?.classList.add('fire');
      const h=e.target.querySelector('h2,h1');
      h?.classList.add('chromatic'); setTimeout(()=>h?.classList.remove('chromatic'),260);
    }
  })
},{threshold:.52});
qa('.scene').forEach(s=>cinemaObserver.observe(s));

// Pointer spotlights
qa('.scene').forEach(s=>s.addEventListener('pointermove',e=>{const r=s.getBoundingClientRect();s.style.setProperty('--spot-x',((e.clientX-r.left)/r.width*100)+'%');s.style.setProperty('--spot-y',((e.clientY-r.top)/r.height*100)+'%')}));
qa('.interactive-card').forEach(card=>card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%')}));

// Scroll velocity drives typography and 3D camera
let lastY=scrollY,lastT=performance.now(),velocity=0,targetVelocity=0;
const velocityTargets=qa('.manifesto-text,.section-head h2,.project-info h3,.exp h3,.contact h2');
addEventListener('scroll',()=>{
  const now=performance.now(),dy=scrollY-lastY,dt=Math.max(16,now-lastT);
  targetVelocity=clamp(dy/dt,-2.4,2.4);lastY=scrollY;lastT=now;
},{passive:true});
function motionLoop(){
  velocity+=(targetVelocity-velocity)*.1;targetVelocity*=.92;
  const skew=clamp(velocity*2.2,-3.6,3.6),shift=clamp(velocity*5,-12,12);
  velocityTargets.forEach((el,i)=>{el.style.transform=`translate3d(0,${shift*(i%2?.25:.45)}px,0) skewY(${skew*(i%2?.3:.55)}deg)`});
  if(leak) leak.style.transform=`translate3d(${tx*70}px,${ty*45 + velocity*22}px,0) scale(${1+Math.abs(velocity)*.025})`;
  requestAnimationFrame(motionLoop);
}motionLoop();

// Cinematic camera pushes on project stages
const stages=qa('.project-stage,.lab-stage,.credential-art');
function stageParallax(){
  const vh=innerHeight;
  stages.forEach((el,i)=>{
    const r=el.getBoundingClientRect(),p=clamp((vh-r.top)/(vh+r.height),0,1);
    const scale=1.035 - Math.abs(.5-p)*.055;
    const y=(p-.5)*-28;
    el.style.transform=`translate3d(0,${y}px,0) scale(${scale})`;
  });
  requestAnimationFrame(stageParallax);
}
if(!reduce) stageParallax();

// Hero title depth / cursor parallax
const heroLines=qa('.hero h1 .line');
addEventListener('pointermove',()=>{
  if(innerWidth<1000)return;
  heroLines.forEach((line,i)=>{const depth=(i+1)*.9;line.style.transform=`translate3d(${tx*depth*7}px,${ty*depth*4}px,${depth*5}px)`});
},{passive:true});

// Enhance procedural human: ripple, scan, cinematic scene choreography
let humanTarget={x:1.9,y:.05,z:0,s:1,rx:0,ry:-.26};
function sceneHumanState(){
  const scenes=qa('.scene');let best=0,min=Infinity;
  scenes.forEach((s,i)=>{const r=s.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-innerHeight/2);if(d<min){min=d;best=i}});
  const states=[
    {x:1.9,y:.05,z:0,s:1,rx:0,ry:-.26},
    {x:2.45,y:.05,z:-.7,s:.88,rx:.03,ry:.35},
    {x:-2.2,y:.15,z:-1.0,s:.72,rx:-.03,ry:-.55},
    {x:2.7,y:.1,z:-1.6,s:.55,rx:.08,ry:.8},
    {x:-2.65,y:.2,z:-1.7,s:.5,rx:-.05,ry:-.75},
    {x:2.8,y:.15,z:-1.8,s:.48,rx:0,ry:.65},
    {x:-2.8,y:.1,z:-1.8,s:.44,rx:.04,ry:-.5},
    {x:1.9,y:.05,z:-.8,s:.85,rx:0,ry:.1}
  ];
  humanTarget=states[Math.min(best,states.length-1)];
}
addEventListener('scroll',sceneHumanState,{passive:true});sceneHumanState();

const originalRender=render3d;
render3d=function(t){
  if(renderer&&human){
    const time=t*.001;
    if(fluidUniforms){fluidUniforms.uTime.value=time;fluidUniforms.uMouse.value.set(tx+.5,ty+.5);fluidUniforms.uScroll.value=scrollY/Math.max(1,document.body.scrollHeight-innerHeight);}
    human.position.x+=(humanTarget.x-human.position.x)*.026;
    human.position.y+=(humanTarget.y-human.position.y)*.028;
    human.position.z+=(humanTarget.z-human.position.z)*.026;
    const sc=human.scale.x+(humanTarget.s-human.scale.x)*.025;human.scale.setScalar(sc);
    human.rotation.y+=(humanTarget.ry + tx*.32-human.rotation.y)*.034;
    human.rotation.x+=(humanTarget.rx - ty*.08-human.rotation.x)*.032;
    halo.rotation.z=time*.16;halo.rotation.y=Math.sin(time*.35)*.32;
    if(particles){
      particles.material.opacity=.74+Math.sin(time*1.2)*.12;
      particles.rotation.z=Math.sin(time*.35)*.012;
    }
    if(lines) lines.material.opacity=.055+Math.abs(Math.sin(time*.7))*.045;
    renderer.render(scene,camera);
  }
  requestAnimationFrame(render3d);
};

// Replace prior RAF loop visually by freezing its direct influence
// (the newer loop above owns cinematic camera choreography)


// === MASTER PROMPT MOTION / INTERACTION ===
if(window.gsap && window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
  // Keep native accessibility while adding cinematic interpolation.
  if(window.Lenis && !reduce){
    const lenis=new Lenis({duration:1.1,smoothWheel:true,wheelMultiplier:.9,touchMultiplier:1.05});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(t=>lenis.raf(t*1000));
    gsap.ticker.lagSmoothing(0);
  }
  gsap.utils.toArray('.film-screen,.cloud-stage,.packaging-world,.cert-coverflow').forEach((el,i)=>{
    gsap.fromTo(el,{clipPath:'inset(10% 8% 10% 8% round 28px)',scale:.94,filter:'blur(10px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',scale:1,filter:'blur(0px)',duration:1.4,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 82%',once:true}});
  });
  gsap.utils.toArray('.arch-node').forEach((n,i)=>gsap.fromTo(n,{opacity:0,scale:.65},{opacity:1,scale:1,duration:.8,delay:i*.08,ease:'back.out(1.7)',scrollTrigger:{trigger:'.cloud-stage',start:'top 74%',once:true}}));
  gsap.to('.film-title',{yPercent:-14,scrollTrigger:{trigger:'.film-screen',start:'top bottom',end:'bottom top',scrub:1}});
  gsap.to('.lux-pack.front',{rotateY:34,y:-24,scrollTrigger:{trigger:'.packaging-stage',start:'top 80%',end:'bottom 20%',scrub:1}});
  gsap.to('.lux-pack.back',{rotateY:-28,y:28,scrollTrigger:{trigger:'.packaging-stage',start:'top 80%',end:'bottom 20%',scrub:1}});
}

// Certification coverflow
const covers=qa('.cover-card'),counter=q('.cover-counter b');let coverIndex=0;
function renderCovers(){
  covers.forEach((card,i)=>{
    let d=i-coverIndex;
    if(d>covers.length/2)d-=covers.length;if(d<-covers.length/2)d+=covers.length;
    card.dataset.pos=Math.abs(d)>2?'far':String(d);
    card.classList.toggle('active',d===0);
  });
  if(counter)counter.textContent=String(coverIndex+1).padStart(2,'0');
}
function moveCover(dir){coverIndex=(coverIndex+dir+covers.length)%covers.length;renderCovers()}
q('.cover-nav.next')?.addEventListener('click',()=>moveCover(1));q('.cover-nav.prev')?.addEventListener('click',()=>moveCover(-1));
q('.cert-coverflow')?.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)<15)return;e.preventDefault();moveCover(e.deltaY>0?1:-1)},{passive:false});
let coverStart=0;q('.cert-coverflow')?.addEventListener('pointerdown',e=>coverStart=e.clientX);q('.cert-coverflow')?.addEventListener('pointerup',e=>{const d=e.clientX-coverStart;if(Math.abs(d)>45)moveCover(d<0?1:-1)});
renderCovers();

qa('.share-cert').forEach(btn=>btn.addEventListener('click',async e=>{
  const card=e.currentTarget.closest('.cover-card'),title=card?.dataset.shareTitle||'Mohammed Adnan A certification';
  const data={title, text:`${title} — Mohammed Adnan A`, url:location.href+'#credentials'};
  try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.text+' '+data.url);btn.textContent='COPIED ✓';setTimeout(()=>btn.textContent='SHARE ↗',1400)}}catch{}
}));

// Packaging flavor states
qa('.packaging-switch button').forEach(btn=>btn.addEventListener('click',()=>{
  qa('.packaging-switch button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const f=btn.dataset.pack,front=q('.lux-pack.front'),back=q('.lux-pack.back');
  const themes={
    biryani:['linear-gradient(150deg,#b62920,#47100d 50%,#102717 51%,#08140d)','BIRYANI<br>MASALA','PURE FLAVOUR · ENDLESS TASTE'],
    kebab:['linear-gradient(150deg,#7e1712,#2a0706 50%,#101010 51%,#030303)','CHICKEN<br>KEBAB','AUTHENTIC · BOLD · SMOKY'],
    green:['linear-gradient(150deg,#33633b,#102717 52%,#d1b56d 53%,#5d4616)','HERITAGE<br>BLEND','TRADITION · CRAFT · FLAVOUR']
  };
  const [bg,name,tag]=themes[f];front.style.background=bg;front.querySelector('b').innerHTML=name;front.querySelector('small').textContent=tag;
  if(window.gsap)gsap.fromTo(front,{rotateY:-70,scale:.82,opacity:.35},{rotateY:0,scale:1,opacity:1,duration:.75,ease:'power3.out'});
}));

// WebGL liquid light field behind the digital human
let fluidUniforms=null,fluidPlane=null;
if(scene && renderer){
  const vert=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
  const frag=`precision highp float;varying vec2 vUv;uniform float uTime;uniform vec2 uMouse;uniform float uScroll;
    float blob(vec2 p,vec2 c,float s){return s/(length(p-c)*8.0+0.35);}
    void main(){
      vec2 uv=vUv;vec2 p=uv-.5;p.x*=1.78;
      float t=uTime*.16;
      float n=sin((p.x+sin(p.y*5.0+t))*6.0+t)*.5+.5;
      n+=sin((p.y+cos(p.x*4.0-t))*7.0-t)*.35;
      float b=blob(p,vec2((uMouse.x-.5)*.8,(uMouse.y-.5)*-.45),.55);
      vec3 c1=vec3(.035,.025,.045),c2=vec3(.32,.08,.06),c3=vec3(.19,.12,.45);
      vec3 col=mix(c1,c2,smoothstep(.25,1.25,n+b*.35));
      col=mix(col,c3,smoothstep(.8,1.8,b+n*.45+uScroll*.3));
      float vign=smoothstep(.95,.22,length(p));
      gl_FragColor=vec4(col,vign*.32);
    }`;
  fluidUniforms={uTime:{value:0},uMouse:{value:new THREE.Vector2(.5,.5)},uScroll:{value:0}};
  fluidPlane=new THREE.Mesh(new THREE.PlaneGeometry(14,8),new THREE.ShaderMaterial({vertexShader:vert,fragmentShader:frag,uniforms:fluidUniforms,transparent:true,depthWrite:false,depthTest:false}));
  fluidPlane.position.z=-3.5;fluidPlane.renderOrder=-10;scene.add(fluidPlane);
}
