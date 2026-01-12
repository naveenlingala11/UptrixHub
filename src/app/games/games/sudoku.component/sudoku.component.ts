import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { XpEventsService } from '../../services/xp-events.service';
import { SudokuApiService } from '../services/sudoko-api.service';
import { AppStateService } from '../../../core/services/app-state.service';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type Theme = 'dark' | 'light' | 'purple' | 'matrix';

@Component({
  standalone: true,
  selector: 'app-sudoku',
  imports: [CommonModule, FormsModule],
  templateUrl: './sudoku.component.html',
  styleUrls: ['./sudoku.component.css']
})
export class SudokuComponent implements OnInit {

  /* ================= CONFIG ================= */
  difficulty: Difficulty = 'EASY';
  theme: Theme = 'dark';

  difficultyMap = {
    EASY: 40,
    MEDIUM: 50,
    HARD: 60
  };

  highlightSame = true;

  /* ================= GAME STATE ================= */
  puzzle: number[][] = [];
  original: number[][] = [];
  errors: boolean[][] = [];
  notes: Set<number>[][] = [];

  selected: { r: number; c: number } | null = null;
  selectedValue: number | null = null;

  pencilMode = false;
  solved = false;
  message = '';

  /* ================= TIMER ================= */
  penalties = 0;

  /* ================= SOLVER ================= */
  solving = false;
  paused = false;
  delay = 120;

  /* ================= UNDO / REDO ================= */
  history: any[] = [];
  redoStack: any[] = [];

  mistakes = 0;
  MAX_MISTAKES = 3;

  dailyMode = false;

  constructor(
    private sudokuApi: SudokuApiService,
    private xpEvents: XpEventsService,
    public appState: AppStateService   // ✅ GLOBAL STATE
  ) { }

  ngOnInit() {
    this.loadPuzzle();
    this.loadSavedGame();
    this.appState.startTimer(); // ✅ AUTO START
  }

  /* ================= PUZZLE GENERATION ================= */

  loadPuzzle() {
    const grid = this.createEmptyGrid();
    this.generateSolvedGrid(grid);

    let remove = this.difficultyMap[this.difficulty];
    while (remove > 0) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (grid[r][c] !== 0) {
        grid[r][c] = 0;
        remove--;
      }
    }

    this.puzzle = grid.map(r => [...r]);
    this.original = grid.map(r => [...r]);
    this.errors = Array.from({ length: 9 }, () => Array(9).fill(false));
    this.notes = Array.from({ length: 9 },
      () => Array.from({ length: 9 }, () => new Set<number>())
    );

    this.history = [];
    this.redoStack = [];
    this.solved = false;
    this.message = '';
    this.penalties = 0;

