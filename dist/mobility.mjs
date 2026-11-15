const move = (name, side, cue, setup = '') => ({ name, side, cue, setup });

export const moves = {
  circles: move('Supported hip circles', true, 'Hold the wall. Lift your knee and draw a small circle from the hip.', 'Wall'),
  switches: move('90/90 switches', false, 'Sit with knees bent and feet wide. Let both knees roll to one side, then the other.', 'Floor'),
  lifts: move('Seated hip rotation lifts', true, 'Sit tall with knees bent. Keep your knee in place as you lift the foot slightly.', 'Floor'),
  adductor: move('Adductor rock-backs', true, 'From hands and knees, extend one leg out to the side. Gently send your hips back.', 'Floor'),
  cossack: move('Supported Cossack shifts', true, 'Hold a stable support. Bend the working knee and shift your hips over that foot.', 'Wall'),
  squat: move('Squat weight shifts', false, 'Sit into a comfortable squat. Shift your weight slowly from foot to foot.', 'Wall'),
  ankle: move('Knee-to-wall rocks', true, 'Guide your knee toward the wall over your middle toes. Keep your heel down.', 'Wall'),
  calf: move('Straight-knee calf stretch', true, 'Step the working foot back. Keep that knee straight and the heel grounded.', 'Wall'),
  bentCalf: move('Bent-knee calf rocks', true, 'Keep the back heel down as you gently bend the back knee.', 'Wall'),
  heel: move('Slow heel raises', false, 'Rise on both toes. Pause briefly and lower both heels with control.', 'Wall'),
  balance: move('Single-leg toe taps', true, 'Stand on the named leg. With your free foot, tap forward, sideways and back.', 'Wall'),
  swing: move('Front-to-back leg swings', true, 'Use the wall. Swing the working leg gently from the hip without arching your back.', 'Wall'),
  sideSwing: move('Side-to-side leg swings', true, 'Face the wall. Swing the working leg across your body and out to the side.', 'Wall'),
  hinge: move('Bodyweight good mornings', false, 'Soften your knees and send your hips back. Stand tall between reps.'),
  hipFlexor: move('Half-kneeling hip-flexor rocks', true, 'Kneel on the named side. Tuck your pelvis slightly and rock forward a few inches.', 'Floor'),
  hamstring: move('Half-kneeling hamstring rocks', true, 'Extend the named leg in front. Send your hips back and hinge with a long spine.', 'Floor'),
  high: move('Supported high-step taps', true, 'Hold the wall. Lift the named foot to a low target, tap lightly and lower slowly.', 'Wall and low step'),
  step: move('Low step-ups', true, 'Step up with the named foot. Pause, then lower slowly using a steady support.', 'Wall and low step'),
  lateral: move('Lateral step-and-reach', true, 'Step toward the named side. Bend that knee slightly and reach forward as your hips move back.'),
  lunge: move('Lunge with rotation', true, 'Step the named foot forward. Rotate your chest gently toward the front leg.'),
  march: move('Glute bridge march', false, 'Lift your hips from the floor. Alternate lifting one foot a little at a time.', 'Floor'),
  arms: move('Arm circles and swings', false, 'Make easy circles in both directions, then swing your arms across your chest.'),
  thread: move('Thread the needle', true, 'From hands and knees, slide the named arm underneath you, then rotate upward.', 'Floor'),
  scap: move('Wall scapular push-ups', false, 'Keep elbows straight. Let your chest move toward the wall, then push away.', 'Wall'),
  wrists: move('Wrist circles', false, 'With hands relaxed, draw small circles in each direction.'),
  fingers: move('Finger opening and closing', false, 'Open your hands wide, then make a soft fist. Repeat at an easy pace.'),
  quad: move('Supported standing quad stretch', true, 'Use the wall for balance. Bring the named heel toward your seat and keep knees close.', 'Wall'),
  cat: move('Cat-cow', false, 'On hands and knees, slowly round your back, then gently lift your chest.', 'Floor'),
  fold: move('Standing hip fold', false, 'Soften both knees. Fold from the hips to a comfortable depth and come back up.'),
  bridge: move('Glute bridge', false, 'Lie with knees bent. Press both feet down and lift your hips, then lower slowly.', 'Floor'),
  runSwingRight: move('Single-leg swings · Right', false, 'Swing your right leg forward and back. Tap your toes behind you for balance.'),
  runSwingLeft: move('Single-leg swings · Left', false, 'Swing your left leg forward and back. Tap your toes behind you for balance.'),
  openGates: move('Alternating open the gates', false, 'Lift one knee and circle it outward. Take three light steps in place, then switch sides.'),
  bodyweightSquat: move('Bodyweight squats', false, 'Stand with feet shoulder-width and toes slightly out. Keep heels down and knees tracking over your toes.'),
  overheadReach: move('Overhead arm extensions', false, 'Reach one arm overhead as the other reaches down and slightly back. Alternate with control.'),
  footRocks: move('Foot rocks', false, 'Rock back onto your heels to lift your toes, then rise onto the balls of your feet.'),
  lateralLunges: move('Side-to-side lunges', false, 'Shift from side to side with heels down. Let the bent knee track over your toes.'),
  singleLegRdl: move('Alternating single-leg Romanian deadlifts', false, 'Keep a soft bend in your standing knee and hinge at the hip as the other leg reaches back. Alternate sides.'),
  kickBacks: move('Kick backs', false, 'Stand tall and reach one leg back from the hip. Lower it and alternate sides.'),
  legExtensions: move('Leg extensions', false, 'Lift one knee, straighten the leg in front, then lower it with control. Alternate sides.')
};

