import { ASSETS } from "./assets.js";
import { PHYSIO, COURSE, POWERUPS } from "./config.js";

export class Runner {
  constructor(imgs) {
    this.sprite = imgs.gus; // atlas image at imgs.gus.atlas
    this.pos = { x: 0, y: 0 };   // x in pixels (parallax space)
    this.v = 0;                  // m/s along course
    this.dist = 0;               // meters
    this.hr = PHYSIO.hr_rest;
    this.hrEff = 1.0;
    this.sr = 0;                 // step rate (taps/min)
    this.taps = [];              // last N tap timestamps (ms)
    this.time = 0;               // secs
    this.stats = { gels:0, beers:0, beerTime:0 };
    this.effects = { gelUntil:0, beerUntil:0, beerEuph:0 };
  }

  tap(nowMs) {
    const now = nowMs;
    const limit = 60000 / COURSE.bpm_cap;
    if (this.taps.length && now - this.taps[this.taps.length-1] < limit) return; // ignore too-fast taps
    this.taps.push(now);
    if (this.taps.length > 6) this.taps.shift();
    if (this.taps.length >= 2) {
      const deltas = this.taps.slice(1).map((t,i)=> t - this.taps[i]);
      const avg = deltas.reduce((a,b)=>a+b,0)/deltas.length;
      this.sr = Math.round(60000/avg);
    }
  }

  give(type, now) {
    if (type === "gel") {
      this.effects.gelUntil = now + POWERUPS.gel.dur;
      this.stats.gels++;
    } else {
      this.effects.beerUntil = now + POWERUPS.beer.euphoria + POWERUPS.beer.wobble;
      this.effects.beerEuph = now + POWERUPS.beer.euphoria;
      this.stats.beers++;
    }
  }

  update(dt, now) {
    // --- HR: target from load ---
    const speed = this.v;
    const load =  PHYSIO.hr_rest + 0.35*speed*speed; // simple metabolic load
    const mult = (now < this.effects.gelUntil) ? POWERUPS.gel.hr_gain_mult
               : (now < this.effects.beerUntil) ? POWERUPS.beer.hr_gain_mult
               : 1.0;
    const tau = (load > this.hr) ? PHYSIO.tau_rise : PHYSIO.tau_fall;
    this.hr += ((load - this.hr)/tau) * dt * mult;
    this.hr = Math.min(this.hr, PHYSIO.hr_max);

    // HR efficiency
    const { hr_sweet_low:lo, hr_sweet_high:hi } = PHYSIO;
    let eff = 1.0;
    if (this.hr < lo) eff += (this.hr - lo) * PHYSIO.eff.below;
    else if (this.hr <= hi) eff += PHYSIO.eff.in_bonus;
    else eff += (this.hr - hi) * PHYSIO.eff.above;
    if (this.hr > PHYSIO.eff.softcap_start) {
      const t = (this.hr - PHYSIO.eff.softcap_start) / (PHYSIO.hr_max - PHYSIO.eff.softcap_start);
      eff *= (1 - t * PHYSIO.eff.softcap_max_damp);
    }
    this.hrEff = Math.max(0.6, Math.min(1.1, eff));

    // --- Movement impulse on taps (convert SR to per-step impulse) ---
    // Base impulse influenced by SR; we also apply gel/beer modifiers
    const srNorm = Math.max(0.6, Math.min(1.3, this.sr / 180));
    const gel = (now < this.effects.gelUntil) ? POWERUPS.gel.impulseMult : 1.0;
    const euph = (now < this.effects.beerEuph) ? 1.06 : 1.0;
    const impulse = 0.045 * srNorm * gel * euph * this.hrEff;

    // Integrate distance: assume tap cadence contributes smoothly between taps
    // (simple approach: convert SR to steps/sec and multiply by impulse)
    const stepsPerSec = this.sr / 60;
    const acc = impulse * stepsPerSec;         // m/s^2 (simplified)
    this.v += acc * dt;

    // tiny drag
    this.v *= (1 - 0.15*dt);
    this.dist += this.v * dt;

    // Beer wobble penalty during wobble window (post euphoria)
    if (now >= this.effects.beerEuph && now < this.effects.beerUntil) {
      this.stats.beerTime += dt;
      this.v *= (1 - 0.20*dt); // gentle slow
    }

    this.time += dt;
  }

  draw(ctx, camX) {
    const atlas = this.sprite.gus.atlas; // loaded image sits at sprite.gus.atlas
    const W = this.sprite.gus.w, H = this.sprite.gus.h, N = this.sprite.gus.frames;
    const idx = Math.floor((this.time * this.sprite.gus.fps) % N);
    const sx = idx * W;
    const screenX = Math.floor(this.dist * COURSE.px_per_m - camX + 100);
    const screenY = ctx.canvas.height - this.sprite.gus.h - 34; // above ground
    ctx.drawImage(atlas, sx, 0, W, H, screenX, screenY, W, H);
  }
}
