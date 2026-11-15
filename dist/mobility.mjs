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
  legExtensions: move('Leg extensions', false, 'Lift one knee, straighten the leg in front, then lower it with control. Alternate sides.'),
  curlUp: move('Curl-up', false, 'Lie with knees bent and feet planted. Exhale as you lift your shoulder blades a little, then lower slowly.', 'Floor'),
  deadBug: move('Dead bug', false, 'Start on your back with arms up and knees over your hips. Lower opposite arm and leg, then switch. Keep your ribs down.', 'Floor'),
  reverseCrunch: move('Reverse crunch', false, 'With knees bent, slowly curl your pelvis off the floor. Lower your hips with control.', 'Floor'),
  heelTaps: move('Alternating heel taps', false, 'From tabletop legs, lower one heel to the floor while keeping your knee bent. Return, then switch.', 'Floor'),
  hollow: move('Tucked hollow hold', false, 'Lift your shoulder blades and knees, reaching toward your heels. Keep your lower back gently on the floor.', 'Floor'),
  plank: move('Forearm plank', false, 'Put elbows under shoulders. Brace gently and keep a straight line from shoulders to heels.', 'Floor'),
  sidePlank: move('Knee-supported side plank', true, 'Rest on the named forearm with knees bent. Lift your hips and keep your shoulders stacked.', 'Floor'),
  birdDog: move('Bird dog', true, 'From hands and knees, extend the named leg and the opposite arm. Keep your hips level.', 'Floor'),
  bearTap: move('Bear shoulder taps', true, 'Hover your knees just above the floor. Tap the opposite shoulder with the named hand without shifting your hips.', 'Floor'),
  bicycle: move('Slow bicycle crunch', false, 'Turn one shoulder toward the opposite knee as you extend the other leg. Lower and switch sides slowly.', 'Floor'),
  mountain: move('Slow mountain climbers', false, 'From a high plank, draw one knee forward. Place the foot back down before changing sides.', 'Floor')
};

const routine = (id, title, setup, exercises, minutes = 8) =>
  ({ id, title, setup, exercises: exercises.split(' '), minutes });

export const dailyDurations = [8, 12, 15];

function dailyRoutine(id, title, focus, base, extra12, extra15) {
  const session = routine(id, title, 'Wall and floor', base);
  const extended = [...session.exercises, ...extra12.split(' ')];
  return { ...session, focus, variants: { 8:session.exercises, 12:extended, 15:[...extended, ...extra15.split(' ')] } };
}

export const daily = [
  dailyRoutine('daily-reach', 'Reach & Rotate', 'Shoulders, upper back and hips',
    'arms scap ankle lunge cat thread hipFlexor hamstring', 'switches lifts adductor bridge', 'wrists calf quad'),
  dailyRoutine('daily-hinge', 'Hinge & Open', 'Shoulders, hamstrings and ankles',
    'arms swing calf hinge scap quad thread hamstring', 'cat lunge hipFlexor switches', 'fold adductor ankle'),
  dailyRoutine('daily-lateral', 'Side-to-Side Flow', 'Upper back, inner thighs and hips',
    'arms sideSwing lateral cossack squat cat thread adductor', 'wrists balance circles switches', 'scap lunge hipFlexor'),
  dailyRoutine('daily-balance', 'Footwork & Reach', 'Shoulders, feet and balance',
    'heel ankle balance scap swing lunge cat thread', 'arms calf bentCalf bridge', 'wrists lateral hamstring'),
  dailyRoutine('daily-rotation', 'Spine & Hip Rotation', 'Spine, shoulders and hip flexors',
    'arms circles lateral lunge cat thread hipFlexor switches', 'scap lifts adductor march', 'wrists hamstring quad'),
  dailyRoutine('daily-control', 'Hips & Shoulder Control', 'Shoulders, hips and ankles',
    'arms ankle cossack scap cat thread lifts adductor', 'wrists lunge hipFlexor switches', 'bridge balance hamstring'),
  dailyRoutine('daily-stretch', 'Full-Body Stretch', 'Upper back, hips and calves',
    'arms calf quad fold cat thread hipFlexor hamstring', 'scap ankle adductor switches', 'bridge bentCalf lifts')
];

export const climbing = [
  routine('climb-hips', 'Hips & High Steps', 'Wall, floor and low step', 'heel ankle high step cossack squat switches adductor'),
  routine('climb-shoulders', 'Shoulders, Wrists & Reach', 'Wall and floor', 'arms scap wrists fingers lunge thread cat adductor bridge switches'),
  routine('climb-full', 'Full-Body Climbing Mobility', 'Wall and floor', 'arms circles ankle scap lateral lunge thread cat')
];
export const strong = [
  routine('strong-basics', 'Core Basics', 'Floor space', 'curlUp deadBug heelTaps reverseCrunch hollow plank', 4),
  routine('strong-stability', 'Core Stability', 'Floor space', 'deadBug heelTaps birdDog plank sidePlank hollow reverseCrunch mountain', 6),
  routine('strong-circuit', 'Ab Circuit', 'Floor space', 'curlUp deadBug reverseCrunch bicycle heelTaps birdDog plank sidePlank bearTap mountain')
];
const preRunMoves = 'runSwingRight runSwingLeft openGates bodyweightSquat overheadReach footRocks lateralLunges singleLegRdl kickBacks legExtensions';
const switchSeconds = 5;
const preRunCount = preRunMoves.split(' ').length;
const preRunMinutes = (preRunCount * 30 + (preRunCount - 1) * switchSeconds) / 60;
export const preRun = routine('pre-run', 'Pre-Run Warm-Up', 'Standing · No equipment', preRunMoves, preRunMinutes);

export function timeline(routine, minutes) {
  if (routine.id === preRun.id) {
    const phases = [];
    // Saved five-minute warm-ups resume with their original exercise indices.
    const includeSwitches = minutes !== 5;
    routine.exercises.forEach((key, index) => {
      const label = { key, side:'', number:index+1, count:routine.exercises.length };
      if (includeSwitches && index > 0) {
        phases.push({ ...label, type:'transition', seconds:switchSeconds });
      }
      phases.push({ ...label, type:'move', seconds:30 });
    });
    return phases;
  }

  const phases = [{ type:'ready', seconds:10 }];
  const exercises = routine.variants?.[minutes] ?? routine.exercises;
  const target = minutes * 60;
  const gaps = exercises.length - 1;
  const exerciseSeconds = exercises.reduce((seconds, key) => seconds + (moves[key].side ? 60 + switchSeconds : 30), 0);
  const gapSeconds = target - phases[0].seconds - exerciseSeconds;
  if (gapSeconds < gaps * 5 || gapSeconds > gaps * 10) {
    throw new Error(`No ${minutes}-minute timing for ${routine.id}`);
  }
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