const routine = (id, title, category, setup, exercises, minutes = 8) =>
  ({ id, title, category, setup, exercises: exercises.split(' '), minutes });

export const daily = [
  routine('hips-ankles', 'Hips & Ankles', 'Hips + ankles', 'Wall and floor', 'circles switches adductor ankle bentCalf cossack squat heel'),
  routine('standing', 'Standing Hips & Hamstrings', 'Standing only', 'Wall nearby', 'swing sideSwing hinge calf quad circles fold heel'),
  routine('side-reach', 'Inner Thighs & Side Reach', 'Hips + inner thighs', 'Wall and floor', 'switches adductor sideSwing cossack lateral lunge hinge squat'),
  routine('balance', 'Feet, Calves & Balance', 'Feet + ankles', 'Wall nearby', 'heel ankle calf bentCalf balance circles hinge squat'),
  routine('rotation', 'Hip Flexors & Rotation', 'Hips + spine', 'Floor space', 'cat hipFlexor hamstring lunge lifts thread march bridge'),
  routine('high-step', 'High-Step Mobility', 'Hips + balance', 'Wall and low step', 'heel circles ankle high step balance squat hinge'),
  routine('easy-flow', 'Easy Lower-Body Flow', 'Easy mobility', 'Wall and floor', 'cat switches hipFlexor hamstring adductor ankle calf bridge')
];

export const quick = routine('quick', '2-minute Reset', 'Quick reset', 'Standing · Wall nearby', 'arms hinge heel', 2);
export const warmup = routine('warmup', 'Before You Climb', 'Climbing warm-up', 'Wall and floor', 'arms thread circles scap wrists fingers lateral heel ankle');
export const preRun = {
  ...routine('pre-run', 'Pre-Run Warm-Up', 'Running warm-up', 'Standing · No equipment', 'runSwingRight runSwingLeft openGates bodyweightSquat overheadReach footRocks lateralLunges singleLegRdl kickBacks legExtensions', 5),
  continuous:true
};

