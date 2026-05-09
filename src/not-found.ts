// 404 page: tiny canvas with a single drifting particle. No bloom, no scene state.
// Pulled out of main bundle so the not-found route stays lightweight.

import './styles-case.css';

const canvas = document.getElementById('bg-404') as HTMLCanvasElement | null;
if (canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unsupported');
  const fit = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  fit();
  addEventListener('resize', fit);

  let t = 0;
  const draw = () => {
    t += 0.01;
    ctx.fillStyle = '#050b2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const x = canvas.width / 2 + Math.cos(t * 0.6) * 80;
    const y = canvas.height / 2 + Math.sin(t * 0.4) * 40;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, 60);
    grd.addColorStop(0, 'rgba(111,220,255,0.9)');
    grd.addColorStop(1, 'rgba(46,200,255,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 60, y - 60, 120, 120);
    requestAnimationFrame(draw);
  };
  draw();
}
