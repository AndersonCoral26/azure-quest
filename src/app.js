(() => {
'use strict';

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pct = x => Math.round(x * 100);
const DAY = 864e5;
const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const LETTERS = 'ABCDEFGH';

const I = {
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/>',
  repeat: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/>',
  exam: '<path d="M9 4h6m-7 2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm1 6 2 2 4-4m-6 8h6"/>',
  chart: '<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/>',
  fire: '<path d="M12 22c4 0 7-2.7 7-7 0-3.6-2.4-6-4.2-8.3-.5 2-1.6 3.2-2.8 3.8.3-2.9-.8-5.7-3.3-8.5-.4 3.8-4.7 6.4-4.7 13 0 4.3 3.4 7 8 7Z" fill="currentColor" stroke="none"/>',
  star: '<path d="m12 2.8 2.8 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.6-4.4 6.3-.8Z" fill="currentColor" stroke="none"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  flag: '<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  cards: '<rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 16a2 2 0 0 1 2-2h13v2"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  left: '<path d="m15 6-6 6 6 6"/>',
  crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8Z"/>',
  bulb: '<path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
  warn: '<path d="M12 3 2 20h20L12 3Zm0 6v5m0 3v.5"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 8.5a4.8 4.8 0 0 1-.5 9.5H7Z"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9H4Zm12.5-.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0V4Zm0 2H4a4 4 0 0 0 4 4m8-4h4a4 4 0 0 1-4 4m-4 4v4m-4 3h8"/>'
};
const ic = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

/* ---------- voz (Web Speech API del dispositivo) ---------- */
const TTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? window.speechSynthesis : null;
let voice = null, sayK = null, sayN = 0, saySeq = 0;
const pickVoice = () => {
  const score = v => (/premium|enhanced|natural|neural|mejorad/i.test(v.name) ? 4 : 0) + (/google|m[oó]nica|paulina|helena|sabina|dalia|elvira/i.test(v.name) ? 2 : 0) + (/^es[-_](MX|US|419|CO|PE)/i.test(v.lang) ? 1 : 0) + (v.localService ? 1 : 0);
  voice = TTS.getVoices().filter(v => /^es/i.test(v.lang)).sort((a, b) => score(b) - score(a))[0] || null;
};
if (TTS) { pickVoice(); TTS.addEventListener?.('voiceschanged', pickVoice); }
const plain = s => String(s ?? '').replace(/\*\*|`/g, '').replace(/\s*\n+\s*/g, '. ');
const sayHtml = k => TTS ? `<button class="say ${sayK === k ? 'on' : ''}" data-say="${esc(k)}" aria-label="Escuchar" title="Escuchar">${ic('sound')}</button>` : '';
const sayMark = (k, on) => $$('[data-say]').forEach(b => { if (b.dataset.say === k) b.classList.toggle('on', on); });
function stopSay() { if (!TTS) return; sayN++; TTS.cancel(); if (sayK) sayMark(sayK, false); sayK = null; }
function say(k, text) {
  if (sayK === k) { stopSay(); return; }
  stopSay();
  const n = sayN, parts = plain(text).replace(/\bvs\./gi, 'versus').replace(/\s*=\s*/g, ' es ').replace(/\s*\/\s*/g, ', ').replace(/([.!?;:])(\s*\.)+/g, '$1').split(/(?<=[.!?;])\s+/).map(t => t.trim()).filter(Boolean);
  if (!parts.length) return;
  sayK = k; sayMark(k, true);
  const end = () => { if (sayN === n) { sayMark(k, false); sayK = null; } };
  // frases cortas: Chrome corta los textos largos a los ~15 s
  parts.forEach((t, i) => {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = voice ? voice.lang : 'es-ES'; if (voice) u.voice = voice;
    if (i === parts.length - 1) { u.onend = end; u.onerror = end; }
    TTS.speak(u);
  });
}
function bindSay(root, texts) { $$('[data-say]', root).forEach(b => b.onclick = e => { e.stopPropagation(); say(b.dataset.say, texts[b.dataset.say]); }); }
// texto a leer de cada bloque de teoría (los interactivos no se leen)
function blockSpeech(b) {
  const t = b.title ? b.title + '. ' : '';
  switch (b.type) {
    case 'text': return t + b.body;
    case 'analogy': return 'Analogía. ' + b.body;
    case 'trap': return 'Trampa de examen. ' + b.body;
    case 'keypoints': return 'Para el examen recuerda. ' + b.items.map(x => plain(x).replace(/[.;]?$/, '.')).join(' ');
    case 'cards': return t + b.items.map(c => `${plain(c.title)}. ${plain(c.body)}`.replace(/[.;]?$/, '.')).join(' ');
    case 'flip': return t + b.items.map(c => `${plain(c.front)}: ${plain(c.back)}`.replace(/[.;]?$/, '.')).join(' ');
    case 'compare': return t + b.rows.map(r => plain(r[0]) + '. ' + r.slice(1).map((c, k) => `${plain(b.head[k + 1])}: ${plain(c)}`).join('; ') + '.').join(' ');
  }
  return '';
}
function qSpeech(p) {
  let t = plain(p.q).replace('___', 'espacio en blanco');
  if (p.o) t += ' ' + p.o.map((o, i) => `${LETTERS[i]}: ${plain(o)}.`).join(' ');
  if (p.s) t += ' ' + p.s.map((s, i) => `Afirmación ${i + 1}: ${plain(s.text)}.`).join(' ');
  if (p.left) t += ' Relaciona: ' + p.left.map(plain).join('; ') + '. Con: ' + p.right.map(plain).join('; ') + '.';
  return t;
}

/* ---------- contenido ---------- */
const WORLDS = ((window.AZ && window.AZ.worlds) || []).slice().sort((a, b) => a.order - b.order);
const LEVELS = [], QS = new Map(), QLEVEL = new Map(), LWORLD = new Map();
WORLDS.forEach(w => w.levels.forEach(l => {
  LEVELS.push(l); LWORLD.set(l.id, w);
  l.questions.forEach((q, k) => { q.id = l.id + '#' + k; QS.set(q.id, q); QLEVEL.set(q.id, l); });
}));
const SHARE_SUM = WORLDS.reduce((s, w) => s + w.share, 0) || 1;

/* ---------- estado ---------- */
const KEY = 'azure-quest-v1';
const blank = () => ({ v: 1, xp: 0, streak: { n: 0, last: '' }, levels: {}, bosses: {}, q: {}, exams: [], lastExam: null, draft: null, badges: {}, stats: { answered: 0, correct: 0 }, bolt: 0, free: false });
let S = blank();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch (e) { /* almacenamiento no disponible */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sin persistencia */ } };

function touch() {
  const t = today(), y = today(new Date(Date.now() - DAY));
  if (S.streak.last === t) return;
  S.streak.n = S.streak.last === y ? S.streak.n + 1 : 1;
  S.streak.last = t;
  if (S.streak.n >= 3) award('streak3');
  if (S.streak.n >= 7) award('streak7');
}
const streakNow = () => (S.streak.last === today() || S.streak.last === today(new Date(Date.now() - DAY))) ? S.streak.n : 0;

const BOX_DAYS = [0, 1, 3, 7, 14];
function record(q, frac) {
  const r = S.q[q.id] || (S.q[q.id] = { n: 0, c: 0 });
  const ok = frac >= 1;
  r.n++; if (ok) r.c++; r.last = ok ? 1 : 0;
  S.stats.answered++; if (ok) S.stats.correct++;
  if (!ok) { r.box = 0; r.due = Date.now(); }
  else if (r.box != null) {
    r.box++;
    if (r.box >= BOX_DAYS.length) { delete r.box; delete r.due; } else r.due = Date.now() + BOX_DAYS[r.box] * DAY;
  }
  if (S.stats.correct >= 100) award('q100');
  touch();
}
const dueList = () => Object.entries(S.q).filter(([id, r]) => r.box != null && r.due <= Date.now() && QS.has(id)).map(([id]) => QS.get(id));
const deckSize = () => Object.entries(S.q).filter(([id, r]) => r.box != null && QS.has(id)).length;

function addXP(n) { if (n <= 0) return; S.xp += n; toast(`+${n} XP`, 'star'); }

/* ---------- progreso ---------- */
const lvlSt = l => S.levels[l.id] || {};
const isOpen = l => { if (S.free) return true; const i = LEVELS.indexOf(l); return i === 0 || !!lvlSt(LEVELS[i - 1]).passed; };
const levelState = l => lvlSt(l).passed ? 'done' : isOpen(l) ? 'open' : 'locked';
const bossOpen = w => S.free || w.levels.every(l => lvlSt(l).passed);
const nextLevel = () => LEVELS.find(l => !lvlSt(l).passed && isOpen(l));
const mastery = l => l.questions.filter(q => S.q[q.id]?.last === 1).length / l.questions.length;
const worldReady = w => w.levels.reduce((s, l) => s + mastery(l), 0) / w.levels.length;
const predicted = () => Math.round(1000 * WORLDS.reduce((s, w) => s + w.share * worldReady(w), 0) / SHARE_SUM);

const BADGES = [
  { id: 'first', name: 'Despegue', desc: 'Aprueba tu primer nivel', icon: 'cloud' },
  ...WORLDS.map((w, i) => ({ id: 'world-' + w.id, name: `Mundo ${i + 1}`, desc: 'Aprueba todos sus niveles', icon: 'map' })),
  ...WORLDS.map((w, i) => ({ id: 'boss-' + w.id, name: `Jefe ${i + 1}`, desc: 'Vence el examen del mundo', icon: 'crown' })),
  { id: 'perfect', name: 'Sin fallos', desc: 'Quiz perfecto', icon: 'target' },
  { id: 'streak3', name: 'Racha 3', desc: '3 días seguidos', icon: 'fire' },
  { id: 'streak7', name: 'Racha 7', desc: '7 días seguidos', icon: 'fire' },
  { id: 'q100', name: 'Centenario', desc: '100 aciertos', icon: 'check' },
  { id: 'bolt10', name: 'Relámpago', desc: '10+ en 60 s', icon: 'bolt' },
  { id: 'exam', name: 'Simulacro', desc: 'Termina un simulacro', icon: 'exam' },
  { id: 'pass', name: 'Aprobado', desc: '700+ en simulacro completo', icon: 'trophy' },
  { id: 'ace', name: 'Experto', desc: '900+ en simulacro completo', icon: 'star' }
];
function award(id) {
  if (S.badges[id]) return;
  S.badges[id] = today();
  const b = BADGES.find(x => x.id === id);
  if (b) setTimeout(() => toast('Insignia: ' + b.name, 'trophy'), 500);
}

/* ---------- UI base ---------- */
const app = $('#app');
let cleanup = [];
function onLeave(fn) { cleanup.push(fn); }
function mount(html, fullscreen) {
  stopSay();
  cleanup.forEach(f => f()); cleanup = [];
  closeSheet();
  document.body.classList.toggle('fs', !!fullscreen);
  $('.dock')?.remove();
  app.innerHTML = html;
  window.scrollTo(0, 0);
}
function dock(html, cls = '') {
  let d = $('.dock');
  if (!d) { d = document.createElement('div'); document.body.appendChild(d); }
  d.className = 'dock ' + cls; d.innerHTML = `<div class="in">${html}</div>`;
  return d;
}
function toast(msg, icon) {
  const t = document.createElement('div');
  t.innerHTML = (icon ? ic(icon) : '') + esc(msg);
  $('#toast').appendChild(t);
  setTimeout(() => t.remove(), 2200);
}
function sheet(html, bind) {
  closeSheet();
  const s = document.createElement('div'); s.id = 'sheet';
  s.innerHTML = `<div class="pane" role="dialog" aria-modal="true">${html}</div>`;
  s.addEventListener('click', e => { if (e.target === s) closeSheet(); });
  document.body.appendChild(s);
  bind && bind(s);
  return s;
}
function closeSheet() { $('#sheet')?.remove(); }
function confirmSheet(title, text, okLabel, onOk, danger) {
  sheet(`<h2>${esc(title)}</h2><p class="muted">${esc(text)}</p><div class="row"><button class="btn ghost" data-no>Cancelar</button><button class="btn ${danger ? 'bad' : ''}" data-ok>${esc(okLabel)}</button></div>`,
    s => { $('[data-no]', s).onclick = closeSheet; $('[data-ok]', s).onclick = () => { closeSheet(); onOk(); }; });
}
const stars = (n, cls = '') => `<span class="stars ${cls}">${[1, 2, 3].map(i => ic('star', i <= n ? 'on' : '')).join('')}</span>`;
const topbar = (frac, count) => `<div class="top"><button class="icon-btn" data-close aria-label="Salir">${ic('x')}</button><div class="track"><i style="width:${pct(frac)}%"></i></div><span class="count">${count}</span></div>`;

/* ---------- pestañas ---------- */
let tab = 'home';
function renderTabs() {
  const due = dueList().length;
  $('#tabs').innerHTML = `<div class="in">${[['home', 'map', 'Ruta'], ['review', 'repeat', 'Repasar'], ['exam', 'exam', 'Simulacro'], ['progress', 'chart', 'Progreso']]
    .map(([id, i, n]) => `<button data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''}>${ic(i)}${n}${id === 'review' && due ? `<span class="dot mono">${due}</span>` : ''}</button>`).join('')}</div>`;
  $$('#tabs [data-tab]').forEach(b => b.onclick = () => go(b.dataset.tab));
}
function go(t) { tab = t; save(); ({ home: Home, review: Review, exam: ExamHome, progress: Progress })[t](); renderTabs(); }

/* ---------- inicio / ruta ---------- */
function gauge(score) {
  const a = Math.min(score, 1000) / 1000, R = 52, cx = 60, cy = 62;
  const pt = t => [cx - R * Math.cos(Math.PI * t), cy - R * Math.sin(Math.PI * t)];
  const [x1, y1] = pt(a), [mx, my] = pt(.7), [mx2, my2] = [cx - (R + 9) * Math.cos(Math.PI * .7), cy - (R + 9) * Math.sin(Math.PI * .7)];
  return `<div class="gauge"><svg viewBox="0 0 120 72"><path d="M8 62a52 52 0 0 1 104 0" stroke="var(--line)" stroke-width="10" fill="none" stroke-linecap="round"/>
  ${a > 0 ? `<path d="M8 62A52 52 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${score >= 700 ? 'var(--ok)' : 'var(--accent)'}" stroke-width="10" fill="none" stroke-linecap="round"/>` : ''}
  <line x1="${mx.toFixed(1)}" y1="${my.toFixed(1)}" x2="${mx2.toFixed(1)}" y2="${my2.toFixed(1)}" stroke="var(--ink)" stroke-width="2"/></svg>
  <b>${score}<small>de 1000 · meta 700</small></b></div>`;
}
function Home() {
  const nl = nextLevel(), w = nl && LWORLD.get(nl.id);
  const d = S.draft;
  let hero;
  if (d) hero = `<div class="hero"><span class="eyebrow">Simulacro en curso</span><h2>Te quedan ${Math.max(0, Math.ceil((d.end - Date.now()) / 60000))} min</h2><p>${d.ans.filter(a => a != null).length} de ${d.ps.length} preguntas respondidas.</p><button class="btn" data-resume>Continuar simulacro</button></div>`;
  else if (nl) {
    const st = lvlSt(nl);
    hero = `<div class="hero"><span class="eyebrow">Mundo ${w.order} · Nivel ${w.levels.indexOf(nl) + 1}</span><h2>${esc(nl.title)}</h2><p>${esc(nl.goal)}</p><button class="btn" data-level="${nl.id}">${st.lesson ? 'Hacer el quiz' : 'Empezar lección'} ${ic('chev')}</button></div>`;
  } else hero = `<div class="hero"><span class="eyebrow">Ruta completada</span><h2>Ya pasaste todos los niveles</h2><p>Ahora toca el simulacro de 50 preguntas en 45 minutos.</p><button class="btn" data-goexam>Ir al simulacro ${ic('chev')}</button></div>`;

  mount(`
  <header class="head"><div class="brand"><div class="logo">${ic('cloud')}</div><div><h1>Azure Quest</h1><small>AZ-900 · JUL 2026</small></div></div>
  <div class="chips"><span class="chip fire" title="Racha de días">${ic('fire')}${streakNow()}</span><span class="chip xp" title="Experiencia">${ic('star')}${S.xp}</span></div></header>
  ${hero}
  <section class="card ready">${gauge(predicted())}<div class="wbars">${WORLDS.map(w => `<div class="wbar"><div class="lbl"><span>${esc(w.title)}</span><span class="mono">${pct(worldReady(w))}%</span></div><div class="track ${worldReady(w) >= .8 ? 'ok' : ''}"><i style="width:${pct(worldReady(w))}%"></i></div></div>`).join('')}</div></section>
  ${WORLDS.map(w => `<section class="world">
    <div class="world-h"><div class="er"><span class="eyebrow">Mundo ${w.order}</span><span class="w">${esc(w.weight)} del examen</span></div><h2>${esc(w.title)}</h2></div>
    <div class="path">${w.levels.map((l, i) => {
      const s = levelState(l), st = lvlSt(l);
      return `<button class="lvl ${s}" data-level="${l.id}" ${s === 'locked' ? 'aria-disabled="true"' : ''}><span class="node">${s === 'done' ? ic('check') : s === 'locked' ? ic('lock') : i + 1}</span><span class="t"><b>${esc(l.title)}</b><small>${s === 'locked' ? 'Aprueba el nivel anterior' : `${l.minutes || 6} min · ${l.questions.length} preguntas · dominio ${pct(mastery(l))}%`}</small></span>${stars(st.stars || 0)}</button>`;
    }).join('')}
    <button class="lvl boss ${S.bosses[w.id]?.passed ? 'done' : bossOpen(w) ? 'open' : 'locked'}" data-boss="${w.id}"><span class="node">${S.bosses[w.id]?.passed ? ic('check') : bossOpen(w) ? ic('crown') : ic('lock')}</span><span class="t"><b>Jefe del mundo</b><small>${bossOpen(w) ? `20 preguntas de todo el mundo · aprueba con 75%${S.bosses[w.id] ? ` · mejor ${pct(S.bosses[w.id].best)}%` : ''}` : 'Completa todos los niveles'}</small></span><span></span></button>
    </div></section>`).join('')}
  `);
  $$('[data-level]').forEach(b => b.onclick = () => { const l = LEVELS.find(x => x.id === b.dataset.level); if (isOpen(l)) Level(l); else toast('Aprueba primero el nivel anterior', 'lock'); });
  $$('[data-boss]').forEach(b => b.onclick = () => { const w = WORLDS.find(x => x.id === b.dataset.boss); if (bossOpen(w)) Boss(w); else toast('Completa todos los niveles del mundo', 'lock'); });
  $('[data-resume]') && ($('[data-resume]').onclick = () => ExamRun());
  $('[data-goexam]') && ($('[data-goexam]').onclick = () => go('exam'));
}

/* ---------- nivel ---------- */
function Level(l) {
  const w = LWORLD.get(l.id), st = lvlSt(l);
  const kp = l.lesson.find(b => b.type === 'keypoints');
  mount(`${topbar(mastery(l), pct(mastery(l)) + '%')}
  <div class="lvl-hero"><span class="eyebrow">Mundo ${w.order} · ${esc(w.title)}</span><h1>${esc(l.title)}</h1><p class="goal">${esc(l.goal)}</p>${st.stars ? stars(st.stars) : ''}</div>
  <div class="opts-list">
    <button class="card action" data-a="lesson"><span class="ic">${ic('book')}</span><span><b>${st.lesson ? 'Repasar la lección' : 'Lección interactiva'}</b><small>${l.minutes || 6} min · ${l.lesson.length} pasos${st.lesson ? ' · completada' : ''}</small></span><span class="go">${ic('chev')}</span></button>
    <button class="card action" data-a="quiz"><span class="ic">${ic('target')}</span><span><b>Quiz del nivel</b><small>10 preguntas · aprueba con 80%${st.best != null ? ` · mejor ${pct(st.best)}%` : ''}</small></span><span class="go">${ic('chev')}</span></button>
  </div>
  ${kp ? `<div class="blk say-on">${sayHtml('kp:' + l.id)}<div class="kp"><span class="eyebrow">Para el examen recuerda</span><ul>${kp.items.map(t => `<li>${ic('check')}<span>${fmt(t)}</span></li>`).join('')}</ul></div></div>` : ''}`, true);
  if (kp) bindSay(app, { ['kp:' + l.id]: blockSpeech(kp) });
  $('[data-close]').onclick = () => go('home');
  $('[data-a=lesson]').onclick = () => Lesson(l);
  $('[data-a=quiz]').onclick = () => {
    if (!st.lesson) confirmSheet('¿Saltar la lección?', 'La lección dura unos minutos y prepara el quiz. Puedes hacer el quiz directamente si ya dominas el tema.', 'Ir al quiz', () => LevelQuiz(l));
    else LevelQuiz(l);
  };
}

/* ---------- lección ---------- */
function Lesson(l) {
  const blocks = l.lesson, reread = !!lvlSt(l).lesson;
  let cur = reread ? blocks.length - 1 : 0;
  mount(`${topbar(0, '')}<div class="lesson" id="lesson"></div>`, true);
  $('[data-close]').onclick = () => Level(l);
  const box = $('#lesson'), done = new Set();
  const update = () => {
    $('.top .track i').style.width = pct((cur + 1) / blocks.length) + '%';
    $('.top .count').textContent = `${cur + 1}/${blocks.length}`;
    const last = cur >= blocks.length - 1, ready = done.has(cur);
    dock(`<button class="btn block" id="next" ${ready ? '' : 'disabled'}>${last ? 'Hacer el quiz' : ready ? 'Continuar' : 'Completa el ejercicio'}</button>`);
    $('#next').onclick = () => {
      if (last) { finishLesson(); LevelQuiz(l); return; }
      cur++; addBlock(cur); update();
      box.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  };
  const finishLesson = () => { if (!lvlSt(l).lesson) { S.levels[l.id] = { ...lvlSt(l), lesson: true }; addXP(20); touch(); save(); } };
  const addBlock = i => {
    const el = document.createElement('div'); el.className = 'blk'; el.style.scrollMarginTop = '70px';
    box.appendChild(el);
    renderBlock(blocks[i], el, () => { done.add(i); if (i === cur) update(); });
  };
  for (let i = 0; i <= cur; i++) addBlock(i);
  if (reread) blocks.forEach((_, i) => done.add(i));
  update();
}

function renderBlock(b, el, complete) {
  const title = b.title ? `<h3>${fmt(b.title)}</h3>` : '';
  switch (b.type) {
    case 'text':
      el.innerHTML = `${title}<p class="body">${fmt(b.body)}</p>`; complete(); break;
    case 'analogy':
      el.innerHTML = `<div class="callout analogy"><span class="eyebrow">${ic('bulb')}Analogía</span><p>${fmt(b.body)}</p></div>`; complete(); break;
    case 'trap':
      el.innerHTML = `<div class="callout trap"><span class="eyebrow">${ic('warn')}Trampa de examen</span><p>${fmt(b.body)}</p></div>`; complete(); break;
    case 'keypoints':
      el.innerHTML = `<div class="kp"><span class="eyebrow">Para el examen recuerda</span><ul>${b.items.map(t => `<li>${ic('check')}<span>${fmt(t)}</span></li>`).join('')}</ul></div>`; complete(); break;
    case 'cards': {
      el.innerHTML = `${title}<div class="carousel">${b.items.map((c, i) => `<div class="ccard"><span class="n">${i + 1} / ${b.items.length}</span><b>${fmt(c.title)}</b><p>${fmt(c.body)}</p></div>`).join('')}</div><div class="dots">${b.items.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>`;
      const car = $('.carousel', el), dots = $$('.dots i', el);
      car.addEventListener('scroll', () => { const i = Math.round(car.scrollLeft / (car.firstElementChild.offsetWidth + 10)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });
      complete(); break;
    }
    case 'flip':
      el.innerHTML = `${title}<p class="hint">Toca cada tarjeta para voltearla.</p><div class="flips">${b.items.map(c => `<button class="flip"><span class="in"><span class="f">${fmt(c.front)}<small>Toca para ver</small></span><span class="b">${fmt(c.back)}</span></span></button>`).join('')}</div>`;
      $$('.flip', el).forEach(f => f.onclick = () => f.classList.toggle('on'));
      complete(); break;
    case 'compare':
      el.innerHTML = `${title}<div class="tbl"><table><thead><tr>${b.head.map(h => `<th>${fmt(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      complete(); break;
    case 'check': {
      const order = shuffle(b.o.map((_, i) => i));
      el.innerHTML = `<span class="eyebrow">Comprueba</span><h3>${fmt(b.q)}</h3><div class="opts">${order.map((oi, k) => `<button class="opt" data-i="${oi}"><span class="k">${LETTERS[k]}</span><span>${fmt(b.o[oi])}</span></button>`).join('')}</div><div class="why" hidden>${fmt(b.why)}</div>`;
      $$('.opt', el).forEach(o => o.onclick = () => {
        const i = +o.dataset.i;
        $$('.opt', el).forEach(x => { x.disabled = true; if (+x.dataset.i === b.a) x.classList.add('right'); });
        if (i !== b.a) o.classList.add('wrong');
        $('.why', el).hidden = false; complete();
      });
      break;
    }
    case 'sort': {
      const items = shuffle(b.items.map((it, i) => ({ ...it, i })));
      el.innerHTML = `${title}<p class="hint">Toca una tarjeta y luego la categoría donde va.</p><div class="pool">${items.map(it => `<button class="tag" data-i="${it.i}">${fmt(it.text)}</button>`).join('')}</div>
        <div class="buckets">${b.buckets.map((n, k) => `<button class="bucket" data-b="${k}"><span>${fmt(n)}</span><div class="got"></div></button>`).join('')}</div><p class="done-note" hidden>${ic('check')}¡Todo clasificado!</p>`;
      let sel = null, left = items.length;
      $$('.pool .tag', el).forEach(t => t.onclick = () => { $$('.pool .tag', el).forEach(x => x.classList.remove('sel')); sel = t; t.classList.add('sel'); });
      $$('.bucket', el).forEach(bk => bk.onclick = () => {
        if (!sel) { toast('Primero elige una tarjeta'); return; }
        const it = b.items[+sel.dataset.i];
        if (it.bucket === +bk.dataset.b) {
          sel.classList.remove('sel'); sel.classList.add('placed'); sel.onclick = null; $('.got', bk).appendChild(sel); sel = null;
          if (--left === 0) { $('.done-note', el).hidden = false; complete(); }
        } else {
          [bk, sel].forEach(x => { x.classList.remove('shake'); void x.offsetWidth; x.classList.add('shake', 'flash-bad'); setTimeout(() => x.classList.remove('flash-bad'), 450); });
        }
      });
      break;
    }
    case 'order': {
      const items = shuffle(b.items.map((t, i) => ({ t, i })));
      el.innerHTML = `${title}<p class="hint">Toca los elementos en orden, del primero al último.</p><div class="seq"></div><div class="pool">${items.map(it => `<button class="tag" data-i="${it.i}">${fmt(it.t)}</button>`).join('')}</div><p class="done-note" hidden>${ic('check')}¡Orden correcto!</p>`;
      let next = 0;
      $$('.pool .tag', el).forEach(t => t.onclick = () => {
        if (+t.dataset.i === next) {
          const d = document.createElement('div'); d.className = 'it'; d.innerHTML = t.innerHTML; $('.seq', el).appendChild(d); t.remove(); next++;
          if (next === b.items.length) { $('.done-note', el).hidden = false; complete(); }
        } else { t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake', 'flash-bad'); setTimeout(() => t.classList.remove('flash-bad'), 450); }
      });
      break;
    }
    default: el.innerHTML = ''; complete();
  }
  const speech = blockSpeech(b);
  if (TTS && speech) {
    const k = 'b' + (++saySeq);
    el.classList.add('say-on'); el.insertAdjacentHTML('afterbegin', sayHtml(k));
    bindSay(el, { [k]: speech });
  }
}

/* ---------- preguntas ---------- */
const KIND = { single: 'Elige una', multi: 'Varias respuestas', yn: 'Sí o No', drop: 'Completa la frase', match: 'Relaciona' };
function prep(q) {
  const p = { id: q.id, t: q.t, q: q.q, why: q.why };
  if (q.t === 'single' || q.t === 'drop' || q.t === 'multi') {
    const idx = shuffle(q.o.map((_, i) => i));
    p.o = idx.map(i => q.o[i]);
    p.a = q.t === 'multi' ? q.a.map(x => idx.indexOf(x)).sort((a, b) => a - b) : idx.indexOf(q.a);
  }
  if (q.t === 'yn') p.s = q.s;
  if (q.t === 'match') { p.left = q.pairs.map(x => x[0]); p.right = shuffle(q.pairs.map(x => x[1])); p.a = q.pairs.map(x => p.right.indexOf(x[1])); }
  return p;
}
const emptyAns = p => p.t === 'multi' ? [] : p.t === 'yn' ? [null, null, null] : p.t === 'match' ? p.left.map(() => null) : null;
const complete = (p, a) => a != null && (p.t === 'multi' ? a.length === p.a.length : Array.isArray(a) ? a.every(x => x != null) : true);
function grade(p, a) {
  if (a == null) return 0;
  switch (p.t) {
    case 'single': case 'drop': return a === p.a ? 1 : 0;
    case 'multi': { const hit = a.filter(x => p.a.includes(x)).length, miss = a.length - hit; return Math.max(0, hit - miss) / p.a.length; }
    case 'yn': return a.filter((x, i) => x === p.s[i].a).length / p.s.length;
    case 'match': return a.filter((x, i) => x === p.a[i]).length / p.a.length;
  }
  return 0;
}

// Dibuja una pregunta; reveal=true muestra la corrección
function QView(p, el, ans, onChange, reveal) {
  ans = ans ?? emptyAns(p);
  const draw = () => {
    const text = p.t === 'drop' ? fmt(p.q).replace('___', `<span class="blank">${ans != null ? esc(p.o[ans]) : '&nbsp;'}</span>`) : fmt(p.q);
    let body = '';
    if (p.t === 'single' || p.t === 'drop' || p.t === 'multi') {
      body = `<div class="opts">${p.o.map((o, i) => {
        const sel = p.t === 'multi' ? ans.includes(i) : ans === i;
        const right = p.t === 'multi' ? p.a.includes(i) : p.a === i;
        const cls = reveal ? (right ? 'right' : sel ? 'wrong' : '') : sel ? 'sel' : '';
        return `<button class="opt ${p.t === 'multi' ? 'multi' : ''} ${cls}" data-i="${i}" ${reveal ? 'disabled' : ''}><span class="k">${LETTERS[i]}</span><span>${fmt(o)}</span></button>`;
      }).join('')}</div>`;
    } else if (p.t === 'yn') {
      body = `<div class="yn">${p.s.map((s, i) => {
        const cls = reveal ? (ans[i] === s.a ? 'right' : 'wrong') : '';
        const bc = v => reveal ? (s.a === v ? 'right' : ans[i] === v ? 'wrong' : '') : ans[i] === v ? 'sel' : '';
        return `<div class="yn-row ${cls}"><span>${fmt(s.text)}</span><span class="seg"><button data-r="${i}" data-v="1" class="${bc(true)}" ${reveal ? 'disabled' : ''}>Sí</button><button data-r="${i}" data-v="0" class="${bc(false)}" ${reveal ? 'disabled' : ''}>No</button></span></div>`;
      }).join('')}</div>`;
    } else if (p.t === 'match') {
      body = `<div class="match">${p.left.map((lft, i) => {
        const cls = reveal ? (ans[i] === p.a[i] ? 'right' : 'wrong') : '';
        return `<label class="m-row ${cls}"><b>${fmt(lft)}</b><select data-m="${i}" ${reveal ? 'disabled' : ''}><option value="">Elegir…</option>${p.right.map((r, k) => `<option value="${k}" ${ans[i] === k ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select>${reveal && ans[i] !== p.a[i] ? `<span class="fix">Correcto: ${esc(p.right[p.a[i]])}</span>` : ''}</label>`;
      }).join('')}</div>`;
    }
    const hint = p.t === 'multi' ? ` · elige ${p.a.length}` : '';
    const kq = p.id + ':q', kw = p.id + ':w';
    el.innerHTML = `<div class="qwrap"><div class="qhead"><span class="eyebrow">${KIND[p.t]}${hint}</span>${sayHtml(kq)}</div><h2 class="q-text">${text}</h2>${body}${reveal ? `<div class="why">${sayHtml(kw)}<strong>Explicación.</strong> ${fmt(p.why)}</div>` : ''}</div>`;
    bindSay(el, { [kq]: qSpeech(p), [kw]: 'Explicación. ' + p.why });
    if (reveal) return;
    $$('.opt', el).forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if (p.t === 'multi') ans = ans.includes(i) ? ans.filter(x => x !== i) : [...ans, i].sort((a, b) => a - b);
      else ans = i;
      draw(); onChange && onChange(ans);
    });
    $$('.seg button', el).forEach(b => b.onclick = () => { ans = [...ans]; ans[+b.dataset.r] = b.dataset.v === '1'; draw(); onChange && onChange(ans); });
    $$('select[data-m]', el).forEach(s => s.onchange = () => { ans = [...ans]; ans[+s.dataset.m] = s.value === '' ? null : +s.value; onChange && onChange(ans); });
  };
  draw();
}

/* ---------- motor de quiz (nivel, jefe, mazo) ---------- */
function pickForLevel(l, n) {
  const qs = l.questions;
  const unseen = shuffle(qs.filter(q => !S.q[q.id]));
  const wrong = shuffle(qs.filter(q => S.q[q.id]?.last === 0));
  const rest = shuffle(qs.filter(q => S.q[q.id]?.last === 1));
  return shuffle([...wrong.slice(0, 3), ...unseen, ...wrong.slice(3), ...rest].slice(0, n));
}
function LevelQuiz(l) {
  Quiz({
    title: l.title, qs: pickForLevel(l, 10), passAt: .8,
    back: () => Level(l), retry: () => LevelQuiz(l),
    finish(score) {
      const st = lvlSt(l), s = score >= 1 ? 3 : score >= .9 ? 2 : score >= .8 ? 1 : 0;
      const first = !st.passed && s > 0;
      S.levels[l.id] = { ...st, lesson: st.lesson || false, best: Math.max(st.best || 0, score), stars: Math.max(st.stars || 0, s), passed: st.passed || s > 0 };
      if (first) { addXP(50); award('first'); }
      if (score >= 1) award('perfect');
      const w = LWORLD.get(l.id);
      if (w.levels.every(x => lvlSt(x).passed)) award('world-' + w.id);
      return { stars: s, next: s > 0 ? nextLevel() : null };
    }
  });
}
function Boss(w) {
  const pool = shuffle(w.levels.flatMap(l => shuffle(l.questions).slice(0, Math.ceil(20 / w.levels.length) + 1))).slice(0, 20);
  Quiz({
    title: 'Jefe: ' + w.title, qs: pool, passAt: .75, boss: true,
    back: () => go('home'), retry: () => Boss(w),
    finish(score) {
      const b = S.bosses[w.id] || {};
      const pass = score >= .75;
      if (pass && !b.passed) { addXP(150); award('boss-' + w.id); }
      S.bosses[w.id] = { best: Math.max(b.best || 0, score), passed: b.passed || pass };
      return { stars: pass ? (score >= .95 ? 3 : score >= .85 ? 2 : 1) : 0 };
    }
  });
}
function DeckRun() {
  const qs = shuffle(dueList()).slice(0, 15);
  if (!qs.length) { toast('No tienes preguntas pendientes'); return; }
  Quiz({ title: 'Mazo de errores', qs, deck: true, back: () => go('review'), retry: () => DeckRun(), finish: () => ({}) });
}

function Quiz(cfg) {
  const ps = cfg.qs.map(prep), res = [];
  let i = 0, ans = null, xp = 0;
  const show = () => {
    const p = ps[i]; ans = emptyAns(p);
    mount(`${topbar(i / ps.length, `${i + 1}/${ps.length}`)}<div id="q"></div>`, true);
    $('[data-close]').onclick = () => confirmSheet('¿Salir del quiz?', 'Perderás el avance de este intento.', 'Salir', cfg.back);
    const btn = () => dock(`<button class="btn block" id="chk" ${complete(p, ans) ? '' : 'disabled'}>Comprobar</button>`);
    QView(p, $('#q'), ans, a => { ans = a; $('#chk').disabled = !complete(p, ans); });
    btn();
    $('#chk').onclick = () => check(p);
  };
  const check = p => {
    const f = grade(p, ans), ok = f >= 1;
    res.push({ p, ans, f });
    record(QS.get(p.id), f);
    if (ok) xp += 10;
    QView(p, $('#q'), ans, null, true);
    const d = dock(`<div class="fb"><h3>${ok ? ic('check') + (['¡Correcto!', '¡Exacto!', '¡Muy bien!'][Math.random() * 3 | 0]) : f > 0 ? ic('warn') + 'Casi: parcialmente correcto' : ic('x') + 'Incorrecto'}</h3><p>${fmt(p.why)}</p></div><button class="btn block ${ok ? 'ok' : 'bad'}" id="nx">${i + 1 < ps.length ? 'Continuar' : 'Ver resultado'}</button>`, ok ? 'ok' : 'bad');
    $('.fb p', d).hidden = true; // la explicación ya aparece en la pregunta
    $('#nx').onclick = () => { i++; i < ps.length ? show() : end(); };
    $('#nx').focus();
    save();
  };
  const end = () => {
    const score = res.reduce((s, r) => s + (r.f >= 1 ? 1 : 0), 0) / res.length;
    const out = cfg.finish(score) || {};
    addXP(xp); touch(); save();
    const pass = cfg.deck ? null : score >= cfg.passAt;
    const wrong = res.filter(r => r.f < 1);
    reviewData = wrong;
    mount(`<div class="result">
      <span class="eyebrow">${esc(cfg.title)}</span>
      <div class="big">${res.filter(r => r.f >= 1).length}<span class="muted" style="font-size:28px">/${res.length}</span></div>
      ${cfg.deck ? `<span class="pill gold">${dueList().length} pendientes en el mazo</span>` : stars(out.stars || 0)}
      ${pass == null ? '' : pass ? `<span class="pill ok">${ic('check')}Aprobado · ${pct(score)}%</span>` : `<span class="pill bad">Necesitas ${pct(cfg.passAt)}% · sacaste ${pct(score)}%</span>`}
      <p class="muted">${pass === false ? 'Las preguntas falladas se guardaron en tu mazo de errores. Repasa la lección e inténtalo de nuevo.' : wrong.length ? 'Las falladas quedan en tu mazo de errores para repasarlas en los próximos días.' : 'Nada que repasar aquí.'}</p>
      <div class="row" style="width:100%">${out.next ? `<button class="btn" data-next>Siguiente nivel ${ic('chev')}</button>` : ''}<button class="btn ghost" data-retry>Repetir</button><button class="btn ghost" data-back>Volver</button></div>
      ${wrong.length ? `<div class="list"><span class="eyebrow">Para revisar (${wrong.length})</span>${wrong.map(reviewItem).join('')}</div>` : ''}
    </div>`, true);
    bindReview();
    $('[data-retry]').onclick = cfg.retry; $('[data-back]').onclick = cfg.back;
    out.next && ($('[data-next]').onclick = () => Level(out.next));
  };
  show();
}
function reviewItem(r, k) {
  const f = r.f;
  return `<details class="rev" data-rv="${k}"><summary>${f >= 1 ? ic('check', 'c-ok') : f > 0 ? ic('warn', 'c-gold') : ic('x', 'c-bad')}<span>${esc(r.p.q.replace('___', '…'))}</span></summary><div class="rv-body"></div></details>`;
}
let reviewData = [];
function bindReview(list) {
  $$('details.rev').forEach(d => d.addEventListener('toggle', () => {
    const body = $('.rv-body', d);
    if (d.open && !body.childElementCount) {
      const src = list || null;
      const r = src ? src[+d.dataset.rv] : reviewData[+d.dataset.rv];
      QView(r.p, body, r.ans, null, true);
      $('.q-text', body).remove();
    }
  }));
}

/* ---------- repaso ---------- */
function Review() {
  const due = dueList().length, cards = flashPool();
  const opened = LEVELS.filter(l => lvlSt(l).lesson || S.free);
  mount(`<div class="sec-h"><span class="eyebrow">Repasar</span><h1>Que no se te olvide</h1><p class="muted">Lo que fallas vuelve en 1, 3, 7 y 14 días hasta que lo dominas.</p></div>
  <div class="opts-list">
    <button class="card action" data-a="deck"><span class="ic">${ic('repeat')}</span><span><b>Mazo de errores</b><small>${due ? `${due} pendientes hoy` : 'Nada pendiente hoy'} · ${deckSize()} en total</small></span><span class="go">${ic('chev')}</span></button>
    <button class="card action" data-a="bolt"><span class="ic">${ic('bolt')}</span><span><b>Relámpago</b><small>60 segundos, todas las que puedas · récord ${S.bolt}</small></span><span class="go">${ic('chev')}</span></button>
    <button class="card action" data-a="flash"><span class="ic">${ic('cards')}</span><span><b>Flashcards</b><small>${cards.length} tarjetas de las lecciones que abriste</small></span><span class="go">${ic('chev')}</span></button>
  </div>
  <div class="sec-h"><span class="eyebrow">Resúmenes</span><h2 style="font-size:20px">Lo esencial de cada nivel</h2></div>
  <div class="list">${opened.length ? opened.map(l => { const kp = l.lesson.find(b => b.type === 'keypoints'); return `<details class="rev"><summary>${ic('book', 'c-ok')}<span>${esc(l.title)}</span></summary>${kp ? `<div class="kp"><ul>${kp.items.map(t => `<li>${ic('check')}<span>${fmt(t)}</span></li>`).join('')}</ul></div>` : ''}<div class="row" style="margin-top:10px"><button class="btn ghost" data-lesson="${l.id}">Abrir lección</button></div></details>`; }).join('') : '<p class="muted">Aquí aparecerán los resúmenes cuando completes tu primera lección.</p>'}</div>`);
  $('[data-a=deck]').onclick = () => due ? DeckRun() : toast('No tienes preguntas pendientes hoy', 'check');
  $('[data-a=bolt]').onclick = Bolt;
  $('[data-a=flash]').onclick = () => cards.length ? Flash(cards) : toast('Completa una lección para desbloquear tarjetas', 'lock');
  $$('[data-lesson]').forEach(b => b.onclick = () => Lesson(LEVELS.find(l => l.id === b.dataset.lesson)));
}
function flashPool() {
  const ls = LEVELS.filter(l => lvlSt(l).lesson || S.free);
  return ls.flatMap(l => l.lesson.flatMap(b => b.type === 'flip' ? b.items.map(c => ({ f: c.front, b: c.back, l: l.title })) : b.type === 'cards' ? b.items.map(c => ({ f: c.title, b: c.body, l: l.title })) : []));
}
function Flash(pool) {
  let deck = shuffle(pool), known = 0, flipped = false;
  const total = deck.length;
  const show = () => {
    if (!deck.length) {
      mount(`<div class="result"><span class="eyebrow">Flashcards</span><h1>¡Mazo terminado!</h1><p class="muted">${total} tarjetas repasadas.</p><div class="row" style="width:100%"><button class="btn" data-again>Otra vez</button><button class="btn ghost" data-back>Volver</button></div></div>`, true);
      $('[data-again]').onclick = () => Flash(pool); $('[data-back]').onclick = () => go('review'); return;
    }
    const c = deck[0];
    mount(`${topbar(known / total, `${known}/${total}`)}<button class="fcard ${flipped ? 'back' : ''}" id="fc"><small>${esc(c.l)}</small>${flipped ? `<p>${fmt(c.b)}</p>` : `<b>${fmt(c.f)}</b><small>Toca para ver la respuesta</small>`}</button>`, true);
    $('[data-close]').onclick = () => go('review');
    $('#fc').onclick = () => { flipped = !flipped; show(); };
    dock(flipped ? `<div class="row"><button class="btn ghost" id="again">Otra vez</button><button class="btn ok" id="know">La sé</button></div>` : `<button class="btn block" id="flip">Ver respuesta</button>`);
    if (flipped) {
      $('#again').onclick = () => { deck.push(deck.shift()); flipped = false; show(); };
      $('#know').onclick = () => { deck.shift(); known++; flipped = false; show(); };
    } else $('#flip').onclick = () => { flipped = true; show(); };
  };
  show();
}
function Bolt() {
  const open = LEVELS.filter(l => isOpen(l));
  const pool = shuffle(open.flatMap(l => l.questions).filter(q => q.t === 'single' || q.t === 'drop'));
  if (!pool.length) { toast('No hay preguntas disponibles'); return; }
  let k = 0, score = 0, wrong = [], end = Date.now() + 60000, timer;
  const tick = () => { const s = Math.max(0, Math.ceil((end - Date.now()) / 1000)); const t = $('#bt'); if (t) { t.textContent = s + ' s'; t.parentElement.classList.toggle('low', s <= 10); } if (s <= 0) finish(); };
  const show = () => {
    const p = prep(pool[k % pool.length]);
    app.querySelector('#bq') || mount(`<div class="top"><button class="icon-btn" data-close aria-label="Salir">${ic('x')}</button><span class="timer">${ic('clock')}<span id="bt">60 s</span></span><span style="flex:1"></span><span class="bolt-score" id="bs">0</span></div><div id="bq" class="bolt-q"></div>`, true);
    $('[data-close]').onclick = () => { clearInterval(timer); go('review'); };
    const el = $('#bq');
    QView(p, el, null, a => {
      const ok = a === p.a;
      record(QS.get(p.id), ok ? 1 : 0);
      if (ok) score++; else wrong.push({ p, ans: a, f: 0 });
      $('#bs').textContent = score;
      el.classList.remove('flash-ok', 'flash-no'); void el.offsetWidth; el.classList.add(ok ? 'flash-ok' : 'flash-no');
      k++; setTimeout(() => Date.now() < end && show(), 160);
    });
  };
  const finish = () => {
    clearInterval(timer);
    const best = score > S.bolt; if (best) S.bolt = score;
    if (score >= 10) award('bolt10');
    addXP(score * 5); save();
    reviewData = wrong;
    mount(`<div class="result"><span class="eyebrow">Relámpago</span><div class="big">${score}</div><p class="muted">aciertos en 60 segundos${best ? ' · ¡nuevo récord!' : ` · récord ${S.bolt}`}</p><div class="row" style="width:100%"><button class="btn" data-again>Otra vez</button><button class="btn ghost" data-back>Volver</button></div>${wrong.length ? `<div class="list"><span class="eyebrow">Falladas (${wrong.length})</span>${wrong.map(reviewItem).join('')}</div>` : ''}</div>`, true);
    bindReview(); $('[data-again]').onclick = Bolt; $('[data-back]').onclick = () => go('review');
  };
  show();
  timer = setInterval(tick, 250); onLeave(() => clearInterval(timer));
}

/* ---------- simulacro ---------- */
function buildExam(n) {
  const counts = WORLDS.map(w => Math.round(n * w.share / SHARE_SUM));
  counts[1 % counts.length] += n - counts.reduce((a, b) => a + b, 0);
  return shuffle(WORLDS.flatMap((w, i) => {
    const per = w.levels.map(l => shuffle(l.questions));
    const out = []; let j = 0;
    while (out.length < counts[i] && per.some(a => a.length)) { const a = per[j++ % per.length]; if (a.length) out.push(a.pop()); }
    return out;
  })).map(prep);
}
function ExamHome() {
  const full = S.exams.filter(e => e.total >= 40), best = full.reduce((m, e) => Math.max(m, e.score), 0);
  mount(`<div class="sec-h"><span class="eyebrow">Simulacro</span><h1>Practica el examen real</h1><p class="muted">Mismo formato del AZ-900: tiempo límite, sin correcciones hasta el final, preguntas marcables y puntuación sobre 1000.</p></div>
  <div class="exam-info"><div><b>45</b><small>minutos</small></div><div><b>~50</b><small>preguntas</small></div><div><b>700</b><small>para aprobar</small></div></div>
  ${S.draft ? `<div class="hero"><span class="eyebrow">En curso</span><h2>Tienes un simulacro sin terminar</h2><button class="btn" data-resume>Continuar ${ic('chev')}</button></div>` : ''}
  <div class="opts-list">
    <button class="card action" data-n="50"><span class="ic">${ic('exam')}</span><span><b>Simulacro completo</b><small>50 preguntas · 45 min · reparto por peso de cada área</small></span><span class="go">${ic('chev')}</span></button>
    <button class="card action" data-n="20"><span class="ic">${ic('clock')}</span><span><b>Simulacro rápido</b><small>20 preguntas · 18 min</small></span><span class="go">${ic('chev')}</span></button>
  </div>
  ${S.lastExam ? `<button class="btn ghost block" data-last>Ver último resultado</button>` : ''}
  <div class="card" style="display:grid;gap:10px"><span class="eyebrow">Historial${best ? ` · mejor ${best}` : ''}</span>
  ${S.exams.length ? `<div class="hist">${S.exams.slice(-8).reverse().map(e => `<div><span>${esc(e.date)} · ${e.total} preguntas</span><span class="mono">${e.score}</span>${e.score >= 700 ? `<span class="pill ok">Aprobado</span>` : `<span class="pill bad">No</span>`}</div>`).join('')}</div>` : '<p class="muted">Aún no has hecho ningún simulacro. Recomendado cuando tu preparación pase de 700.</p>'}</div>
  <div class="card" style="display:grid;gap:8px"><span class="eyebrow">Recursos oficiales</span>
  <p>Cuando apruebes aquí con holgura, haz también la evaluación de práctica oficial gratuita y prueba la interfaz real del examen.</p>
  <a class="btn ghost block" href="https://learn.microsoft.com/es-es/credentials/certifications/azure-fundamentals/practice/assessment?assessment-type=practice&assessmentId=23" target="_blank" rel="noopener">Evaluación de práctica de Microsoft</a>
  <a class="btn ghost block" href="https://aka.ms/examdemo" target="_blank" rel="noopener">Espacio aislado del examen</a></div>`);
  $$('[data-n]').forEach(b => b.onclick = () => {
    const n = +b.dataset.n, mins = n >= 50 ? 45 : 18;
    const start = () => { S.draft = { n, mins, ps: buildExam(n), ans: [], flags: [], i: 0, end: Date.now() + mins * 60000 }; save(); ExamRun(); };
    S.draft ? confirmSheet('¿Empezar otro simulacro?', 'Se descartará el simulacro que tienes en curso.', 'Empezar nuevo', start, true)
      : confirmSheet(`Simulacro de ${n} preguntas`, `Tendrás ${mins} minutos. No verás si aciertas hasta entregar. Puedes marcar preguntas para revisarlas.`, 'Empezar', start);
  });
  $('[data-resume]') && ($('[data-resume]').onclick = ExamRun);
  $('[data-last]') && ($('[data-last]').onclick = () => ExamResult(S.lastExam));
}
function ExamRun() {
  const d = S.draft; if (!d) return go('exam');
  let timer;
  const left = () => Math.max(0, d.end - Date.now());
  const mmss = ms => { const s = Math.ceil(ms / 1000); return `${String(s / 60 | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const show = () => {
    const p = d.ps[d.i], fl = d.flags.includes(d.i);
    mount(`<div class="top"><button class="icon-btn" data-close aria-label="Pausar">${ic('left')}</button><span class="timer" id="tm">${ic('clock')}<span>${mmss(left())}</span></span><span style="flex:1"></span><button class="btn ghost" style="min-height:40px;padding:0 12px" data-grid>${ic('grid')}<span class="mono">${d.i + 1}/${d.ps.length}</span></button></div>
      <div class="q-meta"><span class="eyebrow">Pregunta ${d.i + 1}</span><button class="flag ${fl ? 'on' : ''}" data-flag>${ic('flag')}${fl ? 'Marcada' : 'Marcar para revisar'}</button></div><div id="q"></div>`, true);
    QView(p, $('#q'), d.ans[d.i], a => { d.ans[d.i] = a; save(); });
    const last = d.i === d.ps.length - 1;
    dock(`<div class="row"><button class="btn ghost" id="prev" ${d.i ? '' : 'disabled'}>Anterior</button><button class="btn" id="nxt">${last ? 'Revisar y entregar' : 'Siguiente'}</button></div>`);
    $('#prev').onclick = () => { d.i--; save(); show(); };
    $('#nxt').onclick = () => { if (last) grid(); else { d.i++; save(); show(); } };
    $('[data-flag]').onclick = () => { d.flags = fl ? d.flags.filter(x => x !== d.i) : [...d.flags, d.i]; save(); show(); };
    $('[data-grid]').onclick = grid;
    $('[data-close]').onclick = () => { save(); go('exam'); toast('Simulacro pausado: el tiempo sigue corriendo'); };
  };
  const answered = i => d.ans[i] != null && complete(d.ps[i], d.ans[i]);
  const grid = () => {
    const un = d.ps.filter((_, i) => !answered(i)).length;
    sheet(`<h2>Revisión</h2><div class="legend"><span>Azul: respondida</span><span>Punto dorado: marcada</span></div>
      <div class="grid-nav">${d.ps.map((_, i) => `<button class="${answered(i) ? 'ans' : ''} ${d.flags.includes(i) ? 'fl' : ''} ${i === d.i ? 'cur' : ''}" data-j="${i}">${i + 1}</button>`).join('')}</div>
      <p class="muted">${un ? `Te faltan ${un} sin responder completas. Las vacías cuentan como incorrectas.` : 'Todas respondidas.'}</p>
      <button class="btn block" data-submit>Entregar examen</button>`, s => {
      $$('[data-j]', s).forEach(b => b.onclick = () => { d.i = +b.dataset.j; save(); show(); });
      $('[data-submit]', s).onclick = () => un ? confirmSheet('¿Entregar ya?', `Tienes ${un} preguntas sin responder.`, 'Entregar', submit, true) : submit();
    });
  };
  const submit = () => {
    clearInterval(timer);
    const res = d.ps.map((p, i) => ({ p, ans: d.ans[i] ?? null, f: grade(p, d.ans[i] ?? null) }));
    const byWorld = {};
    res.forEach(r => { const w = LWORLD.get(QLEVEL.get(r.p.id).id).id; (byWorld[w] = byWorld[w] || [0, 0]); byWorld[w][0] += r.f; byWorld[w][1]++; record(QS.get(r.p.id), r.f); });
    const score = Math.round(1000 * res.reduce((s, r) => s + r.f, 0) / res.length);
    const used = Math.round((d.mins * 60000 - left()) / 60000);
    const e = { date: today(), score, total: res.length, used, byWorld };
    S.exams.push(e); S.lastExam = { ...e, res, mins: d.mins }; S.draft = null;
    award('exam'); if (res.length >= 40 && score >= 700) award('pass'); if (res.length >= 40 && score >= 900) award('ace');
    addXP(res.length >= 40 ? 100 : 40); save();
    ExamResult(S.lastExam);
  };
  timer = setInterval(() => { const t = $('#tm span'); if (!t) { clearInterval(timer); return; } if (t) { t.textContent = mmss(left()); $('#tm').classList.toggle('low', left() < 5 * 60000); } if (left() <= 0) { toast('Se acabó el tiempo', 'clock'); submit(); } }, 500);
  if (left() <= 0) { submit(); return; }
  show();
}
function ExamResult(r) {
  if (!r) return go('exam');
  const pass = r.score >= 700;
  let filter = 'bad';
  const draw = () => {
    const list = r.res.map((x, k) => ({ ...x, k })).filter(x => filter === 'all' || x.f < 1);
    mount(`<div class="result">
      <span class="eyebrow">Simulacro · ${r.total} preguntas · ${r.used} de ${r.mins} min</span>
      ${gauge(r.score)}
      <span class="pill ${pass ? 'ok' : 'bad'}">${pass ? ic('check') + 'Aprobado' : 'No aprobado: necesitas 700'}</span>
      <div class="card" style="width:100%;display:grid;gap:12px">
        <span class="eyebrow" style="text-align:left">Rendimiento por área</span>
        ${WORLDS.map(w => { const v = r.byWorld[w.id] || [0, 0], f = v[1] ? v[0] / v[1] : 0; return `<div class="dom"><div class="lbl"><b>${esc(w.title)}</b><span class="mono">${pct(f)}%</span></div><div class="track ${f >= .7 ? 'ok' : ''}"><i style="width:${pct(f)}%"></i></div><small class="${f >= .7 ? 'c-ok' : 'c-bad'}">${f >= .85 ? 'Fuerte' : f >= .7 ? 'Bien, con margen de mejora' : 'Necesita refuerzo'} · ${v[1]} preguntas</small></div>`; }).join('')}
      </div>
      <p class="muted" style="font-size:13px">La puntuación es proporcional a tus aciertos (con crédito parcial en Sí/No, varias respuestas y relacionar). Microsoft usa una escala propia, así que tómalo como referencia.</p>
      <div class="row" style="width:100%"><button class="btn" data-home>Volver</button></div>
      <div class="list"><div class="row"><button class="btn ${filter === 'bad' ? '' : 'ghost'}" data-f="bad">Falladas (${r.res.filter(x => x.f < 1).length})</button><button class="btn ${filter === 'all' ? '' : 'ghost'}" data-f="all">Todas</button></div>
      ${list.map(x => reviewItem(x, x.k)).join('')}</div>
    </div>`, true);
    bindReview(r.res);
    $('[data-home]').onclick = () => go('exam');
    $$('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; draw(); });
  };
  draw();
}

/* ---------- progreso ---------- */
function Progress() {
  const acc = S.stats.answered ? S.stats.correct / S.stats.answered : 0;
  const done = LEVELS.filter(l => lvlSt(l).passed).length;
  mount(`<div class="sec-h"><span class="eyebrow">Progreso</span><h1>Tu preparación</h1></div>
  <section class="card ready">${gauge(predicted())}<div class="wbars">${WORLDS.map(w => `<div class="wbar"><div class="lbl"><span>${esc(w.title)}</span><span class="mono">${pct(worldReady(w))}%</span></div><div class="track ${worldReady(w) >= .8 ? 'ok' : ''}"><i style="width:${pct(worldReady(w))}%"></i></div></div>`).join('')}</div></section>
  <p class="muted" style="font-size:13px">La preparación estimada cuenta cuántas preguntas del banco tienes dominadas (última respuesta correcta), ponderado por el peso de cada área en el examen.</p>
  <div class="stat-row"><div class="stat"><b>${done}/${LEVELS.length}</b><small>niveles</small></div><div class="stat"><b>${pct(acc)}%</b><small>precisión</small></div><div class="stat"><b>${S.stats.answered}</b><small>respuestas</small></div></div>
  <div class="sec-h"><span class="eyebrow">Insignias · ${Object.keys(S.badges).length}/${BADGES.length}</span></div>
  <div class="badges">${BADGES.map(b => `<div class="badge ${S.badges[b.id] ? 'on' : ''}"><span class="ic">${ic(b.icon)}</span><b>${esc(b.name)}</b><span>${esc(b.desc)}</span></div>`).join('')}</div>
  <div class="card" style="display:grid;gap:14px"><span class="eyebrow">Ajustes</span>
    <button class="toggle" data-free aria-pressed="${S.free}"><span><b>Modo libre</b><br><small class="muted">Desbloquea todos los niveles sin seguir el orden</small></span><span class="sw"></span></button>
    <div style="display:grid;gap:8px"><b>Copia de seguridad</b><small class="muted">Tu progreso vive solo en este navegador. Copia el código para pasarlo a otro dispositivo y pégalo allí.</small>
      <div class="row"><button class="btn ghost" data-export>Copiar código</button><button class="btn ghost" data-import>Pegar código</button></div></div>
    <button class="btn ghost block c-bad" data-reset>Borrar todo el progreso</button>
  </div>`);
  $('[data-free]').onclick = () => { S.free = !S.free; save(); Progress(); };
  $('[data-export]').onclick = () => {
    const code = btoa(unescape(encodeURIComponent(JSON.stringify({ ...S, draft: null, lastExam: null }))));
    sheet(`<h2>Código de respaldo</h2><textarea id="ex" readonly>${code}</textarea><button class="btn block" data-cp>Copiar</button>`, s => {
      $('[data-cp]', s).onclick = () => { navigator.clipboard?.writeText(code).then(() => toast('Copiado', 'check'), () => { $('#ex').select(); toast('Selecciona y copia el texto'); }) ?? $('#ex').select(); };
    });
  };
  $('[data-import]').onclick = () => sheet(`<h2>Restaurar progreso</h2><p class="muted">Pega el código. Reemplazará el progreso actual.</p><textarea id="im" placeholder="Pega aquí el código"></textarea><button class="btn block" data-go>Restaurar</button>`, s => {
    $('[data-go]', s).onclick = () => {
      try { const o = JSON.parse(decodeURIComponent(escape(atob($('#im').value.trim())))); if (!o || o.v !== 1) throw 0; S = Object.assign(blank(), o); save(); closeSheet(); toast('Progreso restaurado', 'check'); go('home'); }
      catch (e) { toast('El código no es válido. Cópialo completo y vuelve a intentarlo.'); }
    };
  });
  $('[data-reset]').onclick = () => confirmSheet('¿Borrar todo?', 'Perderás niveles, XP, insignias, mazo e historial. No se puede deshacer.', 'Borrar', () => { S = blank(); save(); go('home'); }, true);
}

/* ---------- arranque ---------- */
if (!WORLDS.length) { app.innerHTML = '<p>No se cargó el contenido.</p>'; return; }
go('home');
})();
