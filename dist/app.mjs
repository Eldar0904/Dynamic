import { moves, daily, quick, warmup, preRun, weeks, allRoutines, timeline } from './mobility.mjs';

const app = document.querySelector('#app');
const nav = document.querySelector('.nav');
const storageKey = 'dynamic-mobility-v1';
const routineById = Object.fromEntries(allRoutines.map(routine => [routine.id, routine]));
const navigation = [['today','Today','home'], ['routines','Routines','grid'], ['plans','Plans','flag'], ['fiery','Fiery','flame']];
const paths = {
  home:'M3 10.5 12 3l9 7.5V21H3z M9 21v-7h6v7',
  grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  flag:'M5 21V4c5-4 9 4 15 0v11c-6 4-10-4-15 0',
  flame:'M12 22c-4 0-7-3-7-7 0-4 3-6 5-8 0 3 1 4 2 5 3-3 3-6 2-10 5 4 7 9 7 13 0 4-4 7-9 7z',
  history:'M3 12a9 9 0 1 1 2.5 6.2M3 6v6h6m3-5v5l3 2',
  arrow:'m9 18 6-6-6-6', play:'m9 5 11 7-11 7z', check:'m4 12 5 5L20 6',
  bookmark:'M6 21V4h12v17l-6-4z', clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2'
};
const icon = name => `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
document.querySelector('.history-button').innerHTML = icon('history');

function restore() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
  catch { return {}; }
}
const data = { history:[], saved:[], progress:[], plan:0, planDates:[], workout:null, sound:true, reminder:'', reminded:'', comparison:'', ...restore() };
let screen = 'today';
let selectedDay = null;
let planChoice = data.plan || 3;
let detail = { id:daily[0].id, minutes:8 };
let finish = null;
let workout = data.workout && routineById[data.workout.id] ? { ...data.workout, end:null } : null;
let phases = workout ? timeline(routineById[workout.id], workout.minutes) : [];
let wakeLock;
let audio;
let storageError = false;
const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const dateKey = date => [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
const mondayIndex = date => (date.getDay()+6)%7;
const localWeek = (now = new Date()) => dayNames.map((_, i) => new Date(now.getFullYear(),now.getMonth(),now.getDate()-mondayIndex(now)+i));
const currentDay = () => selectedDay ?? mondayIndex(new Date());
const weekSessions = count => weeks.slice(0,count).flatMap(week => week.sessions);
const formatMinutes = seconds => Number((seconds/60).toFixed(1));
const clock = seconds => `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
const shortDate = date => new Intl.DateTimeFormat('en',{month:'short',day:'numeric'}).format(date);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function save() {
  data.workout = workout ? { id:workout.id, minutes:workout.minutes, index:workout.index, left:workout.left, skipped:workout.skipped, token:workout.token, performed:workout.performed } : null;
  try { localStorage.setItem(storageKey, JSON.stringify(data)); storageError = false; }
  catch { storageError = true; }
}

