export class Parallax {
  constructor(imgs, canvas) {
    this.imgs = imgs;
    this.canvas = canvas;
    this.layers = [
      { img: imgs.bg.sky,        y: 0,   factor: 0.05 },
      { img: imgs.bg.mountains,  y: 40,  factor: 0.15 },
      { img: imgs.bg.far,        y: 70,  factor: 0.30 },
      { img: imgs.bg.near,       y: 90,  factor: 0.55 },
    ];
    this.ground = { img: imgs.bg.ground, y: canvas.height - imgs.bg.ground.height };
  }
  draw(ctx, camX) {
    for (const L of this.layers) {
      this.tile(ctx, L.img, 0, L.y, -camX * L.factor);
    }
    this.tile(ctx, this.ground.img, 0, this.ground.y, -camX);
  }
  tile(ctx, img, x, y, offset) {
    const W = this.canvas.width;
    let ox = ((offset % img.width) + img.width) % img.width;
    for (let i=-1; i<Math.ceil(W / img.width)+1; i++) {
      ctx.drawImage(img, Math.floor(i*img.width + -ox + x), Math.floor(y));
    }
  }
}