    this.appState.resetTimer();
    this.appState.startTimer();
  }

  loadDailyChallenge() {
    this.sudokuApi.loadDaily().subscribe(grid => {
      this.puzzle = grid.map(r => [...r]);
      this.original = grid.map(r => [...r]);
      this.dailyMode = true;
    });
  }

  submitDailyScore() {
    this.sudokuApi.submitDaily(
      this.penalties,
      this.mistakes
    ).subscribe();
  }

  autoSave() {
    localStorage.setItem('sudoku-save', JSON.stringify({
      puzzle: this.puzzle,
      notes: this.notes,
      penalties: this.penalties,
      difficulty: this.difficulty
    }));
  }

  saveGameToServer() {
    const gameState = JSON.stringify({
      puzzle: this.puzzle,
      notes: this.notes.map(r => r.map(s => [...s])),
      penalties: this.penalties,
      difficulty: this.difficulty
    });

    this.sudokuApi.saveGame(gameState).subscribe();
  }

  loadSavedGame() {
    this.sudokuApi.loadGame().subscribe(json => {
      if (!json) return;

      const s = JSON.parse(json);
      this.puzzle = s.puzzle;
      this.penalties = s.penalties ?? 0;

      this.appState.startTimer(s.time ?? 0);
    });
  }

  createEmptyGrid(): number[][] {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  shuffle(nums: number[]): number[] {
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  }

  generateSolvedGrid(grid: number[][]): boolean {
    const empty = this.findEmpty(grid);
    if (!empty) return true;

    const [r, c] = empty;
    for (const n of this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (this.isSafeGrid(grid, r, c, n)) {
        grid[r][c] = n;
        if (this.generateSolvedGrid(grid)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  findEmpty(grid: number[][]): [number, number] | null {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (grid[r][c] === 0) return [r, c];
    return null;
  }

  isSafeGrid(grid: number[][], r: number, c: number, n: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (grid[r][i] === n || grid[i][c] === n) return false;
    }
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (grid[br + i][bc + j] === n) return false;
    return true;
  }

  /* ================= INPUT ================= */

  isFixed(r: number, c: number): boolean {
    return this.original[r][c] !== 0;
  }

  blockInvalid(e: KeyboardEvent) {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
    if (allowed.includes(e.key)) return;
    if (!/^[1-9]$/.test(e.key)) e.preventDefault();
  }

  selectCell(r: number, c: number) {
    this.selected = { r, c };

    const v = this.puzzle[r][c];
    this.selectedValue = v !== 0 ? v : null;
  }

  displayValue(r: number, c: number): string {
    return this.puzzle[r][c] === 0 ? '' : String(this.puzzle[r][c]);
  }

  handleCellInput(r: number, c: number, val: string) {
    if (this.solving || this.isFixed(r, c)) return;

    this.saveState(); // undo support

    const n = Number(val);
    this.puzzle[r][c] = (n >= 1 && n <= 9) ? n : 0;

    this.validateAll();
  }

  /* ================= VALIDATION ================= */

  isSafe(r: number, c: number, n: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (i !== c && this.puzzle[r][i] === n) return false;
      if (i !== r && this.puzzle[i][c] === n) return false;
    }
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if ((br + i !== r || bc + j !== c) && this.puzzle[br + i][bc + j] === n)
          return false;
    return true;
  }

  validateAll() {
    this.errors = Array.from({ length: 9 }, () => Array(9).fill(false));

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = this.puzzle[r][c];
        if (v !== 0 && !this.isSafe(r, c, v)) {
          this.errors = this.errors.map((row, ri) =>
            ri === r
              ? row.map((cell, ci) => ci === c ? true : cell)
              : row
          );
        }
      }
    }

    const hasError = this.errors.flat().includes(true);
    if (hasError) {
      this.mistakes++;
      this.penalties += 10;

      if (this.mistakes >= this.MAX_MISTAKES) {
        this.message = '❌ Game Over!';
        this.solving = true;
      }
    }
  }

  /* ================= UNDO / REDO ================= */

  saveState() {
    this.history.push({
      puzzle: this.puzzle.map(r => [...r]),
      notes: this.notes.map(r => r.map(s => new Set(s)))
    });
    this.redoStack = [];
  }

  undo() {
    if (!this.history.length) return;
    const prev = this.history.pop();
    this.redoStack.push({
      puzzle: this.puzzle.map(r => [...r]),
      notes: this.notes.map(r => r.map(s => new Set(s)))
    });
    this.puzzle = prev.puzzle;
    this.notes = prev.notes;
  }

  redo() {
    if (!this.redoStack.length) return;
    const next = this.redoStack.pop();
    this.saveState();
    this.puzzle = next.puzzle;
    this.notes = next.notes;
  }

  /* ================= SOLVER ================= */

  async solveSudoku() {
    if (this.solving) return;
    this.solving = true;
    this.message = '🤖 Solving...';

    const solved = await this.solveAnimated();
    this.solving = false;

    this.message = solved ? '🎉 Solved!' : '❌ No solution';
  }

  async solveAnimated(): Promise<boolean> {
    const empty = this.findEmpty(this.puzzle);
    if (!empty) return true;

    const [r, c] = empty;
    for (let n = 1; n <= 9; n++) {
      if (this.isSafe(r, c, n)) {
        this.puzzle = this.puzzle.map((row, ri) =>
          ri === r
            ? row.map((cell, ci) => ci === c ? n : cell)
            : row
        );
        await this.sleep(this.delay);
        if (await this.solveAnimated()) return true;
        this.puzzle[r][c] = 0;
        await this.sleep(this.delay);
      }
    }
    return false;
  }

  async sleep(ms: number) {
    while (this.paused) {
      await new Promise(r => setTimeout(r, 100));
    }
    return new Promise(r => setTimeout(r, ms));
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }

  /* ================= TIMER ================= */

  reset() {
    this.appState.resetTimer();
    this.loadPuzzle();
  }

  onKeyNavigate(e: KeyboardEvent, r: number, c: number) {
    if (!this.selected) return;

    let nr = r;
    let nc = c;

    switch (e.key) {
      case 'ArrowUp': nr = Math.max(0, r - 1); break;
      case 'ArrowDown': nr = Math.min(8, r + 1); break;
      case 'ArrowLeft': nc = Math.max(0, c - 1); break;
      case 'ArrowRight': nc = Math.min(8, c + 1); break;
      default: return;
    }

    e.preventDefault();
    this.selectCell(nr, nc);
  }

  enterNumber(n: number) {
    if (!this.selected || this.solving) return;

    const { r, c } = this.selected;
    if (this.isFixed(r, c)) return;

    this.saveState();

    if (this.pencilMode && n !== 0) {
      if (this.notes[r][c].has(n)) this.notes[r][c].delete(n);
      else this.notes = this.notes.map((row, ri) =>
        ri === r
          ? row.map((set, ci) => {
            if (ci !== c) return set;
            return new Set([...set, n]);
          })
          : row
      );

      return;
    }

    this.puzzle[r][c] = n;
    this.notes[r][c].clear();
    this.validateAll();
  }


  gameOver() {
    this.message = '❌ Game Over!';
    this.solving = true;
    this.appState.stopTimer();
  }

  onSolved() {
    this.appState.stopTimer();

    this.sudokuApi.solved(this.difficulty).subscribe(res => {
      if (res.earnedXp > 0) {
        this.xpEvents.emitXp({
          xp: res.earnedXp,
          reason: `Solved Sudoku (${this.difficulty})`
        });
      }
    });
  }

  getHint() {
    this.sudokuApi.hint(this.puzzle).subscribe(([r, c, value]) => {
      this.selectCell(r, c);
      this.enterNumber(value);
    });
  }

}
