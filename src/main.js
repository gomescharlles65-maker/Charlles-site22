import './styles/main.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/* Lenis controla o smooth scroll · GSAP controla as animações · ScrollTrigger as animações ligadas ao scroll */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function done(){window.__animReady=true;document.documentElement.classList.remove('js-anim');}
function curPos(el,main){var x=0,y=0,e=el;while(e&&e!==main){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent;}return{x:x,y:y,w:el.offsetWidth,h:el.offsetHeight};}
function staticCursor(){var m=document.querySelector('main.site-shell'),c=document.getElementById('cursor3d'),s=document.getElementById('cursor-socket');if(!m||!c||!s)return;
 function put(){var p=curPos(s,m);c.style.transform='translate('+(p.x+p.w/2)+'px,'+(p.y+p.h/2)+'px) translate(-50%,-50%)';}
 put();c.style.opacity=1;c.style.visibility='visible';addEventListener('resize',put);addEventListener('load',put);}

if(reduce){staticCursor();done();return;}
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ease:'power3.out'});
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

/* Lenis controla o scroll; ScrollTrigger acompanha */
var lenis=null;
{
  lenis=new Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},smoothWheel:true,syncTouch:false});
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(function(t){lenis.raf(t*1000)});
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){
    var id=a.getAttribute('href');var el=id.length>1&&$(id);if(!el)return;
    e.preventDefault();closeMenu();lenis.scrollTo(el,{offset:id==='#inicio'?0:-74,duration:1.6});
  });});
}

/* Menu mobile */
var btn=$('[data-testid="button-toggle-menu"]'),menu=$('#mobile-menu');
function closeMenu(){if(!menu)return;menu.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Abrir menu');if(lenis)lenis.start();}
if(btn&&menu){btn.addEventListener('click',function(){var o=!menu.classList.contains('open');menu.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);btn.setAttribute('aria-label',o?'Fechar menu':'Abrir menu');if(lenis)o?lenis.stop():lenis.start();});}

/* Quebra títulos em palavras com máscara */
function split(el){
  if(el._w)return el._w;
  var label=el.textContent.replace(/\s+/g,' ').trim();el.setAttribute('aria-label',label);
  var out=[];
  (function walk(node,wrap){
    Array.prototype.slice.call(node.childNodes).forEach(function(n){
      if(n.nodeType===3){
        var parts=n.textContent.split(/(\s+)/),frag=document.createDocumentFragment();
        parts.forEach(function(p){
          if(!p)return;
          if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(' '));return;}
          var w=document.createElement('span');w.className='w';w.setAttribute('aria-hidden','true');
          var i=document.createElement('span');i.className='wi';i.textContent=p;w.appendChild(i);frag.appendChild(w);out.push(i);
        });
        n.parentNode.replaceChild(frag,n);
      }else if(n.nodeType===1&&n.tagName!=='BR'){walk(n);}
    });
  })(el);
  el._w=out;return out;
}


