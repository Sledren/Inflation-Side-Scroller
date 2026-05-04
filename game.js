const TILE = 32;
const COLS = 13;
const ROWS = 11;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const cratesEl = document.getElementById('crates');

const map = Array.from({ length: ROWS }, (_, y) =>
  Array.from({ length: COLS }, (_, x) => {
    if (y === 0 || x === 0 || y === ROWS - 1 || x === COLS - 1) return 1;
    if (x % 2 === 0 && y % 2 === 0) return 1;
    return Math.random() < 0.35 ? 2 : 0;
  })
);

map[1][1] = map[1][2] = map[2][1] = 0;

const player = { x: 1, y: 1, alive: true };
const bombs = [];
const flames = [];

function isBlocked(x, y) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
  if (map[y][x] === 1 || map[y][x] === 2) return true;
  return bombs.some(b => b.x === x && b.y === y);
}

addEventListener('keydown', (e) => {
  if (!player.alive) return;
  let nx = player.x, ny = player.y;
  if (e.key === 'ArrowUp' || e.key === 'w') ny--;
  if (e.key === 'ArrowDown' || e.key === 's') ny++;
  if (e.key === 'ArrowLeft' || e.key === 'a') nx--;
  if (e.key === 'ArrowRight' || e.key === 'd') nx++;
  if ((e.key === ' ' || e.code === 'Space') && !bombs.some(b => b.x === player.x && b.y === player.y)) {
    bombs.push({ x: player.x, y: player.y, t: 120 });
  }
  if ((nx !== player.x || ny !== player.y) && !isBlocked(nx, ny)) {
    player.x = nx; player.y = ny;
  }
});

function explode(bomb) {
  const dirs = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
  for (const [dx,dy] of dirs) {
    const x = bomb.x + dx, y = bomb.y + dy;
    if (map[y][x] === 1) continue;
    flames.push({ x, y, t: 30 });
    if (map[y][x] === 2) map[y][x] = 0;
    bombs.forEach(b => { if (b !== bomb && b.x === x && b.y === y) b.t = 0; });
  }
}

function update() {
  for (let i = bombs.length - 1; i >= 0; i--) {
    bombs[i].t--;
    if (bombs[i].t <= 0) {
      const b = bombs.splice(i,1)[0];
      explode(b);
    }
  }
  for (let i = flames.length - 1; i >= 0; i--) {
    flames[i].t--;
    if (flames[i].x === player.x && flames[i].y === player.y) {
      player.alive = false;
      statusEl.textContent = 'Game Over! Refresh to retry.';
    }
    if (flames[i].t <= 0) flames.splice(i,1);
  }

  const crates = map.flat().filter(t => t === 2).length;
  cratesEl.textContent = `Crates: ${crates}`;
  if (crates === 0 && player.alive) statusEl.textContent = 'You win!';
}

function drawTile(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      drawTile(x, y, '#2c2c2c');
      if (map[y][x] === 1) drawTile(x, y, '#606060');
      if (map[y][x] === 2) drawTile(x, y, '#8b5a2b');
    }
  }
  bombs.forEach(b => drawTile(b.x, b.y, '#111'));
  flames.forEach(f => drawTile(f.x, f.y, '#ff9800'));
  drawTile(player.x, player.y, player.alive ? '#00d084' : '#a00');
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
