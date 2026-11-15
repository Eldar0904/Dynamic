import { exercisePose } from './exercise-poses.mjs';

const floorExercises = new Set([
  'adductor','switches','lifts','hipFlexor','hamstring','march','thread','cat','bridge',
  'curlUp','deadBug','reverseCrunch','heelTaps','hollow','plank','sidePlank','birdDog','bearTap','bicycle','mountain'
]);
const frontExercises = new Set(['arms','sideSwing','cossack','squat','lateral','lateralLunges','openGates','overheadReach']);
const wallExercises = new Set(['scap','ankle','calf','bentCalf']);

const outfit = {
  shirt:'#e5edf4', shirtShadow:'#afc2d2', shorts:'#3f66b4', shortsShadow:'#304b82',
  skin:'#c88d69', skinLight:'#e8b28d', skinShadow:'#a56e54', shoe:'#edf2fd', sole:'#9daec6',
  hair:'#282f3b'
};

function stroke(context,a,b,width,color) {
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = 'round';
  context.moveTo(a.x,a.y);
  context.lineTo(b.x,b.y);
  context.stroke();
}

function ellipse(context,x,y,radiusX,radiusY,rotation,color) {
  context.beginPath();
  context.fillStyle = color;
  context.ellipse(x,y,radiusX,radiusY,rotation,0,2*Math.PI);
  context.fill();
}

function shape(context,points,color) {
  context.beginPath();
  context.fillStyle = color;
  for (const [index, p] of points.entries()) {
    if (index === 0) context.moveTo(p.x,p.y);
    else context.lineTo(p.x,p.y);
  }
  context.closePath();
  context.fill();
}

function makeView(width,height,key,side) {
  const onFloor = floorExercises.has(key);
  const yaw = frontExercises.has(key) ? .27 : side === 'Right' ? -1.06 : 1.06;
  const pitch = onFloor ? .34 : .10;
  const size = height * (onFloor ? .62 : key === 'step' ? .37 : .44);
  const xOrigin = width * .5;
  const yOrigin = height * (onFloor ? .68 : .93);
  return {
    onFloor, size, project([x,y,z]) {
      const depth = x*Math.sin(yaw)+z*Math.cos(yaw);
      return {
        x:xOrigin+size*(x*Math.cos(yaw)-z*Math.sin(yaw)),
        y:yOrigin+size*(depth*Math.sin(pitch)-y*Math.cos(pitch)),
        depth:depth*Math.cos(pitch)+y*Math.sin(pitch)
      };
    }
  };
}

function drawStage(context,width,height,view,key) {
  const fade = context.createLinearGradient(0,0,0,height);
  fade.addColorStop(0,'#eef4f9');
  fade.addColorStop(1,'#d4e1ed');
  context.fillStyle = fade;
  context.fillRect(0,0,width,height);
  const { project, onFloor, size } = view;
  const ground = project([0,0,0]);
  if (onFloor) {
    const mat = [[-.50,0,-1.13],[.50,0,-1.13],[.50,0,.89],[-.50,0,.89]];
    shape(context,mat.map(project),'#a4bdd7');
    stroke(context,project(mat[3]),project(mat[2]),2,'#91aac6');
  } else {
    ellipse(context,ground.x,ground.y+4,size*.57,size*.075,0,'#8098ad44');
  }
  if (wallExercises.has(key)) {
    const wallZ = key === 'scap' ? .77 : .68;
    shape(context,[[-.70,0,wallZ],[-.70,1.73,wallZ],[.70,1.73,wallZ],[.70,0,wallZ]].map(project),'#a4b9d14d');
    stroke(context,project([.70,0,wallZ]),project([.70,1.73,wallZ]),2,'#8ea6c2');
  }
  if (key === 'step' || key === 'high') {
    const base = [[-.38,0,.27],[.38,0,.27],[.38,0,.69],[-.38,0,.69]];
    const top = base.map(([x,,z]) => [x,key === 'step' ? .26 : .34,z]);
    shape(context,[base[0],base[1],top[1],top[0]].map(project),'#829cbd');
    shape(context,[base[1],base[2],top[2],top[1]].map(project),'#7892b5');
    shape(context,top.map(project),'#b4c9e1');
  }
}