/* CURSOR 3D — objeto da composição: percorre pontos da página guiado pelo scroll */
var cursorApi=(function(){
  var main=$('main.site-shell'),cur=$('#cursor3d'),sock=$('#cursor-socket');
  if(!main||!cur||!sock)return null;
  var fx=$('.cur-fx',cur),rot=$('.cur-rot',cur),tri=$('.cur-3d',cur);
  var mqC=matchMedia('(max-width: 1023px)'),mqM=matchMedia('(max-width: 767px)');
  var wp=[],pressed=false,ease=gsap.parseEase('power3.inOut');
  function k(){return mqM.matches?.5:1;}
  function P(el){return curPos(el,main);}
  function measure(){
    var s=cur.offsetWidth,vh=innerHeight,W=main.offsetWidth,compact=mqC.matches,pts=[];
    function add(x,y,ry,rz,sc,at){pts.push({x:Math.min(W-s/2+4,Math.max(s/2+4,x)),y:y,ry:ry,rz:rz,sc:sc,at:at||.5});}
    var so=P(sock);add(so.x+so.w/2,so.y+so.h/2,-18,0,1,0);
    var ids=['sobre','servicos','beneficios','metodo','processo','projetos'];
    var ry=[16,-14,18,-12,14,-16],rz=[-4,3,-3,4,-3,3],sc=[.95,.92,.95,.92,.95,.9],lane={sobre:1,beneficios:1,metodo:1};
    ids.forEach(function(id,i){
      var sec=$('#'+id);if(!sec)return;
      var c=P($('#'+id+' > div')),cx=c.x+c.w,x,y;
      if(compact){var eb=P($('.eyebrow',sec));x=W-s/2+4;y=eb.y+eb.h/2;}
      else{
        var h2=P($('h2',sec));y=h2.y+h2.h/2;
        if(lane[id]){var col=P($('h2',sec).closest('[data-r]'));x=col.x+col.w+48;}
        else{x=cx-s/2-30;if(id==='projetos')y-=10;}
      }
      add(x,y,ry[i],rz[i],sc[i]);
      if(id==='projetos'&&!compact){var a=P($('#projetos article'));add(a.x+a.w-s*.9,a.y+s*.9,12,2,.88);}
    });
    var b=P($('[data-testid="link-contact-whatsapp"]')),tipX=b.x+b.w-(compact?40:64),tipY=b.y+b.h-6;
    add(tipX+.292*s,tipY+.375*s,0,0,1.04,.62);
    var maxS=Math.max(1,document.documentElement.scrollHeight-vh);
    wp=pts.map(function(p,i){p.s=i?p.y-vh*p.at:0;return p;});
    for(var i=1;i<wp.length;i++)wp[i].s=Math.max(wp[i].s,wp[i-1].s+80);
    var L=wp[wp.length-1];if(L.s>maxS*.985){L.s=Math.max(wp[wp.length-2].s+40,maxS*.985);}
  }
  gsap.set(cur,{xPercent:-50,yPercent:-50,autoAlpha:0});
  measure();
  gsap.set(cur,{x:wp[0].x,y:wp[0].y});gsap.set(rot,{rotationY:wp[0].ry*k()});
  var qx=gsap.quickTo(cur,'x',{duration:1.1,ease:'power3.out'}),qy=gsap.quickTo(cur,'y',{duration:1.1,ease:'power3.out'}),
      qr=gsap.quickTo(cur,'rotation',{duration:.9,ease:'power3.out'}),qs=gsap.quickTo(cur,'scale',{duration:1.1,ease:'power3.out'}),
      qry=gsap.quickTo(rot,'rotationY',{duration:1.2,ease:'power3.out'});
  function update(s,v){
    if(wp.length<2)return;
    var i=0;while(i<wp.length-2&&s>=wp[i+1].s)i++;
    var a=wp[i],b=wp[i+1],t=Math.min(1,Math.max(0,(s-a.s)/(b.s-a.s))),e=ease(t),kk=k();
    qx(a.x+(b.x-a.x)*e);qy(a.y+(b.y-a.y)*e);qs(a.sc+(b.sc-a.sc)*e);
    qr((a.rz+(b.rz-a.rz)*e)*kk+Math.max(-1,Math.min(1,v/1800))*5*kk);
    qry((a.ry+(b.ry-a.ry)*e)*kk);
    var last=wp[wp.length-1];
    if(!pressed&&s>=last.s-6){pressed=true;gsap.fromTo(rot,{scale:1},{scale:.9,duration:.22,yoyo:true,repeat:1,ease:'power2.out'});}
    else if(pressed&&s<last.s-240)pressed=false;
  }
  /* flutuação contínua (em elemento próprio, sem conflito com o scroll) */
  gsap.to(tri,{y:function(){return -6*k();},duration:3.2,ease:'sine.inOut',yoyo:true,repeat:-1,repeatRefresh:true});
  gsap.fromTo(tri,{rotationY:function(){return -12*k();}},{rotationY:function(){return 12*k();},duration:4.6,ease:'sine.inOut',yoyo:true,repeat:-1,repeatRefresh:true});
  gsap.fromTo(tri,{rotationX:function(){return -5*k();}},{rotationX:function(){return 5*k();},duration:5.8,ease:'sine.inOut',yoyo:true,repeat:-1,repeatRefresh:true});
  ScrollTrigger.create({start:0,end:'max',onUpdate:function(self){update(self.scroll(),self.getVelocity());}});
  ScrollTrigger.addEventListener('scrollEnd',function(){update(window.pageYOffset,0);});
  ScrollTrigger.addEventListener('refresh',function(){measure();update(window.pageYOffset,0);});
  return{enter:function(){
    var t=gsap.timeline();
    t.fromTo(cur,{autoAlpha:0},{autoAlpha:1,duration:1.2,ease:'power2.out'},0)
     .fromTo(fx,{y:28,scale:.5},{y:0,scale:1,duration:1.8,ease:'expo.out'},0)
     .fromTo(rot,{rotationY:-85},{rotationY:wp[0].ry*k(),duration:2.1,ease:'expo.out'},0);
    return t;}};
})();

