// The athlete faces positive Z. Positive X is his left, and the floor is Y=0.
const point = (x, y, z) => [x, y, z];
const add = (a, b) => a.map((value, i) => value + b[i]);
const sub = (a, b) => a.map((value, i) => value - b[i]);
const scale = (a, factor) => a.map(value => value * factor);
const unit = vector => scale(vector, 1 / (Math.hypot(...vector) || 1));
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const lerp = (a, b, amount) => add(a, scale(sub(b, a), amount));
const sides = [-1, 1];
const pi = Math.PI;

function joint(start, end, lengthA, lengthB, direction) {
  const axis = unit(sub(end, start));
  const reach = Math.max(.03, Math.min(lengthA + lengthB - .001, Math.hypot(...sub(end, start))));
  const along = (lengthA ** 2 + reach ** 2 - lengthB ** 2) / (2 * reach);
  const outward = unit(sub(direction, scale(axis, dot(direction, axis))));
  return add(add(start, scale(axis, along)), scale(outward, Math.sqrt(Math.max(0, lengthA ** 2 - along ** 2))));
}

function rig(hip, chest, settings = {}) {
  const { turn = 0, roll = 0, feet = [], hands = [], elbows = [], knees = [], head,
    legHint = [0, 0, 1], armHint = [0, -1, 0], toes = [] } = settings;
  const across = [Math.cos(turn) * Math.cos(roll), Math.sin(roll), Math.sin(turn) * Math.cos(roll)];
  const torso = unit(sub(chest, hip));
  return {
    hip, chest,
    neck: add(chest, scale(torso, .10)),
    head: head ?? add(chest, scale(torso, .22)),
    legs: sides.map((side, i) => {
      const start = add(hip, [side * .13, 0, 0]);
      const end = feet[i] ?? [side * .17, .07, 0];
      const knee = knees[i] ?? joint(start, end, .43, .43, legHint);
      return [start, knee, end, toes[i] ?? add(end, [0, -.025, .135])];
    }),
    arms: sides.map((side, i) => {
      const start = add(chest, scale(across, side * .24));
      const end = hands[i] ?? add(start, [side * .035, -.55, .045]);
      return [start, elbows[i] ?? joint(start, end, .31, .285, armHint), end];
    })
  };
}

const standing = (settings = {}) => rig(
  settings.hip ?? [0, .94, 0],
  settings.chest ?? [0, 1.46, 0],
  settings
);
const floor = (hip, chest, settings = {}) => rig(hip, chest, settings);
const pair = (active, value, other) => active < 0 ? [value, other] : [other, value];
const feet = (spread = .17) => [[-spread, .07, 0], [spread, .07, 0]];
const easy = amount => .5 - .5 * Math.cos(pi * amount);

function lunge(active, amount, turn = 0, kneel = false) {
  const hip = [0, .74 - .13 * amount, .065 + .15 * amount];
  const chest = [0, hip[1] + .50, hip[2] + .07 * amount];
  return rig(hip, chest, {
    turn,
    feet: pair(active, [active * .16, .07, .50], [-active * .15, .075, -.46]),
    knees: kneel ? pair(active, [active * .16, .48, .52], [-active * .15, .085, -.14]) : [],
    hands: turn ? [[-.26, chest[1]-.16, .53], [.26, chest[1]-.16, -.2]] : undefined
  });
}

function lateral(active, amount, reach = false, narrow = false) {
  const hip = [active * amount * .33, .89 - .30 * amount, -.12 * amount];
  const chest = [hip[0], hip[1] + .47, .18 * amount];
  const stance = narrow ? .32 : .48;
  const endFeet = pair(active, [active * (narrow ? .20 + .25 * amount : stance), .07, 0], [-active * stance, .07, 0]);
  return rig(hip, chest, {
    feet:endFeet,
    hands:sides.map(side => [hip[0] + side * .22, chest[1] - .2, reach ? .44 * amount : .23])
  });
}

function squat(amount, shift = 0) {
  const hip = [shift, .94 - .40 * amount, -.24 * amount];
  return rig(hip, [shift, hip[1] + .48, .11 * amount], {
    feet:feet(.26), hands:sides.map(side => [shift + side*.22, hip[1]+.27, .33 + .19*amount])
  });
}

