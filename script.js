const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
let cols, drops, animationFrameId;
const SNAP = 20;

// Matrix
function resizeCanvas(){
  canvas.width = innerWidth; canvas.height = innerHeight;
  cols = Math.floor(innerWidth/16);
  drops = Array(cols).fill(0).map(()=>Math.random()*innerHeight);
}
function drawMatrix(){
  ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#0F0'; ctx.font='16px monospace';
  drops.forEach((y,i)=>{
    const charSet = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const text = charSet.charAt(Math.floor(Math.random()*charSet.length));
    ctx.fillText(text, i*16, y);
    drops[i] = y>canvas.height ? 0 : y+16;
  });
  animationFrameId=requestAnimationFrame(drawMatrix);
}

// Fetch Fact
function fetchFact(){
  fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    .then(r=>r.ok?r.json():Promise.reject())
    .then(data=>document.getElementById('fact-text').textContent=data.text)
    .catch(()=>document.getElementById('fact-text').textContent='Fact fetch failed.');
}

// Drag & Snap
document.querySelectorAll('.window').forEach(panel=>{
  const hdr=panel.querySelector('.header');
  let sx,sy,ox,oy;
  hdr.addEventListener('mousedown',e=>{
    panel.style.position='absolute';
    sx=e.clientX; sy=e.clientY;
    ox=panel.offsetLeft; oy=panel.offsetTop;
    function onMove(ev){
      panel.style.left=ox+(ev.clientX-sx)+'px';
      panel.style.top=oy+(ev.clientY-sy)+'px';
    }
    function onUp(){
      document.removeEventListener('mousemove',onMove);
      document.removeEventListener('mouseup',onUp);
      panel.style.left=Math.round(panel.offsetLeft/SNAP)*SNAP+'px';
      panel.style.top=Math.round(panel.offsetTop/SNAP)*SNAP+'px';
    }
    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onUp,{once:true});
  });
});

// Mobile Toggle
function togglePanel(id){
  const p=document.getElementById(id);
  p.style.display = (p.style.display==='flex'?'none':'flex');
}

// Init
window.addEventListener('DOMContentLoaded',()=>{
  resizeCanvas(); drawMatrix(); fetchFact();
});
window.addEventListener('resize',()=>{
  cancelAnimationFrame(animationFrameId);
  resizeCanvas(); drawMatrix();
});
