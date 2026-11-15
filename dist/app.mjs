import { moves, daily, dailyDurations, climbing, preRun, timeline } from './mobility.mjs';

const app = document.querySelector('#app');
const nav = document.querySelector('.nav');
const storageKey = 'dynamic-mobility-v1';
const routineById = Object.fromEntries([...daily, preRun, ...climbing].map(routine => [routine.id, routine]));
const retiredTitles = {
  'hips-ankles':'Hips & Ankles', standing:'Standing Hips & Hamstrings', 'side-reach':'Inner Thighs & Side Reach',
  balance:'Feet, Calves & Balance', rotation:'Hip Flexors & Rotation', 'high-step':'High-Step Mobility',
  'easy-flow':'Easy Lower-Body Flow', quick:'2-minute Reset', warmup:'Before You Climb',
  p1a:'Hip Range', p1b:'Ankle Range', p2a:'Hip Rotation', p2b:'Foot Placement', p3a:'Lift and Place',
  p3b:'High-Step Setup', p4a:'Shift Sideways', p4b:'Transfer Weight', p5a:'High Foot + Side Reach',
  p5b:'Hips + Upper Back', p6a:'Repeat High Steps', p6b:'Repeat Lateral Reach'
};
const navigation = [['today','Today','home'], ['sports','Sports','flag'], ['fiery','Fiery','flame']];
const paths = {
  home:'M3 10.5 12 3l9 7.5V21H3z M9 21v-7h6v7',
  flag:'M5 21V4c5-4 9 4 15 0v11c-6 4-10-4-15 0',
  flame:'M12 22c-4 0-7-3-7-7 0-4 3-6 5-8 0 3 1 4 2 5 3-3 3-6 2-10 5 4 7 9 7 13 0 4-4 7-9 7z',
  history:'M3 12a9 9 0 1 1 2.5 6.2M3 6v6h6m3-5v5l3 2',
  arrow:'m9 18 6-6-6-6', play:'m9 5 11 7-11 7z', check:'m4 12 5 5L20 6',
  clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2'
};
const icon = name => `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
document.querySelector('.history-button').innerHTML = icon('history');

function restore() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
  catch { return {}; }
}
const data = { history:[], workout:null, sound:true, reminder:'', reminded:'', dailyMinutes:8, ...restore() };
let screen = 'today';
let shownToday = '';
let detail = preRun;
let finish = null;
let workout = data.workout && routineById[data.workout.id] ? { ...data.workout, end:null } : null;
let phases = workout ? timeline(routineById[workout.id], workout.minutes) : [];
let countdownSecond = null;
let wakeLock;
let audio;
let storageError = false;
const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const dateKey = date => [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
const mondayIndex = date => (date.getDay()+6)%7;
const localWeek = (now = new Date()) => dayNames.map((_, i) => new Date(now.getFullYear(),now.getMonth(),now.getDate()-mondayIndex(now)+i));
const clock = seconds => `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
const routineDuration = minutes => Number.isInteger(minutes) ? `${minutes} min` : clock(Math.round(minutes * 60));
const dailyCompletion = date => data.history.some(entry => entry.day === date && entry.completed);
const shortDate = date => new Intl.DateTimeFormat('en',{month:'short',day:'numeric'}).format(date);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function save() {
  if (workout) {
    const { end, ...pausedWorkout } = workout;
    data.workout = pausedWorkout;
  } else data.workout = null;
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
  return `${active.size} active ${active.size === 1 ? 'day' : 'days'} · ${routineDuration(seconds/60)}`;
};
const weekStrip = () => {
  const {dates,active} = weekStats();
  return `<div class="week-dots">${dates.map((date,i) => `<span class="${active.has(date)?'filled':''}" aria-label="${dayNames[i]}, ${active.has(date)?'active':'no sessions'}"><i></i>${dayNames[i]}</span>`).join('')}</div>`;
};
const button = (action,label,style='secondary') => `<button type="button" class="${style}" data-action="${action}">${label}</button>`;
const heading = (title, subtitle='') => `<div class="page-head"><div><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ''}</div></div>`;
const row = (action, name, meta, symbol) => `<button class="row" data-action="${action}"><span class="row-label">${symbol ? `<span class="badge-icon">${icon(symbol)}</span>` : ''}<span><strong>${name}</strong><small>${meta}</small></span></span>${icon('arrow')}</button>`;

