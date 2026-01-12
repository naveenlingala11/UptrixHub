import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

type Direction = 'H' | 'V';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type Theme = 'dark' | 'neon' | 'light';

interface Block {
  id: string;
  row: number;
  col: number;
  length: 2 | 3;
  direction: Direction;
  isTarget?: boolean;
}

interface Level {
  id: number;
  blocks: Block[];
  difficulty: Difficulty;
  minMoves: number;
}

interface GameState {
  blocks: Block[];
  parent?: GameState;
}

@Component({
  standalone: true,
  selector: 'app-unblock-me',
  imports: [CommonModule],
  templateUrl: './unblock-me.component.html',
  styleUrls: ['./unblock-me.component.css']
})
export class UnblockMeComponent implements OnInit {

  /* ================= CONFIG ================= */
  size = 6;
  cellSize = 64;

  /* ================= GAME STATE ================= */
  levels: Level[] = [];
  currentLevelIndex = 0;

  blocks: Block[] = [];
  initialBlocks: Block[] = [];

  moves = 0;
  won = false;

  gateOpen = false;
  stars = [1, 2, 3];
  earnedStars = 0;

  /* ================= DRAG ================= */
  dragBlock: Block | null = null;
  startX = 0;
  startY = 0;

  /* ================= UNDO / REDO ================= */
  undoStack: Block[][] = [];
  redoStack: Block[][] = [];

  /* ================= SOLVER ================= */
  solving = false;
  hintBlockId: string | null = null;

  blockedBlockId: string | null = null;

  winning = false;

  unlockedLevelIndex = 0; // last unlocked level

  hintArrow: {
    blockId: string;
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
  } | null = null;

  theme: Theme = 'dark';

  confettiArray = Array.from({ length: 80 }).map(() => ({
    left: Math.random() * 100,
    hue: Math.random() * 360,
    fall: 2 + Math.random() * 2,
    spin: 0.5 + Math.random()
  }));