function drawFigure(context,view,pose) {
  const { project, size } = view;
  const layers = [];
  const segment = (start,end,width,color,bias = 0) => {
    const a = project(start);
    const b = project(end);
    layers.push({ depth:(a.depth+b.depth)/2+bias, draw:() => stroke(context,a,b,width*size,color) });
  };

  for (const [index,[hip,knee,ankle,toe]] of pose.legs.entries()) {
    const near = index === 1;
    const cuff = hip.map((value,i) => value + .52 * (knee[i]-value));
    segment(hip,cuff,.17,near ? outfit.shorts : outfit.shortsShadow);
    segment(cuff,knee,.132,near ? outfit.skin : outfit.skinShadow);
    segment(knee,ankle,.10,near ? outfit.skinLight : outfit.skin);
    segment(ankle,toe,.127,outfit.sole,.01);
    segment(ankle,toe,.102,near ? outfit.shoe : '#d4dfec',.02);
  }
  const hips = pose.legs.map(leg => project(leg[0]));
  const shoulders = pose.arms.map(arm => project(arm[0]));
  const lower = project(pose.hip);
  const upper = project(pose.chest);
  layers.push({
    depth:(upper.depth+lower.depth)/2, draw() {
      stroke(context,hips[0],hips[1],.16*size,outfit.shortsShadow);
      stroke(context,lower,upper,.27*size,outfit.shirtShadow);
      shape(context,[hips[0],shoulders[0],shoulders[1],hips[1]],outfit.shirt);
      stroke(context,shoulders[0],shoulders[1],.116*size,outfit.shirt);
    }
  });
  for (const [index,[shoulder,elbow,hand]] of pose.arms.entries()) {
    const near = index === 1;
    const cuff = shoulder.map((value,i) => value + .33 * (elbow[i]-value));
    segment(shoulder,cuff,.145,near ? outfit.shirt : outfit.shirtShadow,.005);
    segment(cuff,elbow,.092,near ? outfit.skinLight : outfit.skin);
    segment(elbow,hand,.074,near ? outfit.skinLight : outfit.skin);
    const palm = project(hand);
    layers.push({depth:palm.depth+.01,draw:() => ellipse(context,palm.x,palm.y,.043*size,.039*size,0,outfit.skin)});
  }
  segment(pose.chest,pose.neck,.11,outfit.skinShadow);
  const head = project(pose.head);
  layers.push({
    depth:head.depth, draw() {
      const neck = project(pose.neck);
      const angle = Math.atan2(head.y-neck.y,head.x-neck.x)+Math.PI/2;
      ellipse(context,head.x,head.y,.084*size,.115*size,angle,outfit.skinLight);
      ellipse(context, head.x+.052*size*Math.sin(angle),head.y-.052*size*Math.cos(angle),
        .082*size,.068*size,angle,outfit.hair);
    }
  });
  layers.sort((a,b) => a.depth-b.depth).forEach(layer => layer.draw());
}

function drawHands(context,width,height,key,phase) {
  const size = height/3.3;
  const angle = phase*2*Math.PI;
  for (const side of [-1,1]) {
    context.save();
    context.translate(width*.50+side*size*.60,height*.65);
    const wrist = {x:0,y:0};
    stroke(context,{x:side*size*.48,y:size*.86},wrist,size*.33,outfit.skinShadow);
    context.rotate(side*(key === 'wrists' ? .48*Math.sin(angle) : .12));
    stroke(context,wrist,{x:0,y:-size*.4},size*.36,outfit.skinLight);
    for (let index = 0; index < 4; index += 1) {
      const x = size*(index-1.5)*.113;
      const extension = key === 'fingers' ? .48+.34*Math.cos(angle) : .67;
      stroke(context,{x,y:-size*.4},{x:x*(1+extension*.5),y:-size*(.38+extension*(index===0 || index===3 ? .67 : .85))},size*.089,outfit.skinLight);
    }
    stroke(context,{x:0,y:-size*.13},{x:-side*size*.30,y:-size*.27},size*.115,outfit.skin);
    context.restore();
  }
}

const holds = new Set(['hollow','plank','sidePlank']);

export function drawExercise(canvas,key,side,elapsed) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const { width, height } = canvas;
  const progress = elapsed/3500;
  const view = makeView(width,height,key,side);
  drawStage(context,width,height,view,key);
  if (key === 'wrists' || key === 'fingers') drawHands(context,width,height,key,progress);
  else drawFigure(context,view,exercisePose(key,side,progress));
}

export function mountExerciseDemo(container,key,side,{ playing,onToggle }) {
  const canvas = container.querySelector('canvas');
  const button = container.querySelector('button');
  let frame;
  let time = holds.has(key) ? 0 : 900;
  let lastFrame = null;

  function animate(timestamp) {
    if (lastFrame !== null) time += timestamp-lastFrame;
    lastFrame = timestamp;
    drawExercise(canvas,key,side,time);
    frame = requestAnimationFrame(animate);
  }

  function update() {
    button.hidden = holds.has(key);
    button.textContent = playing ? 'Pause demo' : 'Play demo';
    if (playing && !holds.has(key)) frame = requestAnimationFrame(animate);
    else drawExercise(canvas,key,side,time);
  }

  button.addEventListener('click',() => {
    cancelAnimationFrame(frame);
    lastFrame = null;
    playing = !playing;
    onToggle(playing);
    update();
  });
  update();
  return () => cancelAnimationFrame(frame);
}
