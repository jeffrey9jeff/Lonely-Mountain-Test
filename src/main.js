import { ASSETS, loadImages } from "./assets.js";
import { Parallax } from "./parallax.js";
import { Runner } from "./runner.js";
import { Pickups } from "./pickups.js";
import { COURSE } from "./config.js";
import { updateHUD, showFinish, hideFinish, fmtTime } from "./hud.js";
import { submitLocal, submitRemoteIfConfigured, renderLB } from "./leaderboard.js";

// Hide finish overlay on boot (safeguard against stuck overlay)
window.addEventListener("load", () => {
  const finishOverlay = document.getElementById("finish-overlay");
  if (finishOverlay) {
    finishOverlay.style.display = "none";
  }
});


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let imgs, runner, bg, pickups, camX, finished=false;

setup().then(() => {
  renderLB();
  reset();
  loop(0);
});

async function setup(){
  resize(); addEventListener("resize", resize);
  imgs = await loadImages(ASSETS);
  // Compose atlas access shape used by Runner
  imgs.gus = { gus: { atlas: imgs.gus.atlas, w:ASSETS.gus.w, h:ASSETS.gus.h, frames:ASSETS.gus.frames, fps:ASSETS.gus.fps } };
  bg = new Parallax(imgs, canvas);
  pickups = new Pickups();
  hideFinish();  // ensure overlay is hidden on first load

  // input: ArrowLeft / ArrowRight = tap cadence
  window.addEventListener("keydown", (e)=>{
    if (e.repeat) return;
    if (e.key === "ArrowRight" || e.key==="ArrowLeft") {
      runner.tap(performance.now());
    }
  });

  // finish overlay buttons
  document.getElementById("restart").onclick = () => { hideFinish(); reset(); };
  document.getElementById("submitRun").onclick = () => {
    const payload = {
      name: document.getElementById("nick").value || "Runner",
      time: runner.time,
      gels: runner.stats.gels,
      beers: runner.stats.beers,
      route: "goat"
    };
    submitLocal(payload);
    submitRemoteIfConfigured(payload);
    hideFinish();
    reset();
  };
}

function reset(){
  runner = new Runner(imgs);
  camX = 0;
  pickups.reset();
  finished=false;
  hideFinish();  // hide if it was left open
}

let lastTs = 0, acc = 0;
function loop(ts){
  requestAnimationFrame(loop);
  if (!lastTs) lastTs = ts;
  let dt = (ts - lastTs) / 1000; lastTs = ts;
  // clamp dt (tab switch safety)
  dt = Math.min(dt, 0.05);
  acc += dt;

  // fixed timestep
  const step = COURSE.timestep;
  while (acc >= step && !finished) {
    runner.update(step, runner.time);
    pickups.checkCollect(runner, runner.time);
    // camera follows runner
    camX = runner.dist * COURSE.px_per_m - 100;
    if (runner.dist >= COURSE.length_m) {
      finished = true;
      showFinish(fmtTime(runner.time));
    }
    acc -= step;
  }

  draw();
  updateHUD(runner);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  bg.draw(ctx, camX);
  pickups.draw(ctx, camX);
  runner.draw(ctx, camX);
}

function resize(){
  canvas.width = Math.floor(innerWidth);
  canvas.height = Math.floor(innerHeight * 0.68);
}
