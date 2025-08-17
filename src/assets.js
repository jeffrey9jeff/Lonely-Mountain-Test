// src/assets.js
export const ASSETS = {
  bg: {
    sky: "./parallax/sky.png",
    mountains: "./parallax/mountains.png",
    far: "./parallax/treeline_far.png",
    near: "./parallax/treeline_near.png",
    ground: "./ground/ground_strip.png",
  },
  gus: {
    // ⬇️ your atlas is at /sprites/run_atlas.png (not /sprites/gus/run_atlas.png)
    atlas: "./sprites/run_atlas.png",
    frames: 8, w:128, h:128, fps: 11
  }
};

export async function loadImages(dict) {
  const out = {};
  await Promise.all(Object.entries(dict).map(async ([k, v]) => {
    if (typeof v === "string") out[k] = await loadImage(v);
    else out[k] = await loadImages(v);
  }));
  return out;
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload  = () => res(img);
    img.onerror = (e) => { console.error("Failed to load", src, e); rej(e); };
    img.src = src + (src.includes("?") ? "&" : "?") + "v=" + Date.now(); // cache-bust while testing
  });
}