  ngOnInit() {
    this.levels = [];
    this.unlockedLevelIndex = 0;

    this.generateNextLevel(); // Level 1
    this.loadLevel(0);
    window.addEventListener('keydown', this.onKeyDown);

  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  /* ================= GRID ================= */

  buildGrid(blocks: Block[]): number[][] {
    const g = Array.from({ length: this.size }, () =>
      Array(this.size).fill(0)
    );

    blocks.forEach((b, i) => {
      for (let k = 0; k < b.length; k++) {
        const r = b.row + (b.direction === 'V' ? k : 0);
        const c = b.col + (b.direction === 'H' ? k : 0);
        g[r][c] = i + 1;
      }
    });

    return g;
  }

  /* ================= LEVEL GENERATOR ================= */

  generateLevels(count: number) {
    this.levels = [];
    let attempts = 0;

    while (this.levels.length < count && attempts < count * 10) {
      attempts++;
      const lvl = this.generateRandomLevel();
      if (lvl) this.levels.push(lvl);
    }

    this.loadLevel(0);
  }

  generateNextLevel() {
    let level: Level | null = null;

    while (!level) {
      level = this.generateRandomLevel();
    }

    this.levels.push(level);
  }

  generateRandomLevel(): Level | null {
    const blocks: Block[] = [];

    blocks.push({
      id: 'T',
      row: 2,
      col: 0,
      length: 2,
      direction: 'H',
      isTarget: true
    });

    const grid = Array.from({ length: 6 }, () => Array(6).fill(0));
    const place = (b: Block) => {
      for (let i = 0; i < b.length; i++) {
        const r = b.row + (b.direction === 'V' ? i : 0);
        const c = b.col + (b.direction === 'H' ? i : 0);
        grid[r][c] = 1;
      }
    };

    place(blocks[0]);

    let idChar = 65;
    const count = Math.floor(Math.random() * 6) + 8;

    for (let i = 0; i < count; i++) {
      const dir: Direction = Math.random() > 0.5 ? 'H' : 'V';
      const len: 2 | 3 = Math.random() > 0.7 ? 3 : 2;

      const maxR = dir === 'V' ? 6 - len : 5;
      const maxC = dir === 'H' ? 6 - len : 5;

      for (let t = 0; t < 40; t++) {
        const r = Math.floor(Math.random() * (maxR + 1));
        const c = Math.floor(Math.random() * (maxC + 1));

        let ok = true;
        for (let k = 0; k < len; k++) {
          const rr = r + (dir === 'V' ? k : 0);
          const cc = c + (dir === 'H' ? k : 0);
          if (grid[rr][cc]) ok = false;
        }
        if (!ok) continue;

        const b: Block = {
          id: String.fromCharCode(idChar++),
          row: r,
          col: c,
          length: len,
          direction: dir
        };
        blocks.push(b);
        place(b);
        break;
      }
    }

    const solution = this.solveWithBlocks(blocks);
    if (!solution) return null;

    const moves = solution.length - 1;
    const difficulty: Difficulty =
      moves < 10 ? 'EASY' : moves < 20 ? 'MEDIUM' : 'HARD';

    return {
      id: Date.now() + Math.random(),
      blocks,
      difficulty,
      minMoves: moves
    };
  }

  loadLevel(index: number) {
    if (index < 0) return;
    if (index > this.unlockedLevelIndex) return;

    const lvl = this.levels[index];
    if (!lvl) return;

    this.currentLevelIndex = index;
    this.blocks = this.cloneBlocks(lvl.blocks);
    this.initialBlocks = this.cloneBlocks(lvl.blocks);

    this.moves = 0;
    this.won = false;
    this.gateOpen = false;
    this.winning = false;
    this.undoStack = [];
    this.redoStack = [];
  }

  /* ================= MOVEMENT ================= */

  canMove(block: Block, step: number, blocks: Block[] = this.blocks): boolean {
    const g = this.buildGrid(blocks);

    if (block.direction === 'H') {
      // ⬅ ➡ only
      const edgeCol = step > 0
        ? block.col + block.length
        : block.col - 1;

      if (edgeCol < 0 || edgeCol >= this.size) return false;
      return g[block.row][edgeCol] === 0;
    }

    // VERTICAL ONLY ⬆ ⬇
    const edgeRow = step > 0
      ? block.row + block.length
      : block.row - 1;

    if (edgeRow < 0 || edgeRow >= this.size) return false;
    return g[edgeRow][block.col] === 0;
  }

  move(block: Block, step: number) {

    if (!this.canMove(block, step)) {
      this.blockedBlockId = block.id;
      setTimeout(() => this.blockedBlockId = null, 250);
      return;
    }

    this.undoStack.push(this.snapshot());
    this.redoStack = [];

    if (block.direction === 'H') {
      block.col += step;
    } else {
      block.row += step;
    }

    this.moves++;
    this.checkWin();
  }

  /* ================= DRAG / SWIPE ================= */

  onPointerDown(e: PointerEvent, block: Block) {
    if (this.won) return;
    this.dragBlock = block;
    this.startX = e.clientX;
    this.startY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  onPointerMove(e: PointerEvent) {
    if (!this.dragBlock) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    // 🔒 HORIZONTAL BLOCK
    if (
      this.dragBlock.direction === 'H' &&
      Math.abs(dx) >= this.cellSize
    ) {
      const step = dx > 0 ? 1 : -1;
      this.move(this.dragBlock, step);
      this.startX = e.clientX;
    }

    // 🔒 VERTICAL BLOCK
    if (
      this.dragBlock.direction === 'V' &&
      Math.abs(dy) >= this.cellSize
    ) {
      const step = dy > 0 ? 1 : -1;
      this.move(this.dragBlock, step);
      this.startY = e.clientY;
    }
  }

  onPointerUp(e: PointerEvent) {
    if (!this.dragBlock) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    this.dragBlock = null;
  }

  /* ================= UNDO / REDO ================= */

  undo() {
    if (!this.undoStack.length) return;
    this.redoStack.push(this.snapshot());
    this.restore(this.undoStack.pop()!);
    this.moves--;
  }

  redo() {
    if (!this.redoStack.length) return;
    this.undoStack.push(this.snapshot());
    this.restore(this.redoStack.pop()!);
    this.moves++;
  }

  reset() {
    this.restore(this.initialBlocks);
    this.moves = 0;
    this.won = false;
    this.undoStack = [];
    this.redoStack = [];
    this.gateOpen = false;
    this.winning = false;
  }

  /* ================= SOLVER / HINT ================= */

  solveGame() {
    const sol = this.solveWithBlocks(this.blocks);
    if (!sol) return;

    this.solving = true;
    let i = 0;

    const play = () => {
      if (i >= sol.length) {
        this.solving = false;
        return;
      }
      this.blocks = this.cloneBlocks(sol[i++]);
      setTimeout(play, 300);
    };
    play();
  }

  giveHint() {
    const sol = this.solveWithBlocks(this.blocks);
    if (!sol || sol.length < 2) return;

    const before = sol[0];
    const after = sol[1];

    const moved = after.find(b => {
      const old = before.find(o => o.id === b.id)!;
      return old.row !== b.row || old.col !== b.col;
    });

    if (!moved) return;

    const old = before.find(o => o.id === moved.id)!;

    let direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

    if (moved.direction === 'H') {
      direction = moved.col > old.col ? 'RIGHT' : 'LEFT';
    } else {
      direction = moved.row > old.row ? 'DOWN' : 'UP';
    }

    this.hintBlockId = moved.id;
    this.hintArrow = {
      blockId: moved.id,
      direction
    };

    // auto clear hint
    setTimeout(() => {
      this.hintBlockId = null;
      this.hintArrow = null;
    }, 1200);
  }

  /* ================= BFS SOLVER ================= */

  solveWithBlocks(blocks: Block[]): Block[][] | null {
    const start: GameState = { blocks: this.cloneBlocks(blocks) };
    const queue: GameState[] = [start];
    const visited = new Set<string>();

    visited.add(this.serialize(start.blocks));

    while (queue.length) {
      const cur = queue.shift()!;
      if (this.isSolved(cur.blocks)) return this.extract(cur);

      for (const next of this.getNextStates(cur)) {
        const key = this.serialize(next.blocks);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(next);
        }
      }
    }
    return null;
  }

  getNextStates(state: GameState): GameState[] {
    const res: GameState[] = [];

    state.blocks.forEach((b, i) => {
      for (const step of [-1, 1]) {
        const copy = this.cloneBlocks(state.blocks);
        const m = copy[i];

        if (this.canMove(m, step, copy)) {
          if (m.direction === 'H') m.col += step;
          else m.row += step;

          res.push({ blocks: copy, parent: state });
        }
      }
    });

    return res;
  }

  isSolved(blocks: Block[]): boolean {
    const t = blocks.find(b => b.isTarget)!;
    return t.col + t.length === this.size;
  }

  extract(state: GameState): Block[][] {
    const path: Block[][] = [];
    let cur: GameState | undefined = state;
    while (cur) {
      path.unshift(this.cloneBlocks(cur.blocks));
      cur = cur.parent;
    }
    return path;
  }

  /* ================= HELPERS ================= */

  snapshot(): Block[] {
    return this.cloneBlocks(this.blocks);
  }

  restore(state: Block[]) {
    this.blocks = this.cloneBlocks(state);
  }

  serialize(blocks: Block[]): string {
    return blocks.map(b => `${b.id}:${b.row},${b.col}`).join('|');
  }

  cloneBlocks(blocks: Block[]): Block[] {
    return blocks.map(b => ({ ...b }));
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (this.won && e.key === 'Enter') {
      this.nextLevel();
    }
  };

  checkWin() {
    if (this.winning || this.won) return;

    const target = this.blocks.find(b => b.isTarget);
    if (!target) return;

    if (target.col + target.length === this.size) {
      this.winning = true;
      this.gateOpen = true;

      setTimeout(() => {
        this.won = true;          // 🔥 STAYS TRUE
        this.winning = false;

        // unlock next level
        if (this.currentLevelIndex === this.unlockedLevelIndex) {
          this.unlockedLevelIndex++;
          this.generateNextLevel();
        }
        const best = this.levels[this.currentLevelIndex].minMoves;

        if (this.moves <= best) this.earnedStars = 3;
        else if (this.moves <= best + 2) this.earnedStars = 2;
        else this.earnedStars = 1;

      }, 500);
    }
  }

  nextLevel() {
    this.won = false;
    this.loadLevel(this.currentLevelIndex + 1);
  }

  setTheme(t: string) {
    if (t === 'dark' || t === 'neon' || t === 'light') {
      this.theme = t;
    }
  }

}
