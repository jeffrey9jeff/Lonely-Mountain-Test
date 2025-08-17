import { COURSE, PICKUPS } from "./config.js";

export class Pickups {
  constructor() {
    this.items = PICKUPS.map(p => ({...p, taken:false}));
  }
  reset() { this.items.forEach(i=>i.taken=false); }

  checkCollect(runner, now) {
    // collect if within ±1.5 m horizontally
    for (const it of this.items) {
      if (it.taken) continue;
      if (Math.abs(it.s - runner.dist) < 1.5) {
        it.taken = true;
        runner.give(it.t, now);
      }
    }
  }

  draw(ctx, camX) {
    ctx.font = "24px system-ui, Apple Color Emoji, Segoe UI Emoji";
    ctx.textBaseline = "bottom";
    for (const it of this.items) {
      if (it.taken) continue;
      const emoji = it.t === "gel" ? "🧃" : "🍺";
      const x = Math.floor(it.s * COURSE.px_per_m - camX + 100);
      const y = ctx.canvas.height - 40;
      ctx.fillText(emoji, x, y);
    }
  }
}
