/* ============================================================
   MOURIYAN GANDHI — interactions
   ============================================================ */
(function(){
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const isTouch = window.matchMedia('(hover:none),(pointer:coarse)').matches;
  const $  = (s,c)=> (c||document).querySelector(s);
  const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));

  /* ---------- Theme (inline-var driven for max compatibility) ---------- */
  const root = document.documentElement;
  const lightVars = {'--bg':'#EBE3D4','--bg-2':'#E3DACA','--surface':'#F3ECDE','--surface-2':'#EAE1D0','--line':'rgba(22,20,15,.12)','--line-strong':'rgba(22,20,15,.24)','--ink':'#171510','--ink-dim':'#3C382E','--muted':'#6E6757','--accent':'#D9420F','--accent-soft':'rgba(217,66,15,.12)','--gold':'#8C6C24','--jade':'#2F7D58','--azure':'#2A6FDB','--grain':'.05'};
  function applyTheme(light){
    if(light){ root.setAttribute('data-theme','light'); for(const k in lightVars) root.style.setProperty(k, lightVars[k]); root.style.colorScheme='light'; }
    else { root.removeAttribute('data-theme'); for(const k in lightVars) root.style.removeProperty(k); root.style.colorScheme='dark'; }
  }
  if(localStorage.getItem('mg-theme')==='light') applyTheme(true);
  function toggleTheme(){
    const light = root.getAttribute('data-theme')!=='light';
    applyTheme(light);
    localStorage.setItem('mg-theme', light?'light':'dark');
    const tt = $('.theme-toggle svg');
    if(tt){ const r = (parseInt(tt.dataset.r||'0',10)+180); tt.dataset.r=r; tt.style.transform='rotate('+r+'deg)'; }
  }
  const themeBtn = $('.theme-toggle');
  if(themeBtn) themeBtn.addEventListener('click', toggleTheme);

  /* ---------- Custom cursor ---------- */
  if(!isTouch){
    const dot = document.createElement('div'); dot.className='cursor-dot';
    const ring = document.createElement('div'); ring.className='cursor-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);
    let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
    (function loop(){ rx+=(mx-rx)*.18; ry+=(my-ry)*.18; ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    addEventListener('mousedown',()=>ring.classList.add('down'));
    addEventListener('mouseup',()=>ring.classList.remove('down'));
    const hoverSel='a,button,.proj,.philo-card,.view-chip,.skill-cat li,.c-link,[data-cursor]';
    document.addEventListener('mouseover',e=>{ if(e.target.closest(hoverSel)) ring.classList.add('hover'); });
    document.addEventListener('mouseout',e=>{ if(e.target.closest(hoverSel)) ring.classList.remove('hover'); });
  }

  /* ---------- Magnetic ---------- */
  if(!isTouch && !reduce){
    $$('[data-magnetic]').forEach(el=>{
      const str = parseFloat(el.dataset.magnetic)||0.4;
      el.addEventListener('mousemove',e=>{
        const r=el.getBoundingClientRect();
        const x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
        el.style.transform=`translate(${x*str}px,${y*str}px)`;
        const lbl=el.querySelector('.lbl'); if(lbl) lbl.style.transform=`translate(${x*str*.35}px,${y*str*.35}px)`;
      });
      el.addEventListener('mouseleave',()=>{ el.style.transform=''; const lbl=el.querySelector('.lbl'); if(lbl) lbl.style.transform=''; });
    });
  }

  /* ---------- Boot / terminal typewriter ---------- */
  const boot = $('#boot');
  function runBoot(){
    if(!boot){ startHero(); return; }
    if(reduce){ finishBoot(); return; }
    const out = $('#boot-out');
    const bar = $('#boot-bar i');
    const pct = $('#boot-pct');
    const lines = [
      {t:'$ ', p:'whoami', cls:'boot-prompt'},
      {t:'> ', p:'mouriyan gandhi — ai/ml engineer · full-stack dev', cls:''},
      {t:'$ ', p:'cat ./identity.json', cls:'boot-prompt'},
      {t:'  ', p:'{ "based": "Chennai, IN", "stack": "AI · RAG · Next.js" }', cls:''},
      {t:'$ ', p:'load --philosophy anekantavada yin-yang', cls:'boot-prompt'},
      {t:'  ', p:'[ok] many-sidedness mounted', cls:'ok'},
      {t:'  ', p:'[ok] duality balanced', cls:'ok'},
      {t:'$ ', p:'./launch portfolio', cls:'boot-prompt'},
    ];
    let li=0, ci=0, progress=0;
    const cur = document.createElement('span'); cur.className='boot-cursor';
    function tick(){
      if(li>=lines.length){ out.querySelectorAll('.boot-cursor').forEach(c=>c.remove()); setTimeout(finishBoot,360); return; }
      const L=lines[li];
      let div=out.children[li];
      if(!div){ div=document.createElement('div'); div.className='boot-line'; div.innerHTML='<span class="'+(L.t.trim()?L.cls:'')+'">'+L.t+'</span><span class="body"></span>'; out.appendChild(div); div.querySelector('.body').appendChild(cur); }
      const body=div.querySelector('.body');
      if(ci<L.p.length){
        cur.insertAdjacentText('beforebegin', L.p[ci]); ci++;
        progress = Math.min(99, Math.round(((li+ci/L.p.length)/lines.length)*100));
        if(bar) bar.style.width=progress+'%'; if(pct) pct.firstElementChild.textContent=progress+'%';
        setTimeout(tick, L.t==='  '?9:Math.random()*26+12);
      } else {
        if(L.cls && L.t==='  '){ body.classList.add(L.cls); }
        li++; ci=0; setTimeout(tick, 150);
      }
    }
    tick();
  }
  function finishBoot(){
    if(!boot || boot.dataset.fin) return; boot.dataset.fin='1';
    const bar=$('#boot-bar i'),pct=$('#boot-pct'); if(bar)bar.style.width='100%'; if(pct&&pct.firstElementChild)pct.firstElementChild.textContent='100%';
    document.body.classList.remove('locked');
    startHero();
    setTimeout(()=>{
      boot.classList.add('done');
      boot.style.opacity='0'; boot.style.visibility='hidden'; boot.style.pointerEvents='none';
      setTimeout(()=>{ if(boot&&boot.parentNode) boot.parentNode.removeChild(boot); }, 700);
    }, 300);
  }

  /* ---------- Hero reveal + role typewriter ---------- */
  function startHero(){
    const hero=$('.hero'); if(hero) hero.classList.add('revealed');
    $$('.hero h1 .ln > span').forEach(s=>{ s.style.transform='none'; });
    if(typeof checkReveals==='function') checkReveals();
    const roleEl=$('.hero-role'); 
    if(roleEl){
      const roles=['building agentic AI systems','shipping full-stack products','RAG · LangGraph · computer vision','20+ hackathons, 3+ wins','holding two truths at once'];
      const caret='<span class="tw-caret">▋</span>';
      if(reduce){ roleEl.innerHTML='> '+roles[0]+caret; return; }
      let ri=0,ci2=0,del=false;
      (function type(){
        const r=roles[ri];
        if(!del){ ci2++; if(ci2>r.length){ del=true; setTimeout(type,1300); return; } }
        else { ci2--; if(ci2<0){ del=false; ri=(ri+1)%roles.length; ci2=0; setTimeout(type,180); return; } }
        roleEl.innerHTML='<span style="color:var(--accent)">&gt;</span> '+r.slice(0,ci2)+caret;
        setTimeout(type, del?34:Math.random()*60+45);
      })();
    }
  }

  /* ---------- Scroll reveal (rect-based, robust in all envs) ---------- */
  const revealEls = $$('.reveal');
  function checkReveals(){
    const h = innerHeight;
    for(let i=revealEls.length-1;i>=0;i--){
      const el=revealEls[i];
      const r=el.getBoundingClientRect();
      if(r.top < h*0.92 && r.bottom > -40){ el.classList.add('in'); el.style.opacity='1'; el.style.transform='none'; revealEls.splice(i,1); maybeCount(el); }
    }
  }
  addEventListener('scroll',checkReveals,{passive:true});
  addEventListener('resize',checkReveals);
  checkReveals();

  /* ---------- Nav scrolled + active + mobile menu + clock ---------- */
  const nav=$('header.nav');
  const navLinks=$$('.nav-links a');
  const sections=navLinks.map(a=>$(a.getAttribute('href'))).filter(Boolean);
  function onScroll(){
    if(nav){ const s=scrollY>40; nav.classList.toggle('scrolled', s);
      nav.style.background = s?'color-mix(in srgb,var(--bg) 80%,transparent)':'';
      nav.style.backdropFilter = s?'blur(14px) saturate(1.2)':''; nav.style.webkitBackdropFilter = s?'blur(14px) saturate(1.2)':'';
      nav.style.borderBottom = s?'1px solid var(--line)':'1px solid transparent'; }
    let cur=null;
    sections.forEach(s=>{ if(s.getBoundingClientRect().top<=innerHeight*0.4) cur=s.id; });
    navLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+cur));
    // scroll-reactive yin-yang
    const total=document.body.scrollHeight-innerHeight;
    const p = total>0 ? scrollY/total : 0;
    $$('[data-spin]').forEach(el=>{ el.style.transform='rotate('+(p*720 + (parseFloat(el.dataset.base)||0))+'deg)'; });
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  const menuBtn=$('.menu-btn'), navList=$('.nav-links');
  if(menuBtn){ menuBtn.addEventListener('click',()=>navList.classList.toggle('open')); 
    $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>navList.classList.remove('open'))); }

  // smooth anchor
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{ const id=a.getAttribute('href'); if(id.length>1){ const t=$(id); if(t){ e.preventDefault(); t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'}); } } });
  });

  // clock (Chennai = IST)
  const clockEl=$('#clock-time');
  function tickClock(){ if(!clockEl)return; const now=new Date(); const ist=new Date(now.getTime()+ (now.getTimezoneOffset()*60000) + (5.5*3600000)); clockEl.textContent=ist.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+' IST'; }
  tickClock(); setInterval(tickClock,1000);

  /* ---------- Shloka language switch ---------- */
  const shloka=$('.shloka');
  if(shloka){
    const sa=$('.shloka-sa'), en=$('.shloka-en'), thumb=$('.lang-switch .thumb');
    function setLang(lang){
      shloka.setAttribute('data-lang',lang);
      if(sa&&en){
        if(lang==='en'){ sa.style.transform='rotateX(-90deg)'; sa.style.opacity='0'; en.style.transform='rotateX(0deg)'; en.style.opacity='1'; }
        else { sa.style.transform='rotateX(0deg)'; sa.style.opacity='1'; en.style.transform='rotateX(90deg)'; en.style.opacity='0'; }
      }
      if(thumb) thumb.style.transform = lang==='en'?'translateX(100%)':'translateX(0)';
      $$('.lang-switch button').forEach(x=>{ const on=x.dataset.lang===lang; x.classList.toggle('on',on); x.style.color = on?'#fff':''; });
    }
    $$('.lang-switch button').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
  }

  /* ---------- Tech stack rows (color-coded marquee) ---------- */
  const stackData = [
    {label:'Languages', cat:'var(--accent)', items:['Python','TypeScript','JavaScript','Java','C++','C']},
    {label:'AI / ML', cat:'var(--gold)', items:['RAG','LangChain','LangGraph','Vector DBs','NLP','OpenCV','YOLO','TensorFlow','PyTorch','Pandas','NumPy','HuggingFace']},
    {label:'Web & Backend', cat:'var(--jade)', items:['React','Next.js','Node.js','FastAPI','Express','REST APIs','Tailwind']},
    {label:'Data & Tools', cat:'var(--azure)', items:['PostgreSQL','Supabase','Firebase','MongoDB','SQLite','Git','GitHub','Docker','n8n','Postman']},
  ];
  const stackEl=$('#stack');
  if(stackEl){
    stackData.forEach(row=>{
      const r=document.createElement('div'); r.className='stack-row'; r.style.setProperty('--cat',row.cat);
      const tab=document.createElement('div'); tab.className='stack-tab'; tab.innerHTML='<span>'+row.label+'</span>';
      const mq=document.createElement('div'); mq.className='stack-marquee';
      const track=document.createElement('div'); track.className='stack-track';
      const base = row.items.length<9 ? row.items.concat(row.items) : row.items;
      base.concat(base).forEach(name=>{
        const c=document.createElement('div'); c.className='tech-card';
        c.innerHTML='<div class="pr">&gt;_</div><div class="nm">'+name+'</div>';
        track.appendChild(c);
      });
      mq.appendChild(track); r.appendChild(tab); r.appendChild(mq); stackEl.appendChild(r);
    });
  }

  /* ---------- About · lens switcher ---------- */
  const lensData = [
    {word:'ENGINEER', title:'The <em>Engineer</em>', tint:'var(--accent)', copy:'I architect <span class="hl">agentic AI systems</span> — RAG pipelines, multi-agent orchestration, vector retrieval — and care that they\'re correct, observable and quick. <span class="mut">B.Tech CSE (AI &amp; ML) at SRM, Chennai.</span>'},
    {word:'BUILDER', title:'The <em>Builder</em>', tint:'var(--jade)', copy:'I <span class="hl">ship products end-to-end</span> — from the data model to the deploy button. DoItForMe crossed 1000+ users; I sweat the payment flow and the empty states equally.'},
    {word:'DESIGNER', title:'The <em>Designer</em>', tint:'var(--gold)', copy:'I treat the browser like a <span class="hl">canvas</span> — motion, type, rhythm, restraint. The web should feel <span class="mut">made, not generated.</span>'},
    {word:'STUDENT', title:'The <em>Student</em>', tint:'var(--azure)', copy:'Perpetual <span class="hl">student</span> — 9.43 CGPA, 20+ hackathons, a handful of wins and a pile of lessons. I learn loudest by <span class="mut">building in public.</span>'}
  ];
  const N=lensData.length;
  const lensOut=$('#lens-out'), lensWord=$('#lens-word'), lensTitle=$('#lens-title'), lensNum=$('#lens-num');
  const lpFill=$('#lp-fill'), photo=$('.scrolly-photo'), overlay=$('.lens-overlay');
  const track=$('#about-track');
  let curLens=-1;
  function setLens(i){
    if(i===curLens) return; curLens=i; const d=lensData[i];
    if(lensOut){ lensOut.style.opacity='0'; setTimeout(()=>{ lensOut.innerHTML=d.copy; lensOut.style.opacity='1'; }, reduce?0:260); }
    if(lensWord){ lensWord.style.opacity='0'; setTimeout(()=>{ lensWord.textContent=d.word; lensWord.style.opacity='.9'; }, reduce?0:180); }
    if(lensTitle) lensTitle.innerHTML=d.title;
    if(lensNum) lensNum.textContent='0'+(i+1);
    if(overlay) overlay.style.background=d.tint;
    if(photo) photo.style.setProperty('--lens',d.tint);
    $$('.lp-item').forEach(b=>{ const on=+b.dataset.lens===i; b.classList.toggle('on',on); b.style.color=on?'var(--accent)':''; });
    if(lpFill) lpFill.style.transform='translateY('+(i*100)+'%)';
  }
  // scroll-driven progression while the photo is pinned.
  // Lead-in hold lets lens 0 be read on arrival; lead-out hold lets lens 4 settle before release.
  const LEAD=0.16, TAIL=0.12;
  function lensScroll(){
    if(!track) return;
    if(innerWidth<=860) return; // mobile uses tap (handled below)
    const rect=track.getBoundingClientRect();
    const range=track.offsetHeight - innerHeight;
    let p=(-rect.top)/Math.max(1,range);   // 0 when track top hits viewport top, 1 at end of pin
    p=Math.max(0,Math.min(1,p));
    // remap with hold zones at both ends
    let pp=(p-LEAD)/Math.max(0.0001,(1-LEAD-TAIL));
    pp=Math.max(0,Math.min(1,pp));
    const idx=Math.max(0, Math.min(N-1, Math.floor(pp*N - 1e-9)));
    setLens(idx);
  }
  // click-to-jump targets land in the middle of each step's hold band
  function lensTargetFor(i){
    if(!track) return 0;
    const rect=track.getBoundingClientRect();
    const absTop=rect.top + scrollY;
    const range=track.offsetHeight - innerHeight;
    const span=1-LEAD-TAIL;
    const p=LEAD + ((i+0.5)/N)*span;
    return absTop + p*range;
  }
  if(lpFill) lpFill.style.height=(100/N)+'%';
  $$('.lp-item').forEach(b=>b.addEventListener('click',()=>{
    const i=+b.dataset.lens;
    if(innerWidth<=860){ setLens(i); return; }
    if(track){ window.scrollTo({top:lensTargetFor(i), behavior:reduce?'auto':'smooth'}); }
  }));
  addEventListener('scroll',lensScroll,{passive:true});
  setLens(0); lensScroll();

  /* ---------- Count-up stats ---------- */
  function countUp(el){
    const target=parseFloat(el.dataset.count)||0; const dec=+(el.dataset.dec||0);
    if(reduce){ el.textContent=target.toFixed(dec); return; }
    const dur=1200, t0=performance.now();
    (function step(t){ const p=Math.min(1,(t-t0)/dur); const e=1-Math.pow(1-p,3); el.textContent=(target*e).toFixed(dec); if(p<1) requestAnimationFrame(step); else el.textContent=target.toFixed(dec); })(performance.now());
  }
  function maybeCount(el){
    if(el.dataset.counted) return;
    const targets = el.matches&&el.matches('[data-count]') ? [el] : (el.querySelectorAll? Array.from(el.querySelectorAll('[data-count]')):[]);
    if(targets.length){ el.dataset.counted='1'; targets.forEach(countUp); }
  }

  /* ---------- (legacy career console removed — replaced by git-log timeline) ---------- */

  /* ---------- Contact form ---------- */
  const form=$('#contact-form');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault();
      let ok=true;
      const fields=[['name',v=>v.trim().length>1],['email',v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())],['message',v=>v.trim().length>4]];
      fields.forEach(([id,test])=>{ const f=$('#f-'+id); const wrap=f.closest('.field'); const m=wrap.querySelector('.msg'); if(!test(f.value)){ wrap.classList.add('err'); f.style.borderColor='#e0533b'; if(m)m.style.display='block'; ok=false; } else { wrap.classList.remove('err'); f.style.borderColor=''; if(m)m.style.display='none'; } });
      if(!ok) return;
      // build mailto as graceful real action
      const n=$('#f-name').value,em=$('#f-email').value,msg=$('#f-message').value;
      const mail='mailto:gandhimouriyan1234@gmail.com?subject='+encodeURIComponent('Portfolio — '+n)+'&body='+encodeURIComponent(msg+'\n\n— '+n+' ('+em+')');
      form.classList.add('sent');
      $$('#contact-form .field, #contact-form .form-submit').forEach(el=>el.style.display='none');
      const okEl=form.querySelector('.form-ok'); if(okEl) okEl.style.display='flex';
      setTimeout(()=>{ window.location.href=mail; },600);
    });
    $$('#contact-form input,#contact-form textarea').forEach(f=>f.addEventListener('input',()=>{ const w=f.closest('.field'); w.classList.remove('err'); f.style.borderColor=''; const m=w.querySelector('.msg'); if(m)m.style.display='none'; }));
  }

  /* ---------- year ---------- */
  const yr=$('#year'); if(yr) yr.textContent=new Date().getFullYear();

  /* ---------- kick off ---------- */
  document.body.classList.add('locked');
  if(document.readyState==='complete') runBoot();
  else addEventListener('load',()=>setTimeout(runBoot,120));
  // safety: never trap user
  setTimeout(()=>{ if(boot && !boot.classList.contains('done')){ finishBoot(); } }, 9000);
})();
