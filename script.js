//  Custom cursor 
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animCursor() {
  cursor.style.transform = `translate(${mx-5}px,${my-5}px)`;
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.transform = `translate(${rx-18}px,${ry-18}px)`;
  requestAnimationFrame(animCursor);
})();

//  Open all external links in new tab 
document.querySelectorAll('a[href^="http"]').forEach(a => {
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
});


//  Neural Network Canvas 
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');
let W, H, nodes = [], edges = [];
const NODE_COUNT = 80;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function initNodes() {
  nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2
    });
  }
}

let mouseX = W/2, mouseY = H/2;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

function drawNeural(t) {
  ctx.clearRect(0, 0, W, H);

  // Update nodes
  nodes.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    n.pulse += 0.02;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;

    // Gentle mouse attraction
    const dx = mouseX - n.x, dy = mouseY - n.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 200) {
      n.vx += dx * 0.00015;
      n.vy += dy * 0.00015;
    }
    // Speed limit
    const speed = Math.sqrt(n.vx*n.vx + n.vy*n.vy);
    if (speed > 0.8) { n.vx *= 0.8/speed; n.vy *= 0.8/speed; }
  });

  // Draw edges
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i+1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < 120) {
        const alpha = (1 - d/120) * 0.35;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  nodes.forEach(n => {
    const glow = (Math.sin(n.pulse) + 1) * 0.5;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r + glow * 1.2, 0, Math.PI*2);
    ctx.fillStyle = `rgba(56,189,248,${0.4 + glow * 0.4})`;
    ctx.fill();
  });

  requestAnimationFrame(drawNeural);
}

resize(); initNodes(); drawNeural(0);
window.addEventListener('resize', () => { resize(); initNodes(); });

//  Typewriter 
const phrases = [
  'doing competitive programming',
  'building model architecture',
  'training neural networks',
  'solving hard problems'
];
let pIdx = 0, cIdx = 0, deleting = false;
const tw = document.getElementById('typewriter');

function typewrite() {
  const phrase = phrases[pIdx];
  if (!deleting) {
    tw.textContent = phrase.slice(0, cIdx + 1);
    cIdx++;
    if (cIdx === phrase.length) { deleting = true; setTimeout(typewrite, 1800); return; }
  } else {
    tw.textContent = phrase.slice(0, cIdx - 1);
    cIdx--;
    if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
  }
  setTimeout(typewrite, deleting ? 55 : 90);
}
typewrite();

