import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.querySelector('#three-canvas');
const section=document.querySelector('.scroll-3d');
if(canvas&&section){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;

  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x030406,.055);
  const camera=new THREE.PerspectiveCamera(38,1,.1,100);
  camera.position.set(0,0,9);

  const group=new THREE.Group();scene.add(group);
  const knot=new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.42,.43,180,28,2,3),
    new THREE.MeshPhysicalMaterial({color:0x9fd84c,metalness:.55,roughness:.18,clearcoat:1,clearcoatRoughness:.12,iridescence:.35,iridescenceIOR:1.35})
  );group.add(knot);

  const wire=new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.55,2),
    new THREE.MeshBasicMaterial({color:0x8ce9ff,wireframe:true,transparent:true,opacity:.09})
  );group.add(wire);

  const ringGroup=new THREE.Group();group.add(ringGroup);
  for(let i=0;i<3;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3.05+i*.34,.008,8,180),new THREE.MeshBasicMaterial({color:i===1?0xc8ff67:0xffffff,transparent:true,opacity:i===1?.25:.11}));
    ring.rotation.set(1.1+i*.25,.35+i*.7,i*.4);ringGroup.add(ring);
  }

  const pointsCount=900,positions=new Float32Array(pointsCount*3);
  for(let i=0;i<pointsCount;i++){const r=4+Math.random()*9,a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1);positions[i*3]=r*Math.sin(b)*Math.cos(a);positions[i*3+1]=r*Math.cos(b);positions[i*3+2]=r*Math.sin(b)*Math.sin(a)}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const stars=new THREE.Points(pg,new THREE.PointsMaterial({color:0xaeb7c5,size:.018,transparent:true,opacity:.48}));scene.add(stars);

  scene.add(new THREE.HemisphereLight(0xd9e7ff,0x081006,1.5));
  const key=new THREE.PointLight(0xc8ff67,45,15);key.position.set(3,3,5);scene.add(key);
  const rim=new THREE.PointLight(0x7c8cff,38,14);rim.position.set(-4,-1,2);scene.add(rim);

  const copies=[...document.querySelectorAll('.three-copy')],bar=document.querySelector('.three-progress i');
  let progress=0,target=0,mx=0,my=0,tmx=0,tmy=0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,x)=>{x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x)};
  function updateScroll(){const r=section.getBoundingClientRect(),range=section.offsetHeight-innerHeight;target=clamp(-r.top/Math.max(range,1),0,1)}
  addEventListener('scroll',updateScroll,{passive:true});updateScroll();
  addEventListener('pointermove',e=>{tmx=e.clientX/innerWidth-.5;tmy=e.clientY/innerHeight-.5},{passive:true});

  function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  addEventListener('resize',resize,{passive:true});resize();

  function copyOpacity(p,start,end){const fade=.09;return smooth(start,start+fade,p)*(1-smooth(end-fade,end,p))}
  let last=performance.now();
  function frame(now){
    const dt=Math.min((now-last)/1000,.05);last=now;
    progress+=((reduce?0:target)-progress)*(1-Math.pow(.001,dt));
    mx+=(tmx-mx)*.035;my+=(tmy-my)*.035;
    const p=reduce?0:progress;
    const angle=p*Math.PI*2.45;
    group.rotation.y=angle+mx*.18;group.rotation.x=.18+p*.75-my*.12;group.rotation.z=-p*.4;
    group.position.x=THREE.MathUtils.lerp(1.6,-1.45,smooth(.12,.82,p));
    group.position.y=Math.sin(p*Math.PI*2)*.38;
    const scale=1+Math.sin(p*Math.PI)*.32;group.scale.setScalar(scale);
    knot.rotation.x=now*.00012+p*2.4;knot.rotation.z=now*.00008-p*1.2;
    wire.rotation.y=-now*.00005-p*1.8;wire.rotation.x=p*.8;
    ringGroup.rotation.y=p*3.4;stars.rotation.y=now*.000006+p*.18;
    camera.position.z=9-1.6*Math.sin(p*Math.PI);camera.position.x=mx*.16;camera.position.y=-my*.12;camera.lookAt(0,0,0);
    key.position.x=3*Math.cos(p*Math.PI*2);key.position.y=3*Math.sin(p*Math.PI*1.5);
    const ranges=[[0,.38],[.29,.72],[.62,1.01]];
    copies.forEach((el,i)=>{const o=reduce?1:copyOpacity(p,...ranges[i]);el.style.opacity=o;el.style.transform='translateY('+(reduce?0:(-42+(1-o)*7))+'%) translateX('+((1-o)*-18)+'px)'});
    if(bar)bar.style.width=(p*100)+'%';
    renderer.render(scene,camera);requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