function today() {
  const date = new Date();
  const day = dateKey(date);
  shownToday = day;
  const routine = daily[mondayIndex(date)];
  const complete = dailyCompletion(day);
  const resume = workout?.day === day && !complete;
  const minutes = resume ? workout.minutes : data.dailyMinutes;
  const dateLabel = new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric'}).format(date);
  return `
    <div class="page-head"><div><p class="date">${dateLabel}</p><h1>Daily Mobility</h1></div></div>
    <section class="daily-session" aria-label="Today's routine">
      <div class="hero"><div class="hero-copy">
        <h2 class="display">${routine.title}</h2>
        <p class="hero-meta">${routine.focus}</p>
      </div></div>
      <div class="daily-controls">
        ${complete ? `<p class="daily-done" role="status">${icon('check')} Done today</p>` :
          resume ? `<p class="muted">In progress · ${routineDuration(minutes)}</p>${button('resume','Resume','primary')}` :
          `<div class="duration-options" role="group" aria-label="Session duration">
            ${dailyDurations.map(option => `<button class="chip" data-action="daily-duration:${option}" aria-pressed="${minutes === option}">${option} min</button>`).join('')}
          </div>${button(`start:${routine.id}:${minutes}`,`${icon('play')} Start`,'primary')}`}
      </div>
    </section>`;
}

function routineDetail() {
  const routine = detail;
  const exercises = timeline(routine,routine.minutes).filter(phase => phase.type === 'move' && phase.side !== 'Right');
  return button('sports','Back to Sports','text-button') + heading(routine.title,routine.setup) + `<section class="panel details">
    <p>${routineDuration(routine.minutes)} · ${exercises.length} exercises</p>
    <ol class="steps">${exercises.map(phase => `<li><strong>${moves[phase.key].name}</strong><small>${phase.side ? '30 sec per side' : '30 sec'} · ${moves[phase.key].cue}</small></li>`).join('')}</ol>
    <div class="actions">${button(`start:${routine.id}:${routine.minutes}`,icon('play')+' Start','primary')}</div></section>`;
}

function sportsPage() {
  const workoutRow = routine => workout?.id === routine.id
    ? row('resume',routine.title,'Resume workout','play')
    : row('detail:'+routine.id,routine.title,`${routineDuration(routine.minutes)} · ${routine.setup}`,'clock');
  return heading('Sports')+`
    <div class="columns">
      <section class="panel"><h2>For Runners</h2>${workoutRow(preRun)}</section>
      <section class="panel"><h2>For Climbers</h2>${climbing.map(workoutRow).join('')}</section>
    </div>`;
}