function weekStats() {
  const dates = localWeek().map(dateKey);
  const entries = data.history.filter(entry => dates.includes(entry.date));
  return { dates, entries, active:new Set(entries.map(entry => entry.date)), seconds:entries.reduce((sum, entry) => sum + entry.seconds, 0) };
}
const summary = () => {
  const {active,seconds} = weekStats();
  return `${active.size} active ${active.size === 1 ? 'day' : 'days'} · ${formatMinutes(seconds)} min`;
};
const weekStrip = () => {
  const {dates,active} = weekStats();
  return `<div class="week-dots">${dates.map((date,i) => `<span class="${active.has(date)?'filled':''}" aria-label="${dayNames[i]}, ${active.has(date)?'active':'no sessions'}"><i></i>${dayNames[i]}</span>`).join('')}</div>`;
};
const activePlan = () => weekSessions(data.plan);
const nextPlan = () => activePlan().find(routine => !data.progress.includes(routine.id));
function isPlanDue() {
  if (!nextPlan() || data.planDates.at(-1) === dateKey(new Date())) return false;
  const dates = localWeek().map(dateKey);
  if (data.planDates.filter(date => dates.includes(date)).length >= 2) return false;
  const last = data.planDates.at(-1);
  if (!last) return true;
  const date = new Date();
  date.setDate(date.getDate() - 2);
  return last <= dateKey(date);
}
const planWeek = id => weeks.findIndex(week => week.sessions.some(routine => routine.id === id)) + 1;
const isPlansWorkout = id => planWeek(id) > 0 || id === warmup.id || id === preRun.id;
const button = (action,label,style='secondary') => `<button type="button" class="${style}" data-action="${action}">${label}</button>`;
const heading = (title, subtitle='') => `<div class="page-head"><div><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ''}</div></div>`;
const row = (action, name, meta, symbol) => `<button class="row" data-action="${action}"><span class="row-label">${symbol ? `<span class="badge-icon">${icon(symbol)}</span>` : ''}<span><strong>${name}</strong><small>${meta}</small></span></span>${icon('arrow')}</button>`;

function today() {
  const date = new Date();
  const dates = localWeek(date);
  const day = currentDay();
  const actualToday = day === mondayIndex(date);
  const done = actualToday && data.history.some(entry => entry.date === dateKey(date));
  const resume = actualToday && workout && !isPlansWorkout(workout.id);
  const routine = resume ? routineById[workout.id] : daily[day];
  const complete = done && !resume;
  const dateLabel = new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric'}).format(dates[day]);
  const stateLabel = resume ? 'In progress' : complete ? 'Done today' : routine.category;
  return `
    <div class="page-head"><div><p class="date">${dateLabel}</p><h1>Daily Mobility</h1></div></div>
    <div class="studio-grid">
      <section class="studio-main" aria-label="Daily mobility">
        <div class="days" aria-label="Weekly routine rotation">${dates.map((dayDate,i) => `<button class="day" data-action="day:${i}" aria-pressed="${day === i}" aria-label="${dayNames[i]}, ${daily[i].title}">${dayNames[i]}<strong>${dayDate.getDate()}</strong></button>`).join('')}</div>
        <div class="hero"><div class="hero-copy">
          <p class="eyebrow">${stateLabel}</p><h2 class="display">${routine.title}</h2>
          <p class="hero-meta">${resume && phases[workout.index]?.key ? moves[phases[workout.index].key].name : `${routine.minutes} min · ${routine.setup}`}</p>
          ${resume ? button('resume',icon('play')+' Resume','primary') : complete ? button('history',icon('check')+' View activity','primary') : button(`start:${routine.id}:${routine.minutes}`,icon('play')+` Start ${routine.minutes} min`,'primary')}
        </div></div>
        <div class="actions">${button('routines','Change routine')}${button('start:quick:2','2-minute reset','text-button')}</div>
      </section>
      <aside class="studio-side">
        <section class="panel"><button class="panel-link" data-action="history"><span><h2>This week</h2><p>${summary()}</p></span>${icon('arrow')}</button>${weekStrip()}</section>
      </aside>
    </div>`;
}

function routinesPage() {
  const saved = data.saved.map(id => routineById[id]).filter(Boolean);
  const list = items => items.map(routine => `<section class="panel library-card"><p class="eyebrow">${routine.category}</p><h2>${routine.title}</h2><p>${routine.minutes} min · ${routine.setup}</p>${row('detail:'+routine.id,'View routine',routine.id === quick.id || routine.continuous ? `${routine.exercises.length} exercises` : 'Choose duration')}</section>`).join('');
  return heading('Routines') + (saved.length ? `<section class="stack"><h2>Saved</h2><div class="columns">${list(saved)}</div></section><br>` : '') +
    `<div class="columns">${list([...daily,warmup,quick])}</div><section class="panel" style="margin-top:15px"><details><summary><strong>Exercise library · ${Object.keys(moves).length} entries</strong></summary><ul class="steps">${Object.values(moves).map(move => `<li>${move.name}<small>${move.side ? '30 sec per side' : '30 sec'} · ${move.cue}</small></li>`).join('')}</ul></details></section>`;
}

