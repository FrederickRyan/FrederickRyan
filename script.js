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
  } else if (type==='bars') {
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
  } else if (type === 'path') {
    // OpenPath — connected node map
    x.fillStyle = '#0d1424'; x.fillRect(0, 0, c.width, c.height);
    const nodes = [
      {x: 60,  y: 80},  {x: 150, y: 40},  {x: 150, y: 120},
      {x: 260, y: 60},  {x: 260, y: 100}, {x: 370, y: 80}
    ];
    const edges = [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5]];
    edges.forEach(([a,b]) => {
      const cx = (nodes[a].x + nodes[b].x) / 2;
      const cy = (nodes[a].y + nodes[b].y) / 2 - 20;
      x.beginPath();
      x.moveTo(nodes[a].x, nodes[a].y);
      x.quadraticCurveTo(cx, cy, nodes[b].x, nodes[b].y);
      x.strokeStyle = `rgba(${color1},0.3)`; x.lineWidth = 1.5; x.stroke();
    });
    nodes.forEach((n, i) => {
      x.beginPath(); x.arc(n.x, n.y, i === 0 || i === 5 ? 8 : 5, 0, Math.PI * 2);
      x.fillStyle = i === 0 || i === 5
        ? `rgba(${color1},1)` : `rgba(${color1},0.5)`;
      x.fill();
      if (i === 0 || i === 5) {
        x.beginPath(); x.arc(n.x, n.y, 13, 0, Math.PI * 2);
        x.strokeStyle = `rgba(${color1},0.2)`; x.lineWidth = 1.5; x.stroke();
      }
    });

  } else if (type === 'vinyl') {
    // Willify — vinyl record + equalizer bars
    x.fillStyle = '#0d1424'; x.fillRect(0, 0, c.width, c.height);
    const cx2 = 100, cy2 = c.height / 2, r = 55;
    for (let ring = r; ring > 10; ring -= 6) {
      x.beginPath(); x.arc(cx2, cy2, ring, 0, Math.PI * 2);
      x.strokeStyle = `rgba(${color1},${ring === r ? 0.4 : 0.07})`; x.lineWidth = 1; x.stroke();
    }
    x.beginPath(); x.arc(cx2, cy2, 10, 0, Math.PI * 2);
    x.fillStyle = `rgba(${color1},0.9)`; x.fill();
    x.beginPath(); x.arc(cx2, cy2, 4, 0, Math.PI * 2);
    x.fillStyle = '#0d1424'; x.fill();
    // Equalizer bars
    const heights = [30, 55, 40, 70, 50, 35, 60, 45];
    heights.forEach((h, i) => {
      const bx = 190 + i * 22, bw = 12;
      const grad = x.createLinearGradient(bx, cy2 - h, bx, cy2 + h);
      grad.addColorStop(0, `rgba(${color1},0.9)`);
      grad.addColorStop(1, `rgba(${color2},0.2)`);
      x.fillStyle = grad;
      x.fillRect(bx, cy2 - h, bw, h * 2);
    });

  } else if (type === 'dungeon') {
    // Slay The Spores — dungeon grid map
    x.fillStyle = '#0d1424'; x.fillRect(0, 0, c.width, c.height);
    const rooms = [
      {x: 1, y: 1, w: 3, h: 2},
      {x: 5, y: 0, w: 2, h: 2},
      {x: 5, y: 3, w: 2, h: 2},
      {x: 8, y: 1, w: 3, h: 3},
      {x: 12, y: 2, w: 2, h: 2},
    ];
    const corridors = [
      {x: 4, y: 1, w: 1, h: 1}, {x: 4, y: 3, w: 1, h: 1},
      {x: 7, y: 2, w: 1, h: 1}, {x: 11, y: 2, w: 1, h: 1},
    ];
    const cell = 18, ox = 20, oy = 20;
    [...corridors, ...rooms].forEach((r, i) => {
      x.fillStyle = i < corridors.length
        ? `rgba(${color1},0.15)` : `rgba(${color1},0.12)`;
      x.fillRect(ox + r.x * cell, oy + r.y * cell, r.w * cell, r.h * cell);
      x.strokeStyle = `rgba(${color1},0.4)`; x.lineWidth = 1;
      x.strokeRect(ox + r.x * cell, oy + r.y * cell, r.w * cell, r.h * cell);
    });
    // Player dot in first room
    x.beginPath(); x.arc(ox + 2.5 * cell, oy + 2 * cell, 4, 0, Math.PI * 2);
    x.fillStyle = `rgba(${color1},1)`; x.fill();
    // Enemy X in last room
    const ex = ox + 13 * cell, ey = oy + 3 * cell;
    x.strokeStyle = `rgba(${color2},0.9)`; x.lineWidth = 2;
    x.beginPath(); x.moveTo(ex - 4, ey - 4); x.lineTo(ex + 4, ey + 4); x.stroke();
    x.beginPath(); x.moveTo(ex + 4, ey - 4); x.lineTo(ex - 4, ey + 4); x.stroke();
  } else if (type === 'charity') {
    // TangCare — hyperlocal map with donor pins
    x.fillStyle = '#0d1424'; x.fillRect(0, 0, c.width, c.height);

    // Faint map grid tiles
    for (let i = 0; i < c.width; i += 32) {
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i, c.height);
      x.strokeStyle = `rgba(${color1},0.05)`; x.lineWidth = 1; x.stroke();
    }
    for (let i = 0; i < c.height; i += 32) {
      x.beginPath(); x.moveTo(0, i); x.lineTo(c.width, i);
      x.strokeStyle = `rgba(${color1},0.05)`; x.lineWidth = 1; x.stroke();
    }

    // Faint road lines
    const roads = [
      [0, 55, c.width, 80], [0, 110, c.width, 95],
      [120, 0, 110, c.height], [280, 0, 260, c.height]
    ];
    roads.forEach(([x1,y1,x2,y2]) => {
      x.beginPath(); x.moveTo(x1,y1); x.lineTo(x2,y2);
      x.strokeStyle = `rgba(${color1},0.08)`; x.lineWidth = 6; x.stroke();
    });

    // Pulse rings + pins
    const pins = [
      {px: 110, py: 75,  main: true},
      {px: 260, py: 95,  main: false},
      {px: 180, py: 130, main: false},
      {px: 340, py: 55,  main: false},
    ];
    pins.forEach(({px, py, main}) => {
      // Pulse ring
      x.beginPath(); x.arc(px, py, main ? 22 : 14, 0, Math.PI * 2);
      x.strokeStyle = `rgba(${color1},${main ? 0.2 : 0.1})`; x.lineWidth = 1; x.stroke();
      x.beginPath(); x.arc(px, py, main ? 14 : 8, 0, Math.PI * 2);
      x.strokeStyle = `rgba(${color1},${main ? 0.35 : 0.2})`; x.lineWidth = 1; x.stroke();

      // Pin body (teardrop)
      x.beginPath();
      x.arc(px, py - 4, main ? 7 : 5, 0, Math.PI * 2);
      x.fillStyle = `rgba(${color1},${main ? 1 : 0.6})`; x.fill();
      x.beginPath();
      x.moveTo(px - (main?4:3), py - 2);
      x.lineTo(px, py + (main?10:7));
      x.lineTo(px + (main?4:3), py - 2);
      x.fillStyle = `rgba(${color1},${main ? 1 : 0.6})`; x.fill();

      // Dot inside pin
      x.beginPath(); x.arc(px, py - 4, main ? 2.5 : 2, 0, Math.PI * 2);
      x.fillStyle = '#0d1424'; x.fill();
    });

    // Connecting dashed lines between pins
    [[pins[0], pins[1]], [pins[1], pins[2]], [pins[0], pins[3]]].forEach(([a,b]) => {
      x.setLineDash([3, 5]);
      x.beginPath(); x.moveTo(a.px, a.py); x.lineTo(b.px, b.py);
      x.strokeStyle = `rgba(${color1},0.2)`; x.lineWidth = 1; x.stroke();
      x.setLineDash([]);
    });
  }
}

setTimeout(() => {
  drawThumb('thumb1', '56,189,248',  '129,140,248', 'neural');
  drawThumb('thumb2', '52,211,153',  '56,189,248',  'grid');
  drawThumb('thumb3', '129,140,248', '56,189,248',  'bars');
  drawThumb('thumb4', '52,211,153',  '129,140,248', 'path');
  drawThumb('thumb5', '248,113,113', '251,191,36',  'vinyl');
  drawThumb('thumb6', '251,191,36',  '248,113,113', 'dungeon');
  drawThumb('thumb7', '251,146,60', '52,211,153', 'charity');
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

