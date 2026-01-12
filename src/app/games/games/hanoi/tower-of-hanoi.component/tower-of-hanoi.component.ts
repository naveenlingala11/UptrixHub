import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HanoiService } from '../../services/hanoi/hanoi.service';
import { HanoiMultiplayerService } from '../../services/hanoi/hanoi-multiplayer.service';

type Theme = 'dark' | 'light' | 'purple' | 'matrix';
type RodIndex = 0 | 1 | 2;

interface Move {
  from: RodIndex;
  to: RodIndex;
  disk: number;
}

@Component({
  standalone: true,
  selector: 'app-tower-of-hanoi',
  imports: [CommonModule, FormsModule],
  templateUrl: './tower-of-hanoi.component.html',
  styleUrls: ['./tower-of-hanoi.component.css']
})
export class TowerOfHanoiComponent implements OnInit {

  /* ================= CONFIG ================= */
  disks = 4;
  theme: Theme = 'dark';

  /* ================= GAME STATE ================= */
  rods: number[][] = [[], [], []];
  selectedRod: RodIndex | null = null;

  moves = 0;
  optimalMoves = 0;
  penalties = 0;

  gameStarted = false;
  gameWon = false;

  time = 0;
  timerRef: any;

  /* ================= DRAG STATE ================= */
  dragFrom: RodIndex | null = null;
  hoverRod: RodIndex | null = null;

  /* ================= HISTORY ================= */
  history: number[][][] = [];
  redoStack: number[][][] = [];

  /* ================= REPLAY ================= */
  replayMoves: Move[] = [];
  replayIndex = 0;

  /* ================= UI ================= */
  message = '';
  showAchievements = false;
  unlockedAchievements: string[] = [];

  /* ================= PROFILE ================= */
  playerProfile = {
    level: 12,
    totalXp: 2450,
    hanoiWins: 8,
    fastestTime: 42
  };

  draggedDisk: number | null = null;
  dragFromRod: RodIndex | null = null;
  globalLeaderboard: any[] = [];

  constructor(
    private hanoi: HanoiService,
    private mp: HanoiMultiplayerService
  ) { }

  /* ================= INIT ================= */

  ngOnInit() {
    this.initBoard();

    this.hanoi.leaderboard(this.disks)
      .subscribe(res => this.globalLeaderboard = res);

    /* Multiplayer sync */
    this.mp.connect('room-1', (data: any) => {
      if (data.type === 'MOVE') {
        const m = data.move as Move;

        const from = m.from;
        const to = m.to;
        const disk = m.disk;

        const diskEl = document.querySelector(
          `.rod:nth-child(${from + 1}) .disk:last-child`
        ) as HTMLElement;

        if (!diskEl) {
          this.applyMoveSafely(from, to, disk);
          return;
        }

        this.animateMove(diskEl, from, to, disk, () => {
          this.applyMoveSafely(from, to, disk);
        });

        this.flashSync();
      }
    });
  }

  /* ================= GAME CONTROL ================= */

  startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    this.startTimer();
  }

  reset() {
    this.stopTimer();
    this.gameStarted = false;
    this.gameWon = false;
    this.message = '';
    this.initBoard();
  }

  initBoard() {
    this.rods = [
      Array.from({ length: this.disks }, (_, i) => this.disks - i),
      [],
      []
    ];

    this.moves = 0;
    this.penalties = 0;
    this.history = [];
    this.redoStack = [];
    this.replayMoves = [];
    this.selectedRod = null;
    this.replayIndex = 0;

    this.optimalMoves = Math.pow(2, this.disks) - 1;
  }

  /* ================= TIMER ================= */

  startTimer() {
    this.stopTimer();
    this.time = 0;
    this.timerRef = setInterval(() => this.time++, 1000);
  }

  stopTimer() {
    clearInterval(this.timerRef);
  }

  /* ================= CORE MOVE LOGIC (ONLY ONE) ================= */

  tryMove(from: RodIndex, to: RodIndex) {
    if (!this.gameStarted || this.gameWon) return;
    if (from === to) return;

    const src = this.rods[from];
    const tgt = this.rods[to];

    if (src.length === 0) return;

    const disk = src[src.length - 1];
    const targetTop = tgt[tgt.length - 1];

    /* ❌ INVALID MOVE */
    if (targetTop !== undefined && targetTop < disk) {
      this.penalties += 5;
      this.message = '❌ Invalid Move (+5s)';
      this.shakeInvalid();
      return;
    }

    /* ✅ SAVE STATE */
    this.history.push(this.rods.map(r => [...r]));
    this.redoStack = [];

    /* ✅ APPLY MOVE */
    this.applyMoveSafely(from, to, disk);

    this.moves++;
    this.replayMoves.push({ from, to, disk });

    this.mp.sendMove('room-1', { from, to, disk });
    this.message = '';

    /* ✅ WIN CHECK */
    if (this.rods[2].length === this.disks) {
      this.finishGame();
    }
  }

  /* ================= CLICK SELECT ================= */

  selectRod(i: RodIndex) {
    if (!this.gameStarted) return;

    if (this.selectedRod === null) {
      if (this.rods[i].length > 0) {
        this.selectedRod = i;
      }
    } else {
      this.tryMove(this.selectedRod, i);
      this.selectedRod = null;
    }
  }

  asRod(i: number): RodIndex {
    return i as RodIndex;
  }

  /* ================= DRAG & DROP ================= */

  onDragStart(rodIndex: number, disk: number) {
    if (!this.gameStarted) return;

    const rod = rodIndex as RodIndex;
    const topDisk = this.rods[rod][this.rods[rod].length - 1];

    // ❌ ONLY TOP DISK ALLOWED
    if (disk !== topDisk) {
      return;
    }

    this.dragFromRod = rod;
    this.draggedDisk = disk;
  }

  onDragOver(event: DragEvent, rod: RodIndex) {
    event.preventDefault(); // REQUIRED FOR DROP
    this.hoverRod = rod;
  }

  onDrop(toRod: RodIndex) {
    if (
      this.dragFromRod === null ||
      this.draggedDisk === null ||
      !this.gameStarted
    ) {
      return;
    }

    const fromRod = this.dragFromRod;
    const disk = this.draggedDisk;

    const targetTop = this.rods[toRod][this.rods[toRod].length - 1];

    // ❌ INVALID MOVE
    if (targetTop !== undefined && targetTop < disk) {
      this.penalties += 5;
      this.message = '❌ Invalid Move (+5s)';
      this.shakeInvalid();
      this.clearDrag();
      return;
    }

    // ✅ SAVE HISTORY
    this.history.push(this.rods.map(r => [...r]));
    this.redoStack = [];

    // ✅ APPLY MOVE (LOGIC FIRST)
    this.rods[fromRod].pop();
    this.rods[toRod].push(disk);

    this.moves++;
    this.replayMoves.push({ from: fromRod, to: toRod, disk });

    this.mp.sendMove('room-1', { from: fromRod, to: toRod, disk });

    // ✅ WIN CHECK
    if (this.rods[2].length === this.disks) {
      this.finishGame();
    }

    this.clearDrag();
  }

  clearDrag() {
    this.dragFromRod = null;
    this.draggedDisk = null;
    this.hoverRod = null;
  }

  onTouchRod(i: RodIndex) {
    this.selectRod(i);
  }

  /* ================= UNDO / REDO ================= */

  undo() {
    if (!this.history.length || !this.gameStarted) return;

    this.redoStack.push(this.rods.map(r => [...r]));
    this.rods = this.history.pop()!;
    this.moves = Math.max(0, this.moves - 1);
  }

  redo() {
    if (!this.redoStack.length || !this.gameStarted) return;

    this.history.push(this.rods.map(r => [...r]));
    this.rods = this.redoStack.pop()!;
    this.moves++;
  }

  /* ================= REPLAY ================= */

  replayStep(index: number) {
    this.initBoard();

    for (let i = 0; i <= index; i++) {
      const m = this.replayMoves[i];
      if (!m) continue;

      this.rods[m.from].pop();
      this.rods[m.to].push(m.disk);
    }
  }

  /* ================= WIN ================= */

  finishGame() {
    this.stopTimer();
    this.gameWon = true;
    this.message = '🎉 Tower of Hanoi Solved!';

    this.submitResult();
    this.checkAchievements();
  }

  /* ================= BACKEND ================= */

  submitResult() {
    this.hanoi.submitScore({
      disks: this.disks,
      moves: this.moves,
      time: this.totalTime
    }).subscribe();

    this.hanoi.saveReplay({
      disks: this.disks,
      movesJson: JSON.stringify(this.replayMoves)
    }).subscribe();
  }

  /* ================= ACHIEVEMENTS ================= */

  checkAchievements() {
    this.unlockedAchievements = [];

    if (this.moves === this.optimalMoves)
      this.unlockedAchievements.push('Perfect Solver 🏅');

    if (this.totalTime < 60)
      this.unlockedAchievements.push('Speed Runner ⚡');

    if (this.moves <= this.optimalMoves + 5)
      this.unlockedAchievements.push('Near Optimal 🎯');

    if (this.unlockedAchievements.length) {
      this.showAchievements = true;
      setTimeout(() => this.showAchievements = false, 4000);
    }
  }

  /* ================= EFFECTS ================= */

  shakeInvalid() {
    document.querySelectorAll('.rod').forEach(r => {
      r.classList.add('invalid');
      setTimeout(() => r.classList.remove('invalid'), 300);
    });
  }

  flashSync() {
    document.querySelectorAll('.disk').forEach(d => {
      d.classList.add('sync');
      setTimeout(() => d.classList.remove('sync'), 300);
    });
  }

  /* ================= DERIVED ================= */

  get totalTime() {
    return this.time + this.penalties;
  }

  get efficiency() {
    return Math.round((this.optimalMoves / Math.max(this.moves, 1)) * 100);
  }

  private applyMoveSafely(from: RodIndex, to: RodIndex, disk: number) {
    const src = this.rods[from];
    const tgt = this.rods[to];

    // remove ONLY the expected disk
    if (src[src.length - 1] !== disk) {
      console.error('❌ Desync prevented', { from, to, disk });
      return;
    }

    // validate target
    const top = tgt[tgt.length - 1];
    if (top !== undefined && top < disk) {
      console.error('❌ Illegal stack prevented', { from, to, disk });
      return;
    }

    src.pop();
    tgt.push(disk);
  }

  /* ================= ANIMATION ================= */

  private animateMove(
    diskEl: HTMLElement,
    from: RodIndex,
    to: RodIndex,
    disk: number,
    commit: () => void
  ) {
    // 1️⃣ Lift
    diskEl.classList.add('lift');

    setTimeout(() => {
      // 2️⃣ Apply logical move (array change)
      commit();

      // 3️⃣ Fly
      diskEl.classList.add('fly');
      diskEl.classList.remove('lift');

      setTimeout(() => {
        // 4️⃣ Drop
        diskEl.classList.remove('fly');
        diskEl.classList.add('drop');

        setTimeout(() => {
          diskEl.classList.remove('drop');
        }, 150);

      }, 200);
    }, 150);
  }

}