function routineDetail() {
  const routine = routineById[detail.id];
  const exercises = timeline(routine,detail.minutes).filter(phase => phase.type === 'move' && phase.side !== 'Right');
  const saved = data.saved.includes(routine.id);
  return heading(routine.title,routine.setup) + `<section class="panel details">
    ${routine.continuous ? `<p>${routine.minutes} min · 30 sec per exercise</p>` : `<div class="actions">${(routine.id === quick.id ? [2] : [8,12,15]).map(minutes => `<button class="chip" data-action="duration:${minutes}" aria-pressed="${detail.minutes === minutes}">${minutes} min</button>`).join('')}</div>`}
    <ol class="steps">${exercises.map(phase => `<li><strong>${moves[phase.key].name}</strong><small>${phase.side ? '30 sec per side' : '30 sec'} · ${moves[phase.key].cue}</small></li>`).join('')}</ol>
    <div class="actions">${button(`start:${routine.id}:${detail.minutes}`,icon('play')+` Start ${detail.minutes} min`,'primary')}${button('favorite:'+routine.id,icon('bookmark')+(saved?' Saved':' Save routine'))}</div></section>`;
}

const progressBar = (value,max) => `<div class="progress" role="progressbar" aria-label="Plan progress" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}"><span style="width:${100*value/max}%"></span></div>`;
function plansPage() {
  const active = data.plan === planChoice;
  const sessions = weekSessions(planChoice);
  const complete = sessions.filter(routine => data.progress.includes(routine.id)).length;
  const next = sessions.find(routine => !data.progress.includes(routine.id));
  const paused = workout && isPlansWorkout(workout.id) ? routineById[workout.id] : null;
  return heading('Plans')+`
    <div class="studio-grid"><section class="stack">
      ${paused ? `<section class="panel">${row('resume',paused.title,'Resume workout','play')}</section>` : ''}
      <section class="panel" aria-labelledby="runners-heading">
        <h2 id="runners-heading">For Runners</h2>
        ${row('detail:'+preRun.id,preRun.title,`${preRun.minutes} min · ${preRun.exercises.length} exercises`,'clock')}
      </section>
      <div><h2>Climbing plans</h2><p class="muted">Two sessions a week for hips, ankles and foot placement.</p></div>
      <div class="actions" aria-label="Plan length">${[2,3,4,6].map(length => `<button class="chip" data-action="plan:${length}" aria-pressed="${length === planChoice}">${length} weeks</button>`).join('')}</div>
      <section class="panel">
        <h2>${active ? (next ? `Week ${planWeek(next.id)} of ${planChoice}` : 'Plan complete') : ({2:'Hips & Ankles',3:'High Steps',4:'Lateral Reach',6:'Climbing Mobility'})[planChoice]}</h2>
        <p>${complete} of ${sessions.length} sessions complete</p>${progressBar(complete,sessions.length)}
        ${active && next ? row('detail:'+next.id,next.title,isPlanDue() ? 'Due today · 8 min' : 'Up next · 8 min', 'play') : ''}
        ${!active ? button('join',data.plan && planChoice > data.plan ? 'Continue to '+planChoice+' weeks' : 'Start '+planChoice+'-week plan','primary') : ''}
        ${active && !next && planChoice < 6 ? button('extend','Explore the next block') : ''}
        ${active && !next && planChoice >= 3 ? `<p style="margin-top:12px">How did the high step feel with the same setup?</p><div class="actions">${['Easier','About the same','Harder'].map(value => `<button class="chip" data-action="compare:${value}" aria-pressed="${data.comparison === value}">${value}</button>`).join('')}</div>` : ''}
      </section>
      ${weeks.slice(0,planChoice).map((week,index) => `<section class="panel"><h2>Week ${index+1} · ${week.name}</h2>${week.sessions.map(routine => row('detail:'+routine.id,routine.title,data.progress.includes(routine.id)?'Completed':'8 min',data.progress.includes(routine.id)?'check':null)).join('')}</section>`).join('')}
    </section><aside class="panel"><h2>Before you climb</h2><p>Easy arm, wrist and hip movement before you start on easy climbs.</p>${row('detail:warmup','Before You Climb','8 min','clock')}</aside></div>`;
}

