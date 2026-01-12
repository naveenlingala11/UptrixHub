function seededRng(seed: number): () => number {
    return function () {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

export type Direction = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

export class Game2048Engine {

  size = 4;
  grid: number[][] = [];
  score = 0;
  gameOver = false;
  won = false;

  /** 🔥 CURRENT RNG (normal or seeded) */
  private rng: () => number = Math.random;

  constructor(size = 4) {
    this.size = size;
    this.reset();
  }

  /* ================= INIT ================= */

  reset() {
    this.resetWithRng(Math.random);
  }

  /** 🔥 DAILY CHALLENGE */
  resetWithSeed(seed: number) {
    this.resetWithRng(seededRng(seed));
  }

  private resetWithRng(rng: () => number) {
    this.rng = rng;

    this.grid = Array.from({ length: this.size },
      () => Array(this.size).fill(0)
    );
    this.score = 0;
    this.gameOver = false;
    this.won = false;

    this.spawn();
    this.spawn();
  }

  /* ================= MOVE ================= */

  move(dir: Direction): boolean {
    if (this.gameOver) return false;

    const oldGrid = this.cloneGrid();
    let moved = false;

    switch (dir) {
      case 'LEFT':
        moved = this.moveLeft();
        break;
      case 'RIGHT':
        moved = this.reverseRows(() => this.moveLeft());
        break;
      case 'UP':
        moved = this.transpose(() => this.moveLeft());
        break;
      case 'DOWN':
        moved = this.transpose(() =>
          this.reverseRows(() => this.moveLeft())
        );
        break;
    }

    if (moved) {
      this.spawn();
      this.checkState();
    }

    return !this.sameGrid(oldGrid, this.grid);
  }

  /* ================= CORE LOGIC ================= */

  private moveLeft(): boolean {
    let moved = false;

    for (let r = 0; r < this.size; r++) {
      const row = this.grid[r];
      const { newRow, gained, changed } = this.mergeRow(row);
      this.grid[r] = newRow;
      this.score += gained;
      if (changed) moved = true;
    }

    return moved;
  }

  private mergeRow(row: number[]) {
    const filtered = row.filter(v => v !== 0);
    const newRow: number[] = [];
    let gained = 0;

    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i] === filtered[i + 1]) {
        const merged = filtered[i] * 2;
        newRow.push(merged);
        gained += merged;
        if (merged === 2048) this.won = true;
        i++;
      } else {
        newRow.push(filtered[i]);
      }
    }

    while (newRow.length < this.size) newRow.push(0);

    const changed = !row.every((v, i) => v === newRow[i]);
    return { newRow, gained, changed };
  }

  /* ================= SPAWN ================= */

  private spawn() {
    const empty: [number, number][] = [];

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) empty.push([r, c]);
      }
    }

    if (!empty.length) return;

    const [r, c] = empty[Math.floor(this.rng() * empty.length)];
    this.grid[r][c] = this.rng() < 0.9 ? 2 : 4;
  }

  /* ================= STATE ================= */

  private checkState() {
    if (this.hasMoves()) return;
    this.gameOver = true;
  }

  private hasMoves(): boolean {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) return true;
        if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) return true;
        if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) return true;
      }
    }
    return false;
  }

  /* ================= MATRIX OPS ================= */

  private transpose(fn: () => boolean): boolean {
    this.grid = this.grid[0].map((_, i) =>
      this.grid.map(row => row[i])
    );
    const moved = fn();
    this.grid = this.grid[0].map((_, i) =>
      this.grid.map(row => row[i])
    );
    return moved;
  }

  private reverseRows(fn: () => boolean): boolean {
    this.grid = this.grid.map(row => [...row].reverse());
    const moved = fn();
    this.grid = this.grid.map(row => [...row].reverse());
    return moved;
  }

  private cloneGrid() {
    return this.grid.map(r => [...r]);
  }

  private sameGrid(a: number[][], b: number[][]): boolean {
    return a.every((row, r) =>
      row.every((v, c) => v === b[r][c])
    );
  }
}
