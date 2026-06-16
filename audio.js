/* ============================================================
   MOURIYAN GANDHI — ambient soundscape
   Generative, synthesized with Web Audio (no external files).
   Smooth + uplifting: warm pad · plucked arpeggio · soft pulse.
   Starts on first user gesture (browser autoplay policy);
   toggle in nav · preference persisted.
   ============================================================ */
(function(){
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const btn  = document.getElementById('sound-toggle');
  const bars = btn ? Array.from(btn.querySelectorAll('.eq i')) : [];

  let ctx, master, filt, started=false, playing=false;
  let wantOn = localStorage.getItem('mg-sound') !== 'off';   // default ON
  let timer=null, nextTime=0, step=0;

  const bpm = 82;
  const stepDur = (60/bpm)/2;        // eighth notes
  const STEPS = 8;                    // steps per chord

  // vi – IV – I – V (Am · F · C · G) — uplifting, smooth
  const chords = [
    { pad:[146.83,220.00,261.63], arp:[220.00,261.63,329.63,392.00] }, // Am
    { pad:[174.61,261.63,349.23], arp:[174.61,261.63,349.23,440.00] }, // F
    { pad:[130.81,196.00,329.63], arp:[196.00,261.63,329.63,392.00] }, // C
    { pad:[196.00,293.66,392.00], arp:[246.94,293.66,392.00,493.88] }  // G
  ];
  const ARP = [0,2,1,3,2,3,1,2];

  function ensure(){
    if(ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    filt = ctx.createBiquadFilter(); filt.type='lowpass'; filt.frequency.value=2500; filt.Q.value=0.5;
    filt.connect(master);
    master.connect(ctx.destination);
    // gentle stereo-ish space via feedback delay
    const delay = ctx.createDelay(1.0); delay.delayTime.value = stepDur*1.5;
    const fb = ctx.createGain(); fb.gain.value = 0.26;
    const wet = ctx.createGain(); wet.gain.value = 0.30;
    master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
    return true;
  }

  function pluck(freq,t,dur,peak){
    const g = ctx.createGain();
    const o = ctx.createOscillator(); o.type='triangle'; o.frequency.value=freq;
    const d = ctx.createOscillator(); d.type='sine'; d.frequency.value=freq*1.005;
    o.connect(g); d.connect(g); g.connect(filt);
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(peak,t+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.start(t); d.start(t); o.stop(t+dur+0.05); d.stop(t+dur+0.05);
  }
  function pad(freqs,t,dur){
    freqs.forEach(f=>{
      const g = ctx.createGain();
      const o = ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=f/2;
      const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=850;
      o.connect(lp); lp.connect(g); g.connect(filt);
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(0.055,t+0.7);
      g.gain.linearRampToValueAtTime(0.038,t+dur-0.7);
      g.gain.linearRampToValueAtTime(0,t+dur);
      o.start(t); o.stop(t+dur+0.1);
    });
  }
  function kick(t){
    const g = ctx.createGain();
    const o = ctx.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(115,t); o.frequency.exponentialRampToValueAtTime(45,t+0.12);
    g.gain.setValueAtTime(0.16,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.18);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+0.2);
  }
  function hat(t){
    const len = Math.floor(ctx.sampleRate*0.045);
    const buf = ctx.createBuffer(1,len,ctx.sampleRate); const data = buf.getChannelData(0);
    for(let i=0;i<len;i++) data[i] = (Math.random()*2-1)*Math.pow(1-i/len,2.2);
    const s = ctx.createBufferSource(); s.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=7200;
    const g = ctx.createGain(); g.gain.value=0.045;
    s.connect(hp); hp.connect(g); g.connect(master); s.start(t); s.stop(t+0.05);
  }

  function schedStep(s,t){
    const ci = Math.floor(s/STEPS) % chords.length;
    const local = s % STEPS;
    const ch = chords[ci];
    if(local===0) pad(ch.pad, t, stepDur*STEPS);
    const note = ch.arp[ARP[local % ARP.length]] * (local%4===3 ? 2 : 1);
    pluck(note, t, stepDur*1.7, 0.085);
    if(local%4===0) kick(t);
    if(local%2===1) hat(t);
  }

  function loop(){
    while(nextTime < ctx.currentTime + 0.2){ schedStep(step,nextTime); nextTime += stepDur; step++; }
    timer = setTimeout(loop, 50);
  }

  function start(){
    if(!ensure()) return;
    if(ctx.state==='suspended') ctx.resume();
    if(!playing){ playing=true; nextTime = ctx.currentTime + 0.12; loop(); }
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(reduce?0.08:0.13, ctx.currentTime + 0.9);
    setUI(true);
  }
  function stop(){
    if(ctx && playing){
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    }
    setUI(false);
  }
  function setUI(on){
    if(btn){ btn.classList.toggle('on',on); btn.setAttribute('aria-pressed', on?'true':'false'); }
    bars.forEach(b=>{ b.style.background = on?'var(--accent)':''; b.style.animationPlayState = on?'running':'paused'; });
  }
  function toggle(){
    wantOn = !wantOn;
    localStorage.setItem('mg-sound', wantOn?'on':'off');
    if(wantOn) start(); else stop();
  }

  if(btn) btn.addEventListener('click', toggle);
  setUI(false);

  // Autostart on first genuine user gesture (respects autoplay policy)
  const events = ['pointerdown','keydown','touchstart'];
  function firstGesture(e){
    if(e && e.target && e.target.closest && e.target.closest('#sound-toggle')) return; // toggle handles itself
    events.forEach(ev=>removeEventListener(ev, firstGesture, true));
    if(wantOn) start();
  }
  events.forEach(ev=>addEventListener(ev, firstGesture, true));
})();