function historyPage() {
  return heading('Activity')+`<div class="columns"><div class="stack">
    <section class="panel"><h2>This week</h2><p>${summary()}</p>${weekStrip()}</section>
    <section class="panel"><h2>Completed sessions</h2>${data.history.length ? [...data.history].reverse().map(entry => `<div class="row"><span><strong>${escape(routineById[entry.id]?.title || 'Mobility')}</strong><small>${shortDate(new Date(entry.date+'T12:00:00'))} · ${formatMinutes(entry.seconds)} min</small></span>${icon('check')}</div>`).join('') : '<p>No completed sessions yet.</p>'}</section></div>
    <div class="stack"><section class="panel"><h2>Reminder</h2><p>Choose a daily time. Dynamic can show a reminder while it’s open and skips days you’ve already moved.</p>
      <form id="reminder-form" class="input-row"><label for="reminder-time">Daily time</label><input required id="reminder-time" type="time" value="${/^\d\d:\d\d$/.test(data.reminder)?data.reminder:''}"><button class="primary">Save</button>${data.reminder?button('reminder-off','Turn off'):''}</form>
      ${data.reminder?'<p class="hint">Reminder on.</p>':''}
    </section><section class="panel"><h2>Workout sound</h2><p>Play a soft cue when a move starts or ends.</p><div class="input-row"><button class="chip" data-action="sound" aria-pressed="${data.sound}">${data.sound?'Sound on':'Sound off'}</button></div></section></div></div>`;
}

function requestWake() {
  if (!navigator.wakeLock || wakeLock || document.hidden) return;
  navigator.wakeLock.request('screen').then(lock => {
    if (!workout?.end || screen !== 'player') { lock.release().catch(() => {}); return; }
    wakeLock = lock;
    lock.addEventListener('release',() => { if (wakeLock === lock) wakeLock = null; });
  }).catch(() => {});
}
function releaseWake() {
  wakeLock?.release().catch(() => {});
  wakeLock = null;
}
function initializeAudio() {
  if (!data.sound) return;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  try {
    audio ||= new Audio();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
  } catch { audio = null; }
}
function chime(complete = false) {
  if (!data.sound || audio?.state !== 'running') return;
  const tone = audio.createOscillator();
  const volume = audio.createGain();
  const time = audio.currentTime;
  tone.type = 'sine';
  tone.frequency.setValueAtTime(complete ? 659 : 523,time);
  if (complete) tone.frequency.setValueAtTime(784,time+.13);
  volume.gain.setValueAtTime(.0001,time);
  volume.gain.exponentialRampToValueAtTime(.12,time+.02);
  volume.gain.exponentialRampToValueAtTime(.0001,time+(complete?.36:.2));
  tone.connect(volume).connect(audio.destination);
  tone.start(time);
  tone.stop(time+(complete?.37:.21));
}