const plan = (id, title, setup, exercises) => routine(id, title, 'Climbing mobility', setup, exercises);
export const weeks = [
  { name:'Find your range', sessions:[
    plan('p1a','Hip Range','Wall and floor','circles switches adductor hipFlexor cossack lifts bridge squat'),
    plan('p1b','Ankle Range','Wall nearby','heel ankle bentCalf calf circles balance squat hinge')] },
  { name:'Control the range', sessions:[
    plan('p2a','Hip Rotation','Wall and floor','switches lifts circles cossack adductor hipFlexor squat bridge'),
    plan('p2b','Foot Placement','Wall and low step','heel balance ankle high step calf hinge squat')] },
  { name:'High steps', sessions:[
    plan('p3a','Lift and Place','Wall and low step','heel circles ankle high step balance squat hinge'),
    plan('p3b','High-Step Setup','Wall, floor and low step','switches ankle lifts high hipFlexor step heel squat')] },
  { name:'Lateral reach', sessions:[
    plan('p4a','Shift Sideways','Wall and floor','switches adductor sideSwing cossack lateral balance squat hinge'),
    plan('p4b','Transfer Weight','Wall and low step','heel ankle balance lateral step high squat hinge')] },
  { name:'Put it together', sessions:[
    plan('p5a','High Foot + Side Reach','Wall and low step','heel ankle cossack high lateral step squat hinge'),
    plan('p5b','Hips + Upper Back','Wall and floor','cat thread lunge circles hipFlexor adductor scap switches')] },
  { name:'Repeat and compare', sessions:[
    plan('p6a','Repeat High Steps','Wall and low step','heel circles ankle high step balance squat hinge'),
    plan('p6b','Repeat Lateral Reach','Wall and floor','switches adductor sideSwing cossack lateral balance squat hinge')] }
];
export const allRoutines = [...daily, quick, warmup, preRun, ...weeks.flatMap(week => week.sessions)];

export function timeline(routine, minutes) {
  if (routine.continuous) {
    return routine.exercises.map((key, index) => ({
      key, type:'move', seconds:30, side:'', number:index+1, count:routine.exercises.length
    }));
  }

  const phases = [{ type:'ready', seconds:10 }];
  let exercises = [...routine.exercises];
  const target = minutes * 60;
  const total = list => 10 + list.reduce((seconds, key) => seconds + (moves[key].side ? 65 : 30), 0);
  const fits = list => target - total(list) >= (list.length - 1) * 5 &&
    target - total(list) <= (list.length - 1) * 10;

  if (!fits(exercises)) {
    // Extend a routine with an ordered repeat of familiar movements. Use the
    // same pool to add a single bilateral or unilateral drill when needed.
    const pool = [...routine.exercises, 'hinge', 'circles'];
    let match;
    for (let count = 0; count <= pool.length * 2 && !match; count += 1) {
      const base = [...exercises, ...Array.from({ length:count }, (_, i) => pool[i % pool.length])];
      match = [base, ...pool.map(key => [...base, key])].find(fits);
      if (total(base) > target) break;
    }
    if (!match) throw new Error(`No ${minutes}-minute timing for ${routine.id}`);
    exercises = match;
  }

  const gaps = exercises.length - 1;
  const gapSeconds = target - total(exercises);
  const secondsPerGap = Math.floor(gapSeconds / gaps);
  const longerGaps = gapSeconds % gaps;
  exercises.forEach((key, index) => {
    const label = { key, number:index + 1, count:exercises.length };
    if (index) phases.push({ ...label, type:'transition', seconds:secondsPerGap + (index <= longerGaps ? 1 : 0), side:moves[key].side ? 'Left' : '' });
    if (moves[key].side) {
      phases.push({ ...label, type:'move', seconds:30, side:'Left' });
      phases.push({ ...label, type:'switch', seconds:5, side:'Right' });
      phases.push({ ...label, type:'move', seconds:30, side:'Right' });
    } else phases.push({ ...label, type:'move', seconds:30, side:'' });
  });
  return phases;
}
