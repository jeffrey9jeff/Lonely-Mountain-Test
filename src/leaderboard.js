import { fmtTime } from "./hud.js";
import { RULESET } from "./config.js";

// LocalStorage fallback (you can swap for a real endpoint later)
const KEY = "gus_arcade_lb_v1";

export function loadLB() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; }
  catch { return []; }
}
export function saveLB(rows){ localStorage.setItem(KEY, JSON.stringify(rows)); }

export function submitLocal({name, time, gels, beers, route}) {
  const rows = loadLB();
  rows.push({ name: name||"Runner", time_ms: Math.round(time*1000), gels, beers, route: route||"goat", date: new Date().toISOString().slice(0,10), ruleset: RULESET });
  rows.sort((a,b)=> a.time_ms - b.time_ms);
  saveLB(rows.slice(0,100));
  renderLB();
}

export function renderLB() {
  const rows = loadLB();
  const tb = document.querySelector("#lb tbody");
  tb.innerHTML = "";
  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${escapeHtml(r.name)}</td><td>${fmtTime(r.time_ms/1000)}</td><td>${r.gels}</td><td>${r.beers}</td><td>${r.route}</td><td>${r.date}</td>`;
    tb.appendChild(tr);
  });
}

// optional: POST to your endpoint; set LEADERBOARD_URL to enable
export async function submitRemoteIfConfigured(payload){
  const url = window.LEADERBOARD_URL; // define in index.html if you have one
  if (!url) return;
  try { await fetch(url, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) }); }
  catch(e) { console.warn("Remote submit failed", e); }
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])) }