function begin(id,minutes) {
  if (!routineById[id]) return;
  if (workout && !window.confirm('Replace your unfinished session?')) return;
  initializeAudio();
  phases = timeline(routineById[id],minutes);
  workout = {id,minutes,index:0,left:phases[0].seconds*1000,end:Date.now()+phases[0].seconds*1000,performed:0,skipped:false,token:globalThis.crypto?.randomUUID?.() || String(Date.now())};
  screen = 'player';
  save();
  requestWake();
}
function resume() {
  if (!workout) return;
  initializeAudio();
  workout.end = Date.now()+workout.left;
  screen = 'player';
  requestWake();
}
function pause() {
  if (!workout?.end) return;
  const now = Date.now();
  tick(now);
  if (!workout?.end) return;
  workout.left = Math.max(0,workout.end-now);
  workout.end = null;
  releaseWake();
  save();
}
function creditPhase(remaining = 0) {
  workout.performed += phases[workout.index].seconds*1000 - remaining;
}
function completeWorkout() {
  const {id,performed,skipped,token} = workout;
  const date = dateKey(new Date());
  const seconds = Math.round(performed/1000);
  const planSession = activePlan().some(routine => routine.id === id);
  if (seconds > 0 && !data.history.some(entry => entry.token === token)) {
    data.history.push({id,date,seconds,token});
    if (planSession && !skipped && !data.progress.includes(id)) {
      data.progress.push(id);
      data.planDates.push(date);
    }
  }
  finish = {id,seconds,skipped,planSession};
  workout = null;
  phases = [];
  save();
  releaseWake();
  screen = 'finish';
  chime(true);
}
function advance(now,skipped = false) {
  const phase = phases[workout.index];
  const running = workout.end !== null;
  if (skipped && phase.type === 'move') workout.skipped = true;
  creditPhase(skipped ? (running ? Math.max(0,workout.end-now) : workout.left) : 0);
  workout.index += 1;
  if (workout.index === phases.length) { completeWorkout(); return; }
  workout.left = phases[workout.index].seconds*1000;
  workout.end = running ? now+workout.left : null;
  chime();
  save();
}
function tick(now = Date.now()) {
  let changed = false;
  while (workout?.end && now >= workout.end) {
    advance(workout.end);
    changed = true;
  }
  if (changed) render();
  const timer = app.querySelector('#clock');
  if (timer && workout) timer.textContent = clock(Math.ceil((workout.end ? Math.max(0,workout.end-now) : workout.left)/1000));
}

function player() {
  const routine = routineById[workout.id];
  const phase = phases[workout.index];
  const next = phases.slice(workout.index+1).find(item => item.type === 'move');
  const moving = phase.type === 'move';
  const name = phase.type === 'ready' ? 'Get ready' : phase.type === 'switch' ? 'Switch sides' : moves[phase.key].name;
  const cue = moving ? moves[phase.key].cue : phase.type === 'ready' ? routine.setup : `${moves[phase.key].name}${phase.side ? ' · '+phase.side : ''}`;
  return `<section class="player">
    <div class="player-top">${routine.id === preRun.id ? button('plans','Back to Plans','text-button') : button('today','Back to Today','text-button')}<strong>${routine.title}</strong></div>
    <div class="player-card"><p class="eyebrow">${phase.number ? `Exercise ${phase.number} of ${phase.count}` : 'Starting soon'}${moving && phase.side ? ' · '+phase.side : ''}</p>
    <h1>${name}</h1><div class="clock" id="clock" role="timer">${clock(Math.ceil((workout.end ? Math.max(0,workout.end-Date.now()) : workout.left)/1000))}</div><p class="cue">${cue}</p></div>
    ${next ? `<p class="player-next muted">Next · ${moves[next.key].name}${next.side ? ' · '+next.side : ''}</p>` : ''}
    <div class="actions">${workout.end ? button('pause','Pause','primary') : button('resume','Resume','primary')}${button('skip',routine.continuous ? 'Skip exercise' : 'Skip interval')}${button('sound',data.sound?'Mute':'Unmute','text-button')}</div></section>`;
}

function finishPage() {
  return `<section class="player panel finish"><div class="celebration">${icon('check')}</div>
    <h1>${finish.skipped ? 'Session ended' : 'Session complete'}</h1><p>${formatMinutes(finish.seconds)} min · ${summary()}</p>
    ${finish.planSession ? `<p>${activePlan().filter(item => data.progress.includes(item.id)).length} of ${data.plan*2} plan sessions complete</p>` : ''}
    <div class="actions">${button('today','Done','primary')}${button('favorite:'+finish.id,icon('bookmark')+(data.saved.includes(finish.id)?' Saved':' Save routine'))}</div></section>`;
}

