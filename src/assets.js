export const ASSETS = {
  bg: {
    sky: "./assets/parallax/sky.png",
    mountains: "./assets/parallax/mountains.png",
    far: "./assets/parallax/treeline_far.png",
    near: "./assets/parallax/treeline_near.png",
    ground: "./assets/ground/ground_strip.png",
  },
  gus: {
    atlas: "./assets/sprites/gus/run_atlas.png",
    frames: 8, w:128, h:128, fps: 11
  }
};

export async function loadImages(dict) {
  const out = {};
  await Promise.all(Object.entries(dict).map(async ([k, v]) => {
    if (typeof v === "string") {
      out[k] = await loadImage(v);
    } else {
      out[k] = await loadImages(v);
    }
  }));
  return out;
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
