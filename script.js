const q=(s,c=document)=>c.querySelector(s),qa=(s,c=document)=>[...c.querySelectorAll(s)];
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
qa('.reveal').forEach(el=>observer.observe(el));
const glow=q('.cursor-glow');window.addEventListener('pointermove',e=>{if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'}});
qa('.tilt').forEach(card=>{card.addEventListener('pointermove',e=>{if(innerWidth<900)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${-y*4}deg) rotateY(${x*5}deg) translateY(-2px)`});card.addEventListener('pointerleave',()=>card.style.transform='')});
const menu=q('.menu'),links=q('.nav-links');menu?.addEventListener('click',()=>links.classList.toggle('open'));qa('.nav-links a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));
const stage=q('.hero-stage');window.addEventListener('pointermove',e=>{if(!stage||innerWidth<900)return;const x=(e.clientX/innerWidth-.5)*8,y=(e.clientY/innerHeight-.5)*-8;stage.style.transform=`rotateY(${x}deg) rotateX(${y}deg)`});

// Navigation state and subtle scroll progress
const nav=q('.nav');const setNav=()=>nav?.classList.toggle('scrolled',scrollY>40);addEventListener('scroll',setNav,{passive:true});setNav();
qa('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const id=a.getAttribute('href');if(id&&id.length>1)q(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}));

// Cinematic ambient motion: slow, pointer-responsive and intentionally restrained.
const world=q('.world-bg'),sculpture=q('.sculpture');let tx=0,ty=0,cx=0,cy=0;
addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5);ty=(e.clientY/innerHeight-.5)});
(function ambient(){cx+=(tx-cx)*.035;cy+=(ty-cy)*.035;if(sculpture&&innerWidth>900)sculpture.style.transform=`rotateY(${cx*8}deg) rotateX(${-cy*6}deg) translate3d(${cx*8}px,${cy*8}px,0)`;if(world)world.style.transform=`translate3d(${cx*-10}px,${cy*-8}px,0) scale(1.03)`;requestAnimationFrame(ambient)})();
// Reveal elements receive a subtle stagger without slowing navigation.
qa('.project,.cert,.achievement-grid article').forEach((el,i)=>el.style.transitionDelay=((i%4)*70)+'ms');

const progress=q('.scroll-progress');
const paintProgress=()=>{if(!progress)return;const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%'};
addEventListener('scroll',paintProgress,{passive:true});paintProgress();
qa('.hero h1 .hero-line,.hero h1 em').forEach((el,i)=>{el.animate([{opacity:0,transform:'translateY(34px)',filter:'blur(8px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:900,delay:180+i*110,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'})});