//  Scroll Reveal 
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      e.target.querySelectorAll('.bar-fill').forEach(b => {
        b.style.width = b.dataset.pct + '%';
      });
    } else {
      e.target.classList.remove('visible');
      e.target.querySelectorAll('.bar-fill').forEach(b => {
        b.style.width = '0';
      });
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .timeline-item').forEach(el => observer.observe(el));

//  Project Thumbnails 
function drawThumb(id, color1, color2, type) {
  const c = document.createElement('canvas');
  const el = document.getElementById(id);
  if (!el) return;
  c.width = el.offsetWidth || 400; c.height = 160;
  el.appendChild(c);
  const x = c.getContext('2d');

  if (type === 'neural') {
    // Neural net vis
    x.fillStyle = '#0d1424';
    x.fillRect(0,0,c.width,c.height);
    const layers = [[3,4,4,3]];
    const pts = [];
    [3,5,5,3].forEach((n,li) => {
      for (let i=0;i<n;i++) pts.push({
        x: 60 + li*(c.width-120)/3,
        y: c.height/2 - (n-1)*18 + i*36,
        l: li
      });
    });
    pts.forEach((p,i) => pts.forEach((q,j) => {
      if (q.l - p.l === 1) {
        x.beginPath(); x.moveTo(p.x,p.y); x.lineTo(q.x,q.y);
        x.strokeStyle = `rgba(${color1},0.15)`; x.lineWidth=1; x.stroke();
      }
    }));
    pts.forEach(p => {
      x.beginPath(); x.arc(p.x,p.y,5,0,Math.PI*2);
      x.fillStyle=`rgba(${color1},0.8)`; x.fill();
    });
  } else if (type === 'grid') {
    x.fillStyle='#0d1424'; x.fillRect(0,0,c.width,c.height);
    for(let i=0;i<c.width;i+=24){
      x.beginPath(); x.moveTo(i,0); x.lineTo(i,c.height);
      x.strokeStyle=`rgba(${color1},0.06)`; x.lineWidth=1; x.stroke();
    }
    for(let i=0;i<c.height;i+=24){
      x.beginPath(); x.moveTo(0,i); x.lineTo(c.width,i);
      x.strokeStyle=`rgba(${color1},0.06)`; x.lineWidth=1; x.stroke();
    }
    // Wave
    x.beginPath();
    for(let i=0;i<c.width;i++){
      const y=c.height/2+Math.sin(i*0.04)*30+Math.sin(i*0.08)*15;
      i===0?x.moveTo(i,y):x.lineTo(i,y);
    }
    x.strokeStyle=`rgba(${color1},0.7)`; x.lineWidth=2; x.stroke();
  } else {
    x.fillStyle='#0d1424'; x.fillRect(0,0,c.width,c.height);
    // Bars
    const bars = [60,85,45,90,70,55,80];
    bars.forEach((h,i) => {
      const bw=24, gap=16;
      const bx=32+i*(bw+gap), by=c.height-20-h*0.7;
      const grad = x.createLinearGradient(bx,by,bx,c.height-20);
      grad.addColorStop(0,`rgba(${color1},0.9)`);
      grad.addColorStop(1,`rgba(${color2},0.3)`);
      x.fillStyle=grad;
      x.fillRect(bx,by,bw,h*0.7);
    });
  }
}

setTimeout(() => {
  drawThumb('thumb1','56,189,248','129,140,248','neural');
  drawThumb('thumb2','52,211,153','56,189,248','grid');
  drawThumb('thumb3','129,140,248','56,189,248','bars');
}, 100);

// Hamburger 
const ham = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
ham.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const form = e.target;
  btn.textContent = 'Sending...';
  btn.disabled = true;

  const data = {
    name:    form.querySelector('[name="name"]').value,
    email:   form.querySelector('[name="email"]').value,
    subject: form.querySelector('[name="subject"]').value,
    message: form.querySelector('[name="message"]').value,
  };

  try {
    const [formspreeRes] = await Promise.all([
      fetch('https://formspree.io/f/meerbdkb', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }),
      fetch('https://script.google.com/macros/s/AKfycbzxQb-gIPH2tL94rXkmHwQXSwWvbKReLhfkb_l-tszlZHOVfs1T4uEm8-XJvm5xjzPNFA/exec', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors'
      })
    ]);

    if (formspreeRes.ok) {
      btn.textContent = 'Sent! ✓';
      btn.style.background = 'var(--accent3)';
      form.reset();
    } else {
      btn.textContent = 'Failed — try again';
      btn.style.background = '#ef4444';
    }

  } catch (err) {
    console.error('Error:', err);
    btn.textContent = 'Failed — try again';
    btn.style.background = '#ef4444';
  }

  setTimeout(() => {
    btn.textContent = 'Send Message →';
    btn.style.background = '';
    btn.disabled = false;
  }, 3000);
}

//  Certificate Modal 
const viewModal = document.createElement('div');
viewModal.className = 'view-modal';
viewModal.innerHTML = `
  <div class="view-modal-inner">
    <div class="view-modal-header">
      <span class="view-modal-title" id="view-modal-title">viewificate</span>
      <div class="view-modal-actions">
        <button class="view-modal-close" onclick="closeview()">✕</button>
      </div>
    </div>
    <div class="view-modal-body">
      <iframe id="view-iframe" src=""></iframe>
    </div>
  </div>
`;
document.body.appendChild(viewModal);

function openView(path) {
  document.getElementById('view-iframe').src = path;
  const name = path.split('/').pop().replace('.pdf','').replace(/[-_]/g,' ');
  document.getElementById('view-modal-title').textContent = name;
  viewModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeview() {
  viewModal.classList.remove('open');
  document.getElementById('view-iframe').src = '';
  document.body.style.overflow = '';
}

viewModal.addEventListener('click', (e) => {
  if (e.target === viewModal) closeview();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeview();
});