function swing(active, motion, sideToSide = false) {
  const swinging = sideToSide
    ? [active * (.17 + .54 * motion), .08 + .18 * Math.abs(motion), .09]
    : [active * .19, .09 + .24 * Math.abs(motion), .57 * motion];
  return standing({
    hip:[-.075 * active, .91, 0], chest:[-.075 * active, 1.43, 0],
    feet:pair(active, swinging, [-active * .14, .07, 0]),
    hands:pair(active, [active * .34, 1.21, .16], [-active * .30, 1.23, .49])
  });
}

function allFours({ round = 0, rotate = 0, active = 1, extend = 0, wide = false, hover = false, tap = 0, rock = 0 } = {}) {
  const hip = [0,.54 + .06 * (hover ? 1 : round), -.38 - rock * .26];
  const chest = [0,.56 + .13 * round, .20 - rock * .27];
  const arms = [[-.25,.055,.31],[.25,.055,.31]];
  if (rotate) arms[active > 0 ? 1 : 0] = [active * (.21 + .24 * Math.max(0, rotate)), .46 + .57 * rotate, .10];
  if (extend) arms[active > 0 ? 0 : 1] = lerp(arms[active > 0 ? 0 : 1],[-active*.23,.62,.82],extend);
  if (tap) arms[active > 0 ? 1 : 0] = lerp([active*.25,.055,.31],[-active*.19,.51,.23],tap);
  return floor(hip,chest, {
    turn:rotate*.90, roll:active * rotate * .65,
    knees:pair(active,
      wide ? [active*.49,.31,-.40] : lerp([active*.15,hover?.21:.085,-.36],[active*.16,.54,-.76],extend),
      [-active*.14,hover?.21:.085,-.36]),
    feet:pair(active,wide ? [active*.87,.07,-.41] : lerp([active*.15,.06,-.77],[active*.16,.54,-1.16],extend),
      [-active*.14,.06,-.77]),
    hands:arms, head:[0,.61 + .12 * round,.43 - rock*.25]
  });
}

function seated(active, amount, lift = false) {
  const roll = active * amount;
  const hip = [0,.15,0];
  const knee = side => [side*.35 + roll*.20, .36 - .25*Math.abs(roll), .32];
  const foot = side => [side*.32 - roll*.15, .055 + (lift && side === active ? .15*amount : 0), .67];
  return floor(hip,[roll*.06,.65,.03],{
    knees:sides.map(knee), feet:sides.map(foot), hands:[[-.35,.08,-.18],[.35,.08,-.18]]
  });
}

function backPose({ curl = 0, tabletop = 0, active = 1, reach = 0, tuck = 0, tap = 0, twist = 0, bridge = 0 } = {}) {
  const hip = [0,.13 + .27*bridge + .16*tuck, -.09*tuck];
  const chest = [0,.14 + .16*curl, -.49 + .036*curl];
  const knees = sides.map(side => {
    const lowered = side === active;
    return [side*.15,.41 + .17*tabletop - (lowered ? .36*reach + .12*tap : 0), .33 - .31*tabletop - .18*tuck + (lowered ? .43*reach + .16*tap : 0)];
  });
  const endFeet = sides.map(side => {
    const lowered = side === active;
    return [side*.15,.07+.47*tabletop-.22*tuck - (lowered ? .43*reach + .47*tap : 0), .73 - .25*tabletop - .14*tuck + (lowered ? .35*reach + .11*tap : 0)];
  });
  let hands = sides.map(side => [side*.28,.13 + .23*curl,.05 + .15*curl]);
  if (reach) hands = pair(-active,[-active*.22,.73-.56*reach,-.46-.46*reach],[active*.22,.73,-.46]);
  if (twist) hands = sides.map(side => [side*.14,.24+.19*curl,-.64]);
  return floor(hip,chest,{
    knees, feet:endFeet, hands, turn:twist*.35, roll:twist*.40,
    head:[0,.19 + .19*curl,-.73 + .08*curl]
  });
}

function plank(high, active = 1, pull = 0) {
  const height = high ? .66 : .43;
  const toes = sides.map(side => [side*.16,.025,-.77]);
  return floor([0,height*.78,-.28],[0,height,.25],{
    feet:pair(active,[active*.15,.11+.13*pull,-.87+.58*pull],[-active*.16,.11,-.87]),
    knees:pull ? pair(active,[active*.15,.31-.08*pull,-.56+.66*pull],[-active*.16,height*.49,-.58]) : undefined,
    hands:[[-.25,.045,high?.25:.58],[.25,.045,high?.25:.58]],
    elbows:high ? undefined : [[-.25,.07,.25],[.25,.07,.25]],
    toes:pull ? undefined : toes, legHint:[0,-1,0], head:[0,height+.04,.46]
  });
}

