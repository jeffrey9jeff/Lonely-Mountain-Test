export const RULESET = "RR_v1_arcade_standard";
export const COURSE = {
  id: "rainforest_ridge_v1",
  length_m: 1200,                 // course length
  px_per_m: 3,                    // world scale (parallax uses pixels)
  bpm_cap: 240,                   // anti-mash
  timestep: 1/120,                // physics step
};

export const PHYSIO = {
  hr_max: 160,
  hr_sweet_low: 100,
  hr_sweet_high: 110,
  hr_rest: 42,
  tau_rise: 9.0,
  tau_fall: 13.0,
  eff: {
    below: -0.002,   // -0.2%/bpm below sweet
    above: -0.005,   // -0.5%/bpm above sweet
    in_bonus: 0.02,
    softcap_start: 145,
    softcap_max_damp: 0.20
  }
};

export const POWERUPS = {
  gel:   { dur: 6.0, impulseMult: 1.10, hr_gain_mult: 0.75, bandPlus: 8 },
  beer:  { euphoria: 0.7, wobble: 6.0, hr_gain_mult: 1.15, bandMinus: 8, cornerMult: 0.92 }
};

// fixed, seeded placements (meters from start). Using emoji. 
export const PICKUPS = [
  { t:"gel",  s: 220 }, { t:"beer", s: 240 },
  { t:"gel",  s: 520 }, { t:"beer", s: 560 },
  { t:"beer", s: 880 }, { t:"gel",  s: 900 }
];
