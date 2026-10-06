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