function ankleRocks(active, amount, style) {
  const ankle = style === 'ankle';
  const hip = [0,.88 - (ankle ? .08 : .035)*amount,.14*amount];
  return rig(hip,[0,hip[1]+.49,.13+.15*amount],{
    feet:pair(active,[active*.16,.07,ankle?.29:-.46],[-active*.16,.07,ankle?-.12:.32]),
    knees:style === 'calf' ? pair(active,[active*.15,.48,-.23],[-active*.16,.45,.27]) : undefined,
    hands:[[-.24,1.19,.62],[.24,1.19,.62]]
  });
}

export const exercisePoses = {
  arms: ({angle}) => standing({ hands:sides.map(side => [side*(.53 + .25*Math.sin(angle)),1.40+.53*Math.cos(angle),.16+.10*Math.sin(angle)]) }),
  circles: ({angle,side}) => standing({ feet:pair(side,[side*(.31+.19*Math.cos(angle)),.36+.10*Math.sin(angle),.32+.10*Math.cos(angle)],[-side*.16,.07,0]), hands:[[-.30,1.22,.49],[.30,1.22,.49]] }),
  switches: ({wave}) => seated(Math.sign(wave) || 1,Math.abs(wave)),
  lifts: ({side,u}) => seated(side,u*.75,true),
  adductor: ({side,u}) => allFours({active:side,wide:true,rock:u}),
  cossack: ({side,u}) => lateral(side,u,false),
  squat: ({wave}) => squat(.82,.14*wave),
  ankle: ({side,u}) => ankleRocks(side,u,'ankle'),
  calf: ({side,u}) => ankleRocks(side,.55+.15*u,'calf'),
  bentCalf: ({side,u}) => ankleRocks(side,.2+.8*u,'bent'),
  heel: ({u}) => standing({ hip:[0,.92+.11*u,0], chest:[0,1.44+.11*u,0], feet:sides.map(side => [side*.17,.07+.11*u,0]), toes:sides.map(side => [side*.17,.035,.135]) }),
  balance: ({side,angle,u}) => standing({ hip:[-side*.11,.91,0], chest:[-side*.11,1.43,0], feet:pair(side,[side*(.21+.28*Math.abs(Math.sin(angle))),.07+.09*u,.44*Math.cos(angle)],[-side*.17,.07,0]) }),
  swing: ({side,wave}) => swing(side,wave),
  sideSwing: ({side,wave}) => swing(side,wave,true),
  hinge: ({u}) => standing({ hip:[0,.89,-.23*u], chest:[0,1.40-.42*u,.32*u], hands:sides.map(side => [side*.17,1.01-.47*u,.42*u]) }),
  hipFlexor: ({side,u}) => lunge(side,u,0,true),
  hamstring: ({side,u}) => floor([0,.51,-.20-.18*u],[0,1.02-.16*u,.20*u],{ knees:pair(side,[side*.15,.26,.25],[-side*.15,.08,-.18]), feet:pair(side,[side*.16,.09,.64],[-side*.16,.06,-.54]), hands:sides.map(value => [value*.18,.48-.15*u,.26]) }),
  high: ({side,u}) => standing({ feet:pair(side,[side*.20,.07+.32*u,.09+.38*u],[-side*.16,.07,0]), hands:[[-.28,1.27,.39],[.28,1.27,.39]] }),
  step: ({side,u}) => standing({ hip:[0,.92+.31*u,.39*u], chest:[0,1.43+.31*u,.39*u], feet:pair(side,[side*.16,.31,.47],[-side*.16,.07+.34*u,.36*u]) }),
  lateral: ({side,u}) => lateral(side,u,true,true),
  lunge: ({side,u}) => lunge(side,.45,side*.88*u),
  march: ({active,a}) => {
    const pose = backPose({bridge:.95});
    const leg = pose.legs[active > 0 ? 1 : 0];
    const lift = [0,.25*a,-.18*a];
    leg[1] = add(leg[1],scale(lift,.48));
    leg[2] = add(leg[2],lift);
    leg[3] = add(leg[3],lift);
    return pose;
  },
  thread: ({side,wave}) => allFours({active:side,rotate:wave*.84}),
  scap: ({u}) => standing({ chest:[0,1.42,.15+.16*u], hands:[[-.25,1.30,.73],[.25,1.30,.73]] }),
  wrists: () => standing({ hands:[[-.36,1.22,.39],[.36,1.22,.39]], elbows:[[-.31,1.16,.12],[.31,1.16,.12]] }),
  fingers: () => standing({ hands:[[-.25,1.32,.41],[.25,1.32,.41]] }),
  quad: ({side,u}) => standing({ feet:pair(side,[side*.19,.56+.10*u,-.30],[-side*.16,.07,0]), knees:pair(side,[side*.18,.50,-.05],[-side*.16,.48,0]), hands:pair(side,[side*.20,.61+.10*u,-.32],[-side*.32,1.24,.38]) }),
  cat: ({wave}) => allFours({round:wave}),
  fold: ({u}) => standing({ hip:[0,.89,-.16*u], chest:[0,1.40-.67*u,.38*u], hands:sides.map(side => [side*.22,1.00-.77*u,.37*u]) }),
  bridge: ({u}) => backPose({bridge:u}),
  runSwingRight: ({wave}) => swing(-1,wave),
  runSwingLeft: ({wave}) => swing(1,wave),
  openGates: ({active,a}) => standing({ feet:pair(active,[active*(.16+.35*a),.08+.30*a,.42*a],[-active*.17,.07,0]), knees:pair(active,[active*(.16+.34*a),.47+.39*a,.46*a],[-active*.17,.49,0]) }),
  bodyweightSquat: ({u}) => squat(u),
  overheadReach: ({wave}) => standing({ hands:sides.map(side => [side*.37,1.33+.64*side*wave,.06-.18*side*wave]) }),
  footRocks: ({wave}) => standing({ hip:[0,.94+.075*Math.max(0,wave),0], chest:[0,1.46+.075*Math.max(0,wave),0], feet:sides.map(side => [side*.17,.07+.08*Math.max(0,wave),0]), toes:sides.map(side => [side*.17,.035+.11*Math.max(0,-wave),.135]) }),
  lateralLunges: ({active,a}) => lateral(active,a),
  singleLegRdl: ({active,a}) => standing({ hip:[0,.91,-.09*a], chest:[0,1.43-.48*a,.47*a], feet:pair(active,[active*.17,.07+.73*a,-.85*a],[-active*.17,.07,0]), hands:sides.map(side => [side*.18,1.04-.54*a,.45*a]) }),
  kickBacks: ({active,a}) => standing({ feet:pair(active,[active*.18,.07+.22*a,-.53*a],[-active*.17,.07,0]) }),
  legExtensions: ({active,a}) => standing({ feet:pair(active,[active*.17,.07+.58*a,.68*a],[-active*.17,.07,0]), knees:pair(active,[active*.17,.48+.20*a,.37*a],[-active*.17,.49,0]) }),
  curlUp: ({u}) => backPose({curl:u*.72}),
  deadBug: ({active,a}) => {
    const pose = backPose({tabletop:1,active,reach:a*.98});
    if (!a) pose.arms.forEach((arm,i) => { arm[2] = [sides[i]*.22,.73,-.46]; arm[1] = [sides[i]*.22,.44,-.49]; });
    return pose;
  },
  reverseCrunch: ({u}) => backPose({tabletop:1,tuck:u}),
  heelTaps: ({active,a}) => backPose({tabletop:1,active,tap:a}),
  hollow: () => backPose({tabletop:.73,curl:.82}),
  plank: () => plank(false),
  sidePlank: ({side}) => floor([0,.34,-.20],[0,.51,.31],{roll:-side*1.43,feet:[[-.08,.06,-.57],[.08,.08,-.57]],knees:pair(side,[side*.07,.075,-.44],[-side*.07,.16,-.44]),hands:pair(side,[side*.07,.07,.51],[-side*.09,.65,.12]),elbows:pair(side,[side*.07,.07,.27],[-side*.12,.72,.26]),head:[0,.55,.54]}),
  birdDog: ({side,u}) => allFours({active:side,extend:u}),
  bearTap: ({side,u}) => allFours({active:side,hover:true,tap:u}),
  bicycle: ({active,a}) => backPose({tabletop:1,curl:.52+.37*a,active,reach:a*.92,twist:active*a}),
  mountain: ({active,a}) => plank(true,active,a*.87)
};

export function exercisePose(key, sideName, progress) {
  const phase = progress % 1;
  const active = phase < .5 ? -1 : 1;
  const angle = phase * 2 * pi;
  const pose = exercisePoses[key]({
    angle, wave:Math.sin(angle), u:easy(1-Math.abs(2*phase-1)),
    a:Math.sin(phase * 2 * pi) ** 2, active, side:sideName === 'Right' ? -1 : 1
  });
  return pose;
}
