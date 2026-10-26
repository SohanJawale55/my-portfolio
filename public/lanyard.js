window.initLanyard=function(host,FRONT0){
if(!host||!window.THREE)return;
let dead=false;const T=THREE,RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const FRONT_URL=FRONT0||null,CARD='#F3F3F0',STRAP=(getComputedStyle(document.documentElement).getPropertyValue('--primary')||'').trim()||'#7C3AED';
let R;try{R=new T.WebGLRenderer({antialias:true,alpha:true})}catch(e){return}
R.setClearColor(0,0);R.outputColorSpace=T.SRGBColorSpace;R.toneMapping=T.NeutralToneMapping||T.ACESFilmicToneMapping;R.toneMappingExposure=T.NeutralToneMapping?1:1.15;
const cv=R.domElement;cv.style.cssText='display:block;position:absolute;top:0;left:0;width:100%;height:100%;touch-action:pan-y';
host.appendChild(cv);const fb=host.querySelector('.box');if(fb)fb.style.display='none';
const sc=new T.Scene(),cam=new T.PerspectiveCamera(24,1,.1,200);
const es=new T.Scene();es.background=new T.Color(.035,.035,.04);const pg=new T.PlaneGeometry(1,1);
[[2.6,[0,4.5,8],[9,4],0],[6,[-5.5,.5,7],[.9,14],0],[4,[5,-.5,8],[.6,14],0],[3.5,[0,-1,9],[24,.35],Math.PI/3],[1.4,[0,6,-6],[12,4],0],[.5,[0,-7,1],[16,6],0]].forEach(([i,p,s,r])=>{const m=new T.Mesh(pg,new T.MeshBasicMaterial({color:new T.Color(i,i,i),side:T.DoubleSide}));m.position.set(...p);m.scale.set(s[0],s[1],1);m.lookAt(0,0,0);m.rotateZ(r);es.add(m)});
const pm=new T.PMREMGenerator(R);sc.environment=pm.fromScene(es,.035).texture;pm.dispose();
const kl=new T.DirectionalLight(0xffffff,1.6);kl.position.set(-2.5,4,6);sc.add(kl);
const W=1.6,H=2.25,TH=.018,BV=.007,HO=H/2+.04,D=2.3;
const rr=(p,x,y,w,h,r)=>{const k=r*.4477;p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.bezierCurveTo(x+w-k,y,x+w,y+k,x+w,y+r);p.lineTo(x+w,y+h-r);p.bezierCurveTo(x+w,y+h-k,x+w-k,y+h,x+w-r,y+h);p.lineTo(x+r,y+h);p.bezierCurveTo(x+k,y+h,x,y+h-k,x,y+h-r);p.lineTo(x,y+r);p.bezierCurveTo(x,y+k,x+k,y,x+r,y)};
const o=new T.Shape();rr(o,-W/2+BV,-H/2+BV,W-2*BV,H-2*BV,.2);
const hl=new T.Path();rr(hl,-.17-BV,H/2-.165-BV,.34+2*BV,.07+2*BV,.035+BV);o.holes.push(hl);
const K=2,MAXA=Math.min(16,R.capabilities.getMaxAnisotropy?R.capabilities.getMaxAnisotropy():4);
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w*K;c.height=h*K;const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=MAXA;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;const x=c.getContext('2d');x.scale(K,K);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';return{t,x}};
const F=mk(768,1080),B=mk(768,1080),S=mk(128,512);S.t.wrapT=T.RepeatWrapping;
let img=null;
function paint(){
let x=F.x;x.textRendering='geometricPrecision';x.fillStyle=CARD;x.fillRect(0,0,768,1080);
if(img){const s=Math.max(656/img.width,img.height>0?700/img.height:1),w=img.width*s,h=img.height*s;x.save();x.beginPath();x.rect(56,60,656,700);x.clip();x.drawImage(img,56+(656-w)/2,60,w,h);x.restore()}
else{x.fillStyle='#E1E3DE';x.fillRect(56,60,656,700);x.setLineDash([14,10]);x.strokeStyle='#8A8F98';x.lineWidth=3;x.strokeRect(58,62,652,696);x.setLineDash([]);x.fillStyle='#5C616B';x.font='500 30px Hanken Grotesk,Arial';x.textAlign='center';x.fillText('Your portrait here',384,410);x.textAlign='left'}
x.fillStyle='#121418';x.font='800 64px Bricolage Grotesque,Arial';x.fillText('Sohan Jawale',56,840);
x.fillStyle='#5C616B';x.font='400 28px Hanken Grotesk,Arial';x.fillText('UI/UX Designer & Frontend Developer',56,896);
x.fillStyle=STRAP;x.fillRect(56,940,100,6);
x=B.x;x.fillStyle='#121418';x.fillRect(0,0,768,1080);x.fillStyle=STRAP;x.fillRect(56,150,120,8);
x.fillStyle='#F3F3F0';x.font='800 78px Bricolage Grotesque,Arial';['Designing','digital','experiences.'].forEach((s,i)=>x.fillText(s,56,300+i*92));
x.fillStyle='#A99BFF';['Building them','into reality.'].forEach((s,i)=>x.fillText(s,56,640+i*92));
x.fillStyle='#9AA0AB';x.font='400 28px Hanken Grotesk,Arial';x.fillText('Sohan Prakash Jawale',56,960);
x=S.x;x.fillStyle=STRAP;x.fillRect(0,0,128,512);x.save();x.translate(64,256);x.rotate(Math.PI/2);x.fillStyle='rgba(255,255,255,.9)';x.font='800 52px Bricolage Grotesque,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('Sohan Jawale',0,0);x.restore();
F.t.needsUpdate=B.t.needsUpdate=S.t.needsUpdate=true}
paint();if(document.fonts)document.fonts.ready.then(paint);
if(FRONT_URL){const i=new Image();i.crossOrigin='anonymous';i.onload=()=>{img=i;paint()};i.src=FRONT_URL}
const bg=new T.ExtrudeGeometry(o,{depth:TH,bevelEnabled:true,bevelThickness:BV,bevelSize:BV,bevelSegments:4,curveSegments:20});bg.translate(0,0,-TH/2);
const fg=new T.ShapeGeometry(o,20),pa=fg.attributes.position,ua=fg.attributes.uv;for(let i=0;i<pa.count;i++)ua.setXY(i,(pa.getX(i)+W/2)/W,(pa.getY(i)+H/2)/H);
const face=t=>new T.MeshPhysicalMaterial({map:t,roughness:.42,clearcoat:1,clearcoatRoughness:.06});
const bodyM=new T.Mesh(bg,new T.MeshPhysicalMaterial({color:CARD,roughness:.35,clearcoat:1,clearcoatRoughness:.08}));
const frontM=new T.Mesh(fg,face(F.t)),backM=new T.Mesh(fg.clone(),face(B.t));
frontM.position.z=TH/2+BV+.0006;backM.rotation.y=Math.PI;backM.position.z=-(TH/2+BV+.0006);
const metal=new T.MeshStandardMaterial({color:'#d9dce2',metalness:1,roughness:.16});
const ring=new T.Mesh(new T.TorusGeometry(.095,.0135,16,48),metal);ring.position.y=H/2-.055;ring.rotation.y=Math.PI/2-.7;
const card=new T.Group();card.rotation.order='ZYX';card.add(bodyM,frontM,backM,ring);sc.add(card);
const cs=new T.Shape();rr(cs,-.15+.014,-.085+.014,.3-.028,.17-.028,.024);
const cg=new T.ExtrudeGeometry(cs,{depth:.02,bevelEnabled:true,bevelThickness:.014,bevelSize:.014,bevelSegments:4,curveSegments:8});cg.translate(0,0,-.01);
const clamp=new T.Group(),cm=new T.Mesh(cg,metal);cm.position.y=.117;
clamp.add(cm,new T.Mesh(new T.TorusGeometry(.036,.0105,12,32),metal));sc.add(clamp);
const SN=48,SW=.26,sg=new T.BufferGeometry(),sp=new Float32Array(SN*6),su=new Float32Array(SN*4),sn=new Float32Array(SN*6),si=[];
for(let i=0;i<SN;i++){sn[i*6+2]=1;sn[i*6+5]=1}
for(let i=0;i<SN-1;i++){const a=i*2;si.push(a,a+2,a+1,a+1,a+2,a+3)}
sg.setAttribute('position',new T.BufferAttribute(sp,3));sg.setAttribute('normal',new T.BufferAttribute(sn,3));sg.setAttribute('uv',new T.BufferAttribute(su,2));sg.setIndex(si);
const strap=new T.Mesh(sg,new T.MeshPhysicalMaterial({map:S.t,roughness:.68,side:T.DoubleSide}));strap.frustumCulled=false;sc.add(strap);
const N=6,px=new Float64Array(N),py=new Float64Array(N),ox=new Float64Array(N),oy=new Float64Array(N),iw=[0,1,1,1,.45,.3];
let ax=0,ay=0,rest=1,vh=1,ready=false,t=0,fa=0,fv=0,ft=0,gx=0,gy=0,grab=null;
function place(intro){for(let i=0;i<5;i++){px[i]=ax+(intro?rest*i:0);py[i]=intro?ay:ay-rest*i}px[5]=px[4]+(intro?D:0);py[5]=py[4]-(intro?0:D);for(let i=0;i<N;i++){ox[i]=px[i];oy[i]=py[i]}}
function size(){const w=host.clientWidth,h=host.clientHeight;if(w<2||h<2)return false;const mx=Math.round(w*.8),cw=w+2*mx;const mb=Math.round(h*.45),ch=h+mb;cv.style.left=-mx+'px';cv.style.width=cw+'px';cv.style.height=ch+'px';R.setPixelRatio(Math.min(Math.max(devicePixelRatio||1,1.5),2));R.setSize(cw,ch,false);const asp=w/h;vh=H/.6;if(vh*asp<W/.72)vh=W/.72/asp;const zc=vh/2/Math.tan(12*Math.PI/180),vh2=vh*ch/h,cy=-(vh2-vh)/2;cam.aspect=cw/ch;cam.fov=2*Math.atan(vh2/2/zc)*180/Math.PI;cam.position.set(0,cy,zc);cam.lookAt(0,cy,0);cam.updateProjectionMatrix();ax=0;ay=vh/2+.2;rest=(ay-(vh/2-vh*.27))/4;if(!ready){place(!RM);ready=true}return true}
const cons=[[0,1,0],[1,2,0],[2,3,0],[3,4,0],[4,5,1]];
function step(dt){const wx=RM?0:(Math.sin(t*.53)*.7+Math.sin(t*1.31+1.7)*.3)*2.5;
for(let i=1;i<N;i++){let vx=(px[i]-ox[i])*.997,vy=(py[i]-oy[i])*.997;const m=Math.hypot(vx,vy);if(m>.5){vx*=.5/m;vy*=.5/m}ox[i]=px[i];oy[i]=py[i];px[i]+=vx+wx*dt*dt;py[i]+=vy-30*dt*dt}
for(let k=0;k<8;k++){px[0]=ax;py[0]=ay;for(const[a,b,c]of cons){const L=c?D:rest,dx=px[b]-px[a],dy=py[b]-py[a],d=Math.hypot(dx,dy)||1e-6,f=(d-L)/d/(iw[a]+iw[b]);px[a]+=dx*f*iw[a];py[a]+=dy*f*iw[a];px[b]-=dx*f*iw[b];py[b]-=dy*f*iw[b]}if(grab){px[grab.i]=gx;py[grab.i]=gy}}}
function draw(dt){const dx=px[5]-px[4],dy=py[5]-py[4],d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
card.position.set(px[4]+ux*HO,py[4]+uy*HO,0);fv+=((ft-fa)*80-fv*5)*dt;fa+=fv*dt;card.rotation.set(0,fa,Math.atan2(ux,-uy));
const ex=px[3]-px[4],ey=py[3]-py[4],el=Math.hypot(ex,ey)||1;clamp.position.set(px[4],py[4],0);clamp.rotation.z=Math.atan2(-ex/el,ey/el);
const pts=[];for(let i=0;i<4;i++)pts.push(new T.Vector3(px[i],py[i],0));pts.push(new T.Vector3(px[4]+ex/el*.12,py[4]+ey/el*.12,0));
const cu=new T.CatmullRomCurve3(pts,false,'centripetal'),rep=cu.getLength()/(SW*4),p=new T.Vector3(),q=new T.Vector3();
for(let i=0;i<SN;i++){const u=i/(SN-1);cu.getPointAt(u,p);let tx,ty;if(u>.99){cu.getPointAt(u-.01,q);tx=p.x-q.x;ty=p.y-q.y}else{cu.getPointAt(Math.min(1,u+.01),q);tx=q.x-p.x;ty=q.y-p.y}const tl=Math.hypot(tx,ty)||1,nx=-ty/tl*SW/2,ny=tx/tl*SW/2;
sp.set([p.x+nx,p.y+ny,0,p.x-nx,p.y-ny,0],i*6);su.set([0,(1-u)*rep,1,(1-u)*rep],i*4)}
sg.attributes.position.needsUpdate=true;sg.attributes.uv.needsUpdate=true;R.render(sc,cam)}
let last=performance.now(),vis=true,acc=0;
function tick(n){if(dead)return;requestAnimationFrame(tick);if(!vis||!ready)return;const dt=Math.min(.033,(n-last)/1000);last=n;t+=dt;acc+=dt;while(acc>=1/120){step(1/120);acc-=1/120}draw(dt)}
new ResizeObserver(()=>{if(!dead&&size())draw(0)}).observe(host);
new IntersectionObserver(e=>{vis=e[0].isIntersecting;last=performance.now()}).observe(host);
requestAnimationFrame(tick);
const rc=new T.Raycaster(),pt=new T.Vector2();let press=null,hov=false;
const ray=e=>{const r=cv.getBoundingClientRect();pt.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);rc.setFromCamera(pt,cam)};
const pick=()=>{card.updateMatrixWorld(true);return rc.intersectObjects([bodyM,frontM,backM],false)[0]||null};
cv.addEventListener('pointerdown',e=>{if(e.button>0)return;ray(e);const h=pick();if(!h)return;const i=Math.hypot(h.point.x-px[4],h.point.y-py[4])<Math.hypot(h.point.x-px[5],h.point.y-py[5])?4:5;grab={i,reach:h.distance,ox:px[i]-h.point.x,oy:py[i]-h.point.y};gx=px[i];gy=py[i];press={x:e.clientX,y:e.clientY,t:performance.now()};cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';e.preventDefault()});
cv.addEventListener('pointermove',e=>{ray(e);if(grab){if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>6)press=null;const p=rc.ray.at(grab.reach,new T.Vector3());gx=p.x+grab.ox;gy=p.y+grab.oy;return}if(e.pointerType==='touch')return;hov=!!pick();cv.style.cursor=hov?'grab':''});
const up=e=>{if(!grab)return;if(press&&e.type==='pointerup'&&performance.now()-press.t<450)ft=ft===0?Math.PI:0;grab=null;press=null;cv.style.cursor=hov?'grab':''};
['pointerup','pointercancel','lostpointercapture'].forEach(n=>cv.addEventListener(n,up));
cv.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;ray(e.touches[0]);if(pick())e.preventDefault()},{passive:false});
return()=>{dead=true;R.dispose();cv.remove();const b2=host.querySelector('.box');if(b2)b2.style.display=''}};