function historyPage() {
  return heading('Activity')+`<div class="columns"><div class="stack">
    <section class="panel"><h2>This week</h2><p>${summary()}</p>${weekStrip()}</section>
    <section class="panel"><h2>Session history</h2>${data.history.length ? [...data.history].reverse().map(entry => `<div class="row"><span><strong>${escape(routineById[entry.id]?.title || retiredTitles[entry.id] || 'Mobility')}</strong><small>${shortDate(new Date(entry.date+'T12:00:00'))} · ${routineDuration(entry.seconds/60)}</small></span>${entry.completed === false ? '' : icon('check')}</div>`).join('') : '<p>No sessions yet.</p>'}</section></div>
    <div class="stack"><section class="panel"><h2>Reminder</h2><p>Choose a time for your daily mobility reminder. It appears while Dynamic is open.</p>
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
function chime(kind = 'switch') {
  if (!data.sound || audio?.state !== 'running') return;
  const complete = kind === 'complete';
  const countdown = kind === 'countdown';
  const duration = complete ? .36 : countdown ? .10 : .20;
  const tone = audio.createOscillator();
  const volume = audio.createGain();
  const time = audio.currentTime;
  tone.type = 'sine';
  tone.frequency.setValueAtTime(complete ? 659 : countdown ? 740 : 523,time);
  if (complete) tone.frequency.setValueAtTime(784,time+.13);
  volume.gain.setValueAtTime(.0001,time);
  volume.gain.exponentialRampToValueAtTime(.12,time+.02);
  volume.gain.exponentialRampToValueAtTime(.0001,time+duration);
  tone.connect(volume).connect(audio.destination);
  tone.start(time);
  tone.stop(time+duration+.01);
}

function begin(id,minutes) {
  const routine = routineById[id];
  if (!routine) return;
  const date = new Date();
  const day = routine.variants ? dateKey(date) : null;
  if (day && (id !== daily[mondayIndex(date)].id || dailyCompletion(day) || !dailyDurations.includes(minutes))) return;
  if (workout && (!workout.day || workout.day === dateKey(date)) && !window.confirm('Replace your unfinished session?')) return;
  initializeAudio();
  phases = timeline(routine,minutes);
  countdownSecond = null;
  workout = {id,minutes,day,index:0,left:phases[0].seconds*1000,end:Date.now()+phases[0].seconds*1000,performed:0,skipped:false,token:globalThis.crypto?.randomUUID?.() || String(Date.now())};
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
  const {id,day,performed,skipped,token} = workout;
  const date = dateKey(new Date());
  const seconds = Math.round(performed/1000);
  if (seconds > 0 && !data.history.some(entry => entry.token === token)) {
    data.history.push({id,day,date,seconds,token,completed:!skipped});
  }
  finish = {seconds,skipped,returnTo:day ? 'today' : 'sports'};
  workout = null;
  phases = [];
  save();
  releaseWake();
  screen = 'finish';
  chime('complete');
}
function advance(now,skipped = false) {
  const phase = phases[workout.index];
  const running = workout.end !== null;
  if (skipped && phase.type === 'move') workout.skipped = true;
  creditPhase(skipped ? (running ? Math.max(0,workout.end-now) : workout.left) : 0);
  workout.index += 1;
  countdownSecond = null;
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
  if (!workout) return;
  const remaining = Math.ceil((workout.end ? Math.max(0,workout.end-now) : workout.left)/1000);
  if (workout.end && workout.id === preRun.id && phases[workout.index].type === 'move' &&
      remaining >= 1 && remaining <= 3 && remaining !== countdownSecond) {
    countdownSecond = remaining;
    chime('countdown');
  }
  const timer = app.querySelector('#clock');
  if (timer) timer.textContent = clock(remaining);
}

function player() {
  const routine = routineById[workout.id];
  const phase = phases[workout.index];
  const next = phases.slice(workout.index+1).find(item => item.type === 'move');
  const moving = phase.type === 'move';
  const switchingExercise = routine.id === preRun.id && phase.type === 'transition';
  const name = phase.type === 'ready' ? 'Get ready' : phase.type === 'switch' ? 'Switch sides' : switchingExercise ? 'Switch exercise' : moves[phase.key].name;
  const cue = moving ? moves[phase.key].cue : phase.type === 'ready' ? routine.setup : `${moves[phase.key].name}${phase.side ? ' · '+phase.side : ''}`;
  return `<section class="player">
    <div class="player-top">${workout.day ? button('today','Back to Today','text-button') : button('sports','Back to Sports','text-button')}<strong>${routine.title}</strong></div>
    <div class="player-card"><p class="eyebrow">${phase.number ? `Exercise ${phase.number} of ${phase.count}` : 'Starting soon'}${moving && phase.side ? ' · '+phase.side : ''}</p>
    <h1>${name}</h1><div class="clock" id="clock" role="timer">${clock(Math.ceil((workout.end ? Math.max(0,workout.end-Date.now()) : workout.left)/1000))}</div><p class="cue">${cue}</p></div>
    ${next && !switchingExercise ? `<p class="player-next muted">Next · ${moves[next.key].name}${next.side ? ' · '+next.side : ''}</p>` : ''}
    <div class="actions">${workout.end ? button('pause','Pause','primary') : button('resume','Resume','primary')}${button('skip',routine.id === preRun.id && moving ? 'Skip exercise' : 'Skip interval')}${button('sound',data.sound?'Mute':'Unmute','text-button')}</div></section>`;
}

function finishPage() {
  return `<section class="player panel finish"><div class="celebration">${icon('check')}</div>
    <h1>${finish.skipped ? 'Session ended' : 'Session complete'}</h1><p>${routineDuration(finish.seconds/60)} · ${summary()}</p>
    <div class="actions">${button(finish.returnTo,'Done','primary')}</div></section>`;
}

function reminderBanner() {
  const now = new Date();
  const date = dateKey(now);
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  if (!data.reminder || data.reminded === date || time < data.reminder || dailyCompletion(date)) return '';
  return `<div id="reminder-banner" class="panel row" role="status"><span>Your mobility session is ready.</span>${button('dismiss','Dismiss','text-button')}</div>`;
}
function render() {
  nav.innerHTML = navigation.map(([id,label,symbol]) => `<button data-action="${id}" ${screen === id ? 'aria-current="page"' : ''}>${icon(symbol)}${label}</button>`).join('');
  nav.hidden = screen === 'player';
  const views = {today,detail:routineDetail,sports:sportsPage,history:historyPage,player,finish:finishPage,fiery:() => heading('Fiery')+'<section class="panel fiery"><h2>Cardio &amp; HIIT</h2><p>Coming later.</p></section>'};
  app.innerHTML = views[screen]()+(screen === 'today'?reminderBanner():'')+(storageError?'<p class="hint" role="status">This browser could not save your progress on this device.</p>':'');
}

document.addEventListener('click',event => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  const [type,value,minutes] = action.split(':');
  const previous = screen;
  if (['today','sports','fiery','history'].includes(type)) {
    if (screen === 'player') pause();
    screen = type;
  } else if (type === 'daily-duration') { data.dailyMinutes = Number(value); save(); }
  else if (type === 'detail') { detail = routineById[value]; screen = 'detail'; }
  else if (type === 'start') begin(value,Number(minutes));
  else if (type === 'pause') pause();
  else if (type === 'resume') resume();
  else if (type === 'skip') advance(Date.now(),true);
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
    if (shownToday !== dateKey(new Date())) { render(); return; }
    const banner = reminderBanner();
    if (banner && !app.querySelector('#reminder-banner')) app.insertAdjacentHTML('beforeend',banner);
  }
},150);
render();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