function reminderBanner() {
  const now = new Date();
  const date = dateKey(now);
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  if (!data.reminder || data.reminded === date || time < data.reminder || data.history.some(entry => entry.date === date)) return '';
  return `<div id="reminder-banner" class="panel row" role="status"><span>Your mobility session is ready.</span>${button('dismiss','Dismiss','text-button')}</div>`;
}
function render() {
  nav.innerHTML = navigation.map(([id,label,symbol]) => `<button data-action="${id}" ${screen === id ? 'aria-current="page"' : ''}>${icon(symbol)}${label}</button>`).join('');
  nav.hidden = screen === 'player';
  const views = {today,routines:routinesPage,detail:routineDetail,plans:plansPage,history:historyPage,player,finish:finishPage,fiery:() => heading('Fiery')+'<section class="panel fiery"><h2>Cardio &amp; HIIT</h2><p>Coming later.</p></section>'};
  app.innerHTML = views[screen]()+(screen === 'today'?reminderBanner():'')+(storageError?'<p class="hint" role="status">This browser could not save your progress on this device.</p>':'');
}

document.addEventListener('click',event => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  const [type,value,minutes] = action.split(':');
  const previous = screen;
  if (['today','routines','plans','fiery','history'].includes(type)) {
    if (screen === 'player') pause();
    if (type === 'today') selectedDay = null;
    screen = type;
  } else if (type === 'day') selectedDay = Number(value);
  else if (type === 'detail') { detail = {id:value,minutes:routineById[value].minutes}; screen = 'detail'; }
  else if (type === 'duration') detail.minutes = Number(value);
  else if (type === 'start') begin(value,Number(minutes));
  else if (type === 'pause') pause();
  else if (type === 'resume') resume();
  else if (type === 'skip') advance(Date.now(),true);
  else if (type === 'plan') planChoice = Number(value);
  else if (type === 'join') { data.plan = planChoice; save(); }
  else if (type === 'extend') planChoice = [3,4,6].find(length => length > planChoice);
  else if (type === 'compare') { data.comparison = value; save(); }
  else if (type === 'favorite') { data.saved = data.saved.includes(value) ? data.saved.filter(id => id !== value) : [...data.saved,value]; save(); }
  else if (type === 'sound') { data.sound = !data.sound; initializeAudio(); save(); }
  else if (type === 'dismiss') { data.reminded = dateKey(new Date()); save(); }
  else if (type === 'reminder-off') { data.reminder = ''; save(); }
  render();
  if (previous !== screen) {
    window.scrollTo(0,0);
    const title = app.querySelector('h1');
    if (title) { title.tabIndex = -1; title.focus({preventScroll:true}); }
  } else {
    const replacement = [...document.querySelectorAll('[data-action]')].find(item => item.dataset.action === action);
    replacement?.focus({preventScroll:true});
  }
});
app.addEventListener('submit',event => {
  if (event.target.id !== 'reminder-form') return;
  event.preventDefault();
  data.reminder = document.querySelector('#reminder-time').value;
  data.reminded = '';
  save();
  render();
});
document.addEventListener('visibilitychange',() => {
  if (document.hidden) pause();
  else if (screen === 'today' || screen === 'player') render();
});
window.addEventListener('pagehide',pause);
let lastReminderMinute = -1;
setInterval(() => {
  tick();
  const minute = Math.floor(Date.now()/60000);
  if (minute === lastReminderMinute) return;
  lastReminderMinute = minute;
  if (screen === 'today') {
    const banner = reminderBanner();
    if (banner && !app.querySelector('#reminder-banner')) app.insertAdjacentHTML('beforeend',banner);
  }
},150);
render();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
