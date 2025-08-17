export function updateHUD(state) {
  set("#time", fmtTime(state.time));
  set("#dist", Math.floor(state.dist));
  set("#sr", state.sr);
  set("#hr", Math.round(state.hr));
  set("#gels", state.stats.gels);
  set("#beers", state.stats.beers);

  // SR bar: map 0..240
  setBar("#srBar", Math.min(1, state.sr/240));
  // HR bar: map 60..160
  const hrp = Math.max(0, Math.min(1, (state.hr-60)/(160-60)));
  setBar("#hrBar", hrp);
}

function set(sel, v){ document.querySelector(sel).textContent = v; }
function setBar(sel, p){ document.querySelector(sel+" > div").style.width = (p*100).toFixed(1)+"%"; }

export function showFinish(timeStr) {
  document.querySelector("#finishTime").textContent = timeStr;
  document.querySelector("#finish").classList.remove("hidden");
}
export function hideFinish() { document.querySelector("#finish").classList.add("hidden"); }

export function fmtTime(t){
  const ms = Math.floor((t*1000)%1000).toString().padStart(3,"0");
  const s = Math.floor(t)%60;
  const m = Math.floor(t/60);
  return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}.${ms}`;
}
