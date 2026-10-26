(function(){
if(matchMedia('(prefers-reduced-motion:reduce)').matches||matchMedia('(pointer:coarse)').matches)return;
const config={SIM_RESOLUTION:128,DYE_RESOLUTION:720,DENSITY_DISSIPATION:6,VELOCITY_DISSIPATION:4,PRESSURE:0.1,PRESSURE_ITERATIONS:20,CURL:1,SPLAT_RADIUS:0.08,SPLAT_FORCE:2500,SHADING:true,COLOR_UPDATE_SPEED:10,RAINBOW_MODE:false,COLOR:'#7C3AED'};
const box=document.createElement('div');box.setAttribute('aria-hidden','true');box.className='splash-fx';box.style.cssText='position:fixed;top:0;left:0;z-index:50;pointer-events:none;width:100%;height:100%';
const canvas=document.createElement('canvas');canvas.style.cssText='width:100vw;height:100vh;display:block';box.appendChild(canvas);document.body.appendChild(box);
function P(){this.id=-1;this.texcoordX=0;this.texcoordY=0;this.prevTexcoordX=0;this.prevTexcoordY=0;this.deltaX=0;this.deltaY=0;this.down=false;this.moved=false;this.color=[0,0,0]}
const pointers=[new P()];
const params={alpha:true,depth:false,stencil:false,antialias:false,preserveDrawingBuffer:false};
let gl=canvas.getContext('webgl2',params);const isGL2=!!gl;
if(!isGL2)gl=canvas.getContext('webgl',params)||canvas.getContext('experimental-webgl',params);
if(!gl){box.remove();return}
let halfFloat,linear;
if(isGL2){gl.getExtension('EXT_color_buffer_float');linear=gl.getExtension('OES_texture_float_linear')}
else{halfFloat=gl.getExtension('OES_texture_half_float');linear=gl.getExtension('OES_texture_half_float_linear')}
const HF=isGL2?gl.HALF_FLOAT:halfFloat&&halfFloat.HALF_FLOAT_OES;
function supportRT(i,f,t){const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,i,4,4,0,f,t,null);const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tx,0);return gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE}
function fmt(i,f,t){if(!supportRT(i,f,t)){if(isGL2&&i===gl.R16F)return fmt(gl.RG16F,gl.RG,t);if(isGL2&&i===gl.RG16F)return fmt(gl.RGBA16F,gl.RGBA,t);return null}return{internalFormat:i,format:f}}
let fRGBA,fRG,fR;
if(isGL2){fRGBA=fmt(gl.RGBA16F,gl.RGBA,HF);fRG=fmt(gl.RG16F,gl.RG,HF);fR=fmt(gl.R16F,gl.RED,HF)}else{fRGBA=fRG=fR=fmt(gl.RGBA,gl.RGBA,HF)}
if(!fRGBA||!fRG||!fR){box.remove();return}
if(!linear){config.DYE_RESOLUTION=256;config.SHADING=false}
function hash(s){let h=0;for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0}return h}
function compile(type,src,kw){if(kw)src=kw.map(k=>'#define '+k+'\n').join('')+src;const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.warn(gl.getShaderInfoLog(s));return s}
function link(v,f){const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.warn(gl.getProgramInfoLog(p));return p}
function uniforms(p){const u={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const name=gl.getActiveUniform(p,i).name;u[name]=gl.getUniformLocation(p,name)}return u}
class Program{constructor(v,f){this.program=link(v,f);this.uniforms=uniforms(this.program)}bind(){gl.useProgram(this.program)}}
class Material{constructor(v,src){this.v=v;this.src=src;this.programs=[];this.active=null;this.uniforms={}}setKeywords(k){let h=0;for(const x of k)h+=hash(x);let p=this.programs[h];if(p==null){p=link(this.v,compile(gl.FRAGMENT_SHADER,this.src,k));this.programs[h]=p}if(p===this.active)return;this.uniforms=uniforms(p);this.active=p}bind(){gl.useProgram(this.active)}}
const FS=(s,k)=>compile(gl.FRAGMENT_SHADER,s,k);
const baseV=compile(gl.VERTEX_SHADER,`precision highp float;attribute vec2 aPosition;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform vec2 texelSize;void main(){vUv=aPosition*0.5+0.5;vL=vUv-vec2(texelSize.x,0.0);vR=vUv+vec2(texelSize.x,0.0);vT=vUv+vec2(0.0,texelSize.y);vB=vUv-vec2(0.0,texelSize.y);gl_Position=vec4(aPosition,0.0,1.0);}`);
const copyS=FS(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;void main(){gl_FragColor=texture2D(uTexture,vUv);}`);
const clearS=FS(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`);
const displaySrc=`precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uTexture;uniform vec2 texelSize;void main(){vec3 c=texture2D(uTexture,vUv).rgb;
#ifdef SHADING
vec3 lc=texture2D(uTexture,vL).rgb;vec3 rc=texture2D(uTexture,vR).rgb;vec3 tc=texture2D(uTexture,vT).rgb;vec3 bc=texture2D(uTexture,vB).rgb;float dx=length(rc)-length(lc);float dy=length(tc)-length(bc);vec3 n=normalize(vec3(dx,dy,length(texelSize)));vec3 l=vec3(0.0,0.0,1.0);float diffuse=clamp(dot(n,l)+0.7,0.7,1.0);c*=diffuse;
#endif
float a=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c,a);}`;
const splatS=FS(`precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point.xy;p.x*=aspectRatio;vec3 splat=exp(-dot(p,p)/radius)*color;vec3 base=texture2D(uTarget,vUv).xyz;gl_FragColor=vec4(base+splat,1.0);}`);
const advS=FS(`precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 texelSize;uniform vec2 dyeTexelSize;uniform float dt;uniform float dissipation;vec4 bilerp(sampler2D sam,vec2 uv,vec2 tsize){vec2 st=uv/tsize-0.5;vec2 iuv=floor(st);vec2 fuv=fract(st);vec4 a=texture2D(sam,(iuv+vec2(0.5,0.5))*tsize);vec4 b=texture2D(sam,(iuv+vec2(1.5,0.5))*tsize);vec4 c=texture2D(sam,(iuv+vec2(0.5,1.5))*tsize);vec4 d=texture2D(sam,(iuv+vec2(1.5,1.5))*tsize);return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);}void main(){
#ifdef MANUAL_FILTERING
vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;vec4 result=bilerp(uSource,coord,dyeTexelSize);
#else
vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;vec4 result=texture2D(uSource,coord);
#endif
float decay=1.0+dissipation*dt;gl_FragColor=result/decay;}`,linear?null:['MANUAL_FILTERING']);
const divS=FS(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x;float R=texture2D(uVelocity,vR).x;float T=texture2D(uVelocity,vT).y;float B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.0){L=-C.x;}if(vR.x>1.0){R=-C.x;}if(vT.y>1.0){T=-C.y;}if(vB.y<0.0){B=-C.y;}float div=0.5*(R-L+T-B);gl_FragColor=vec4(div,0.0,0.0,1.0);}`);
const curlS=FS(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).y;float R=texture2D(uVelocity,vR).y;float T=texture2D(uVelocity,vT).x;float B=texture2D(uVelocity,vB).x;float vorticity=R-L-T+B;gl_FragColor=vec4(0.5*vorticity,0.0,0.0,1.0);}`);
const vortS=FS(`precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl;uniform float dt;void main(){float L=texture2D(uCurl,vL).x;float R=texture2D(uCurl,vR).x;float T=texture2D(uCurl,vT).x;float B=texture2D(uCurl,vB).x;float C=texture2D(uCurl,vUv).x;vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));force/=length(force)+0.0001;force*=curl*C;force.y*=-1.0;vec2 velocity=texture2D(uVelocity,vUv).xy;velocity+=force*dt;velocity=min(max(velocity,-1000.0),1000.0);gl_FragColor=vec4(velocity,0.0,1.0);}`);
const presS=FS(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uDivergence;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;float divergence=texture2D(uDivergence,vUv).x;float pressure=(L+R+B+T-divergence)*0.25;gl_FragColor=vec4(pressure,0.0,0.0,1.0);}`);
const gradS=FS(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uVelocity;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;vec2 velocity=texture2D(uVelocity,vUv).xy;velocity.xy-=vec2(R-L,T-B);gl_FragColor=vec4(velocity,0.0,1.0);}`);
const blit=(()=>{gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),gl.STATIC_DRAW);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(0);
return(t,clear=false)=>{if(t==null){gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);gl.bindFramebuffer(gl.FRAMEBUFFER,null)}else{gl.viewport(0,0,t.width,t.height);gl.bindFramebuffer(gl.FRAMEBUFFER,t.fbo)}if(clear){gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT)}gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0)}})();
let dye,velocity,divergence,curl,pressure;
const copyP=new Program(baseV,copyS),clearP=new Program(baseV,clearS),splatP=new Program(baseV,splatS),advP=new Program(baseV,advS),divP=new Program(baseV,divS),curlP=new Program(baseV,curlS),vortP=new Program(baseV,vortS),presP=new Program(baseV,presS),gradP=new Program(baseV,gradS),display=new Material(baseV,displaySrc);
function createFBO(w,h,i,f,t,param){gl.activeTexture(gl.TEXTURE0);const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,param);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,param);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,i,w,h,0,f,t,null);const fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tx,0);gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT);
return{texture:tx,fbo,width:w,height:h,texelSizeX:1/w,texelSizeY:1/h,attach(id){gl.activeTexture(gl.TEXTURE0+id);gl.bindTexture(gl.TEXTURE_2D,tx);return id}}}
function createDouble(w,h,i,f,t,param){let a=createFBO(w,h,i,f,t,param),b=createFBO(w,h,i,f,t,param);return{width:w,height:h,texelSizeX:a.texelSizeX,texelSizeY:a.texelSizeY,get read(){return a},set read(v){a=v},get write(){return b},set write(v){b=v},swap(){const x=a;a=b;b=x}}}
function resizeFBO(tg,w,h,i,f,t,param){const n=createFBO(w,h,i,f,t,param);copyP.bind();gl.uniform1i(copyP.uniforms.uTexture,tg.attach(0));blit(n);return n}
function resizeDouble(tg,w,h,i,f,t,param){if(tg.width===w&&tg.height===h)return tg;tg.read=resizeFBO(tg.read,w,h,i,f,t,param);tg.write=createFBO(w,h,i,f,t,param);tg.width=w;tg.height=h;tg.texelSizeX=1/w;tg.texelSizeY=1/h;return tg}
function getRes(r){let a=gl.drawingBufferWidth/gl.drawingBufferHeight;if(a<1)a=1/a;const mn=Math.round(r),mx=Math.round(r*a);return gl.drawingBufferWidth>gl.drawingBufferHeight?{width:mx,height:mn}:{width:mn,height:mx}}
function initFB(){const s=getRes(config.SIM_RESOLUTION),d=getRes(config.DYE_RESOLUTION),f=linear?gl.LINEAR:gl.NEAREST;gl.disable(gl.BLEND);
dye=dye?resizeDouble(dye,d.width,d.height,fRGBA.internalFormat,fRGBA.format,HF,f):createDouble(d.width,d.height,fRGBA.internalFormat,fRGBA.format,HF,f);
velocity=velocity?resizeDouble(velocity,s.width,s.height,fRG.internalFormat,fRG.format,HF,f):createDouble(s.width,s.height,fRG.internalFormat,fRG.format,HF,f);
divergence=createFBO(s.width,s.height,fR.internalFormat,fR.format,HF,gl.NEAREST);curl=createFBO(s.width,s.height,fR.internalFormat,fR.format,HF,gl.NEAREST);pressure=createDouble(s.width,s.height,fR.internalFormat,fR.format,HF,gl.NEAREST)}
display.setKeywords(config.SHADING?['SHADING']:[]);initFB();
let last=Date.now(),ctimer=0,raf=0,active=true;
const spr=x=>Math.floor(x*(window.devicePixelRatio||1));
function HSV(h,s,v){let r,g,b;const i=Math.floor(h*6),f=h*6-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);switch(i%6){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;case 4:r=t;g=p;b=v;break;default:r=v;g=p;b=q}return{r,g,b}}
function hex(h){let v=h.replace('#','');if(v.length===3)v=v[0]+v[0]+v[1]+v[1]+v[2]+v[2];return{r:parseInt(v.slice(0,2),16)/255*.3,g:parseInt(v.slice(2,4),16)/255*.3,b:parseInt(v.slice(4,6),16)/255*.3}}
function genColor(){if(!config.RAINBOW_MODE)return hex((getComputedStyle(document.documentElement).getPropertyValue('--cursor')||'').trim()||config.COLOR);const c=HSV(Math.random(),1,1);c.r*=.15;c.g*=.15;c.b*=.15;return c}
function correctRadius(r){const a=canvas.width/canvas.height;return a>1?r*a:r}
function splat(x,y,dx,dy,c){splatP.bind();gl.uniform1i(splatP.uniforms.uTarget,velocity.read.attach(0));gl.uniform1f(splatP.uniforms.aspectRatio,canvas.width/canvas.height);gl.uniform2f(splatP.uniforms.point,x,y);gl.uniform3f(splatP.uniforms.color,dx,dy,0);gl.uniform1f(splatP.uniforms.radius,correctRadius(config.SPLAT_RADIUS/100));blit(velocity.write);velocity.swap();gl.uniform1i(splatP.uniforms.uTarget,dye.read.attach(0));gl.uniform3f(splatP.uniforms.color,c.r,c.g,c.b);blit(dye.write);dye.swap()}
function step(dt){gl.disable(gl.BLEND);
curlP.bind();gl.uniform2f(curlP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(curlP.uniforms.uVelocity,velocity.read.attach(0));blit(curl);
vortP.bind();gl.uniform2f(vortP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(vortP.uniforms.uVelocity,velocity.read.attach(0));gl.uniform1i(vortP.uniforms.uCurl,curl.attach(1));gl.uniform1f(vortP.uniforms.curl,config.CURL);gl.uniform1f(vortP.uniforms.dt,dt);blit(velocity.write);velocity.swap();
divP.bind();gl.uniform2f(divP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(divP.uniforms.uVelocity,velocity.read.attach(0));blit(divergence);
clearP.bind();gl.uniform1i(clearP.uniforms.uTexture,pressure.read.attach(0));gl.uniform1f(clearP.uniforms.value,config.PRESSURE);blit(pressure.write);pressure.swap();
presP.bind();gl.uniform2f(presP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(presP.uniforms.uDivergence,divergence.attach(0));for(let i=0;i<config.PRESSURE_ITERATIONS;i++){gl.uniform1i(presP.uniforms.uPressure,pressure.read.attach(1));blit(pressure.write);pressure.swap()}
gradP.bind();gl.uniform2f(gradP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(gradP.uniforms.uPressure,pressure.read.attach(0));gl.uniform1i(gradP.uniforms.uVelocity,velocity.read.attach(1));blit(velocity.write);velocity.swap();
advP.bind();gl.uniform2f(advP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);if(!linear)gl.uniform2f(advP.uniforms.dyeTexelSize,velocity.texelSizeX,velocity.texelSizeY);const vid=velocity.read.attach(0);gl.uniform1i(advP.uniforms.uVelocity,vid);gl.uniform1i(advP.uniforms.uSource,vid);gl.uniform1f(advP.uniforms.dt,dt);gl.uniform1f(advP.uniforms.dissipation,config.VELOCITY_DISSIPATION);blit(velocity.write);velocity.swap();
if(!linear)gl.uniform2f(advP.uniforms.dyeTexelSize,dye.texelSizeX,dye.texelSizeY);gl.uniform1i(advP.uniforms.uVelocity,velocity.read.attach(0));gl.uniform1i(advP.uniforms.uSource,dye.read.attach(1));gl.uniform1f(advP.uniforms.dissipation,config.DENSITY_DISSIPATION);blit(dye.write);dye.swap()}
function render(){gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.BLEND);display.bind();if(config.SHADING)gl.uniform2f(display.uniforms.texelSize,1/gl.drawingBufferWidth,1/gl.drawingBufferHeight);gl.uniform1i(display.uniforms.uTexture,dye.read.attach(0));blit(null)}
function frame(){if(!active)return;if(document.body.classList.contains('no-fx')){raf=requestAnimationFrame(frame);last=Date.now();return}const now=Date.now();let dt=Math.min((now-last)/1000,.016666);last=now;
const w=spr(canvas.clientWidth),h=spr(canvas.clientHeight);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;initFB()}
ctimer+=dt*config.COLOR_UPDATE_SPEED;if(ctimer>=1){ctimer=ctimer%1;pointers.forEach(p=>p.color=genColor())}
pointers.forEach(p=>{if(p.moved){p.moved=false;splat(p.texcoordX,p.texcoordY,p.deltaX*config.SPLAT_FORCE,p.deltaY*config.SPLAT_FORCE,p.color)}});
step(dt);render();raf=requestAnimationFrame(frame)}
const cdx=d=>{const a=canvas.width/canvas.height;return a<1?d*a:d},cdy=d=>{const a=canvas.width/canvas.height;return a>1?d/a:d};
function down(p,id,x,y){p.id=id;p.down=true;p.moved=false;p.texcoordX=x/canvas.width;p.texcoordY=1-y/canvas.height;p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;p.deltaX=0;p.deltaY=0;p.color=genColor()}
function move(p,x,y,c){p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;p.texcoordX=x/canvas.width;p.texcoordY=1-y/canvas.height;p.deltaX=cdx(p.texcoordX-p.prevTexcoordX);p.deltaY=cdy(p.texcoordY-p.prevTexcoordY);p.moved=Math.abs(p.deltaX)>0||Math.abs(p.deltaY)>0;p.color=c}
let first=false;
const onDown=e=>{if(document.body.classList.contains('no-fx'))return;const p=pointers[0];down(p,-1,spr(e.clientX),spr(e.clientY));const c=genColor();c.r*=3;c.g*=3;c.b*=3;splat(p.texcoordX,p.texcoordY,10*(Math.random()-.5),30*(Math.random()-.5),c)};
const onMove=e=>{if(document.body.classList.contains('no-fx'))return;const p=pointers[0];const x=spr(e.clientX),y=spr(e.clientY);if(!first){move(p,x,y,genColor());first=true}else move(p,x,y,p.color)};
const onTS=e=>{const p=pointers[0];for(const t of e.targetTouches)down(p,t.identifier,spr(t.clientX),spr(t.clientY))};
const onTM=e=>{const p=pointers[0];for(const t of e.targetTouches)move(p,spr(t.clientX),spr(t.clientY),p.color)};
const onTE=()=>{pointers[0].down=false};
addEventListener('mousedown',onDown);addEventListener('mousemove',onMove);addEventListener('touchstart',onTS);addEventListener('touchmove',onTM,false);addEventListener('touchend',onTE);
frame();
})();