var mm=gsap.matchMedia();
mm.add({desktop:'(min-width: 768px)',mobile:'(max-width: 767px)'},function(ctx){
  var d=ctx.conditions.desktop,Y=d?48:22,T=d?1:.8;

  /* HERO — tensão → título → subtítulo → botões */
  var hero=$('#inicio'),h1=$('h1',hero),words=split(h1);
  var eyebrow=$('.eyebrow',hero),eyeLine=eyebrow.previousElementSibling;
  var sub=$('p',hero),ctas=$$('a[data-testid^="link-hero"]',hero);
  var mock=$('.max-w-\\[470px\\]',hero),tex=$('.grid-texture',hero),hdr=$('header'),scrollI=$('[data-testid="link-scroll-about"]');
  gsap.set($$('[data-r]',hero),{visibility:'visible'});
  gsap.set([eyebrow,sub,ctas,mock,hdr,scrollI],{autoAlpha:0});
  gsap.set(words,{yPercent:115});
  gsap.set(eyeLine,{scaleX:0,transformOrigin:'left center'});
  gsap.set(tex,{opacity:0});
  var tl=gsap.timeline({delay:.35,defaults:{ease:'expo.out'}});
  tl.to(eyeLine,{scaleX:1,duration:1.1,ease:'power3.inOut'})
    .to(tex,{opacity:.5,duration:1.6,ease:'power2.out'},0)
    .to(eyebrow,{autoAlpha:1,duration:.9},'-=.5')
    .to(words,{yPercent:0,duration:1.5,stagger:.09},'-=.35')
    .fromTo(sub,{y:26},{autoAlpha:1,y:0,duration:1.1},'-=.85')
    .fromTo(ctas,{y:22},{autoAlpha:1,y:0,duration:.9,stagger:.18},'-=.7')
    .fromTo(mock,d?{y:60,scale:.96}:{y:28},{autoAlpha:1,y:0,scale:1,duration:1.6},'-=1.3')
    .to(hdr,{autoAlpha:1,duration:.9,ease:'power2.out'},'-=1.2')
    .to(scrollI,{autoAlpha:1,duration:.9},'-=.4');
  if(cursorApi)tl.add(cursorApi.enter(),'-=1.3');
  if(scrollI){ScrollTrigger.create({start:60,end:'max',onUpdate:function(s){gsap.to(scrollI,{autoAlpha:s.scroll()>60?0:1,duration:.5,overwrite:true});}});}
  if(d){ /* parallax sutil só no desktop */
    gsap.to(mock,{yPercent:-6,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.8}});
    gsap.to(tex,{yPercent:12,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.8}});
  }

  /* TÍTULOS DAS SEÇÕES */
  $$('section:not(#inicio) h2').forEach(function(h){
    var w=split(h),box=h.parentElement,eb=$('.eyebrow',box),p=$('p',box);
    var t=gsap.timeline({scrollTrigger:{trigger:box,start:'top 82%',once:true}});
    if(eb)t.from(eb,{autoAlpha:0,y:14,duration:.8});
    t.from(w,{yPercent:115,duration:1.25,ease:'expo.out',stagger:.07},eb?'-=.5':0);
    if(p)t.from(p,{autoAlpha:0,y:20,duration:1},'-=.75');
  });
  /* BLOCOS EM GRUPO (stagger 0.2s) */
  function group(sel,opts){
    $$(sel).forEach(function(g){
      var items=$$(opts.items,g);if(!items.length)return;
      gsap.from(items,{autoAlpha:0,y:Y,scale:opts.scale||1,duration:T*1.05,ease:'power3.out',stagger:opts.stagger||.2,
        scrollTrigger:{trigger:g,start:'top 82%',once:true}});
    });
  }
  group('#servicos .mt-14',{items:':scope > [data-r]'});
  group('#metodo .sm\\:grid-cols-3',{items:':scope > div'});
  group('#processo .md\\:grid-cols-5',{items:':scope > [data-r]',stagger:.2});
  group('#beneficios .divide-y',{items:':scope > div',stagger:.12});
  /* Sobre */
  var sobre=$('#sobre .sm\\:grid-cols-\\[270px_1fr\\]');
  if(sobre){
    var ph=sobre.children[0],img=$('img',ph),tx=$$('p,div.flex',sobre.children[1]);
    var st=gsap.timeline({scrollTrigger:{trigger:sobre,start:'top 82%',once:true}});
    st.from(ph,{autoAlpha:0,y:Y,duration:1.3}).from(img,{scale:1.18,duration:1.8,ease:'expo.out'},0)
      .from(tx,{autoAlpha:0,y:20,duration:1,stagger:.2},'-=1');
  }
  /* CTA final */
  var cta=$('#contato .rounded-2xl');
  if(cta)gsap.from(cta,{autoAlpha:0,y:Y,scale:d?.97:1,duration:1.3,ease:'expo.out',scrollTrigger:{trigger:cta,start:'top 88%',once:true}});
  gsap.from('footer > div',{autoAlpha:0,y:14,duration:1,stagger:.15,scrollTrigger:{trigger:'footer',start:'top 95%',once:true}});

  /* PROJETOS — câmera conduzindo */
  var cards=$$('#projetos article');
  cards.forEach(function(c,i){
    var shot=$('.project-screen',c),meta=$$('.p-5:not(.project-screen) > *',c);
    var tlp=gsap.timeline({scrollTrigger:{trigger:c,start:'top 85%',once:true},onComplete:function(){gsap.set(c,{clearProps:'opacity,visibility,transform'});}});
    tlp.from(c,{autoAlpha:0,y:d?80:30,scale:d?.94:1,duration:1.4,ease:'expo.out',delay:d?(i%2)*.2:0})
       .from(meta,{autoAlpha:0,y:18,duration:.9,stagger:.2},'-=.9');
    if(!d)gsap.from($('.shot',c),{scale:1.1,duration:1.6,ease:'expo.out',scrollTrigger:{trigger:c,start:'top 85%',once:true}});
    if(d){
      var sh=$('.shot',c),big=sh.classList.contains('shot-big');var to=big?{yPercent:4,scale:1.1}:{scale:1.01};to.ease='none';to.scrollTrigger={trigger:c,start:'top bottom',end:'bottom top',scrub:.8};gsap.fromTo(sh,big?{yPercent:-4,scale:1.1}:{scale:1.05},to);
      ScrollTrigger.create({trigger:c,start:'top 62%',end:'bottom 38%',toggleClass:{targets:c,className:'is-focus'}});
    }
  });
});

ScrollTrigger.config({ignoreMobileResize:true}); /* barra de endereço do Android */
done();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ScrollTrigger.refresh();});
addEventListener('load',function(){ScrollTrigger.refresh();});
})();
