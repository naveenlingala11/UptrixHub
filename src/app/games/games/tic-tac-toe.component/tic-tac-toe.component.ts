import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { XpEventsService } from '../../services/xp-events.service';
import { TicTacToeWsService } from '../services/tic-tac-toe-ws.service';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-tic-tac-toe',
  imports: [CommonModule, FormsModule],
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.css']
})
export class TicTacToeComponent implements OnInit, OnDestroy {

  /** ===== CORE STATE ===== */
  board: string[] = Array(9).fill('');
  currentPlayer: 'X' | 'O' = 'X';
  winner: string | null = null;
  moves = 0;
  winningLine: number[] | null = null;

  human = 'X';
  ai = 'O';

  /** ===== MODES ===== */
  mode: 'BOT' | 'PVP' | 'ONLINE' = 'BOT';
  difficulty: 'EASY' | 'HARD' = 'HARD';

  /** ===== UX ===== */
  hintIndex: number | null = null;
  boardLocked = false;

  /** ===== MULTIPLAYER ===== */
  roomId = 'room-101';
  onlineGame: any;
  mySymbol: 'X' | 'O' | null = null;
  matchStatus: 'IDLE' | 'WAITING' | 'MATCHED' = 'IDLE';

  /** ===== THEMES ===== */
  panelThemeClass = '';
  selectedTheme = 'default';

  themes = [
    { id: 'default', label: '🌙 Dark' },
    { id: 'neon', label: '💜 Neon' },
    { id: 'ocean', label: '🌊 Ocean' },
    { id: 'sunset', label: '🌅 Sunset' },
    { id: 'forest', label: '🌲 Forest' }
  ];

  /** ===== AUTH ===== */
  token = localStorage.getItem('token')!;

  /** ===== SOUND ===== */
  soundEnabled = true;
  moveSound = new Audio('assets/sounds/move.mp3');
  winSound = new Audio('assets/sounds/win.mp3');
  drawSound = new Audio('assets/sounds/draw.mp3');

  /** ===== SUBSCRIPTIONS ===== */
  private wsSub?: Subscription;

  constructor(
    private http: HttpClient,
    private xpEvents: XpEventsService,
    private ws: TicTacToeWsService
  ) { }

  /** ================= INIT ================= */
  ngOnInit() {
    const savedTheme = localStorage.getItem('ttt-theme') || 'default';
    this.applyTheme(savedTheme);

    const sound = localStorage.getItem('ttt-sound');
    this.soundEnabled = sound !== 'off';
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
  }

  /** ================= ONLINE GAME ================= */

  startOnline() {
    this.reset();
    this.matchStatus = 'IDLE';

    this.ws.connect(this.token);
    this.ws.join(this.roomId);

    this.wsSub = this.ws.game$.subscribe(g => {
      this.onlineGame = g;
      if (g.board) {
        this.board = [...g.board];
        this.currentPlayer = g.turn;
      }

      if (g.playerX === this.getUserId()) this.mySymbol = 'X';
      else if (g.playerO === this.getUserId()) this.mySymbol = 'O';

      if (g.finished) {
        this.winner = g.turn === 'X' ? 'O' : 'X';
        this.boardLocked = true;
      }
    });
  }

  playOnline(i: number) {
    if (!this.onlineGame) return;
    if (this.boardLocked) return;
    if (this.board[i]) return;
    if (this.currentPlayer !== this.mySymbol) return;

    this.ws.move(this.roomId, i);
  }

  startRandomMatch() {
    this.reset();
    this.matchStatus = 'WAITING';

    this.ws.connect(this.token);

    this.wsSub = this.ws.game$.subscribe(msg => {

      if (msg.type === 'WAITING') {
        this.matchStatus = 'WAITING';
      }

      if (msg.type === 'MATCH') {
        this.roomId = msg.roomId;
        this.matchStatus = 'MATCHED';
        this.ws.join(this.roomId);
      }

      if (msg.board) {
        this.onlineGame = msg;
        this.board = [...msg.board];
        this.currentPlayer = msg.turn;
      }
    });

    this.ws.match();
  }

  /** ================= HINT ================= */

  showHint() {
    if (this.mode === 'ONLINE') return;

    let bestScore = -Infinity;
    this.hintIndex = null;

    for (let i = 0; i < 9; i++) {
      if (this.board[i] === '') {
        this.board[i] = this.human;
        const score = this.minimaxAB(
          this.board, 0, -Infinity, Infinity, false
        );
        this.board[i] = '';
        if (score > bestScore) {
          bestScore = score;
          this.hintIndex = i;
        }
      }
    }
  }

  /** ================= GAME PLAY ================= */
  play(i: number) {
    if (this.boardLocked || this.board[i] || this.winner) return;

    this.board[i] = this.currentPlayer;
    this.moves++;
    this.playSound('MOVE');

    if (this.checkWin()) {
      this.winner = this.currentPlayer;
      this.boardLocked = true;
      this.playSound('WIN');
      this.finishGame('WIN');
      return;
    }

    if (this.moves === 9) {
      this.winner = 'DRAW';
      this.boardLocked = true;
      this.playSound('DRAW');
      this.finishGame('DRAW');
      return;
    }

    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    if (this.mode === 'BOT' && this.currentPlayer === this.ai) {
      setTimeout(() => this.botMove(), 300);
    }
  }

  /** ================= BOT ================= */
  botMove() {
    this.difficulty === 'EASY'
      ? this.botMoveEasy()
      : this.botMoveHard();
  }

  botMoveEasy() {
    const empty = this.board
      .map((v, i) => v === '' ? i : -1)
      .filter(i => i !== -1);
    this.play(empty[Math.floor(Math.random() * empty.length)]);
  }

  botMoveHard() {
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
      if (this.board[i] === '') {
        this.board[i] = this.ai;
        const score = this.minimaxAB(this.board, 0, -Infinity, Infinity, false);
        this.board[i] = '';
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    this.play(move);
  }

  /** ================= AI ================= */
  minimaxAB(board: string[], depth: number, alpha: number, beta: number, isMax: boolean): number {
    const result = this.checkResult(board);
    if (result !== null) return this.score(result, depth);

    if (isMax) {
      let max = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = this.ai;
          max = Math.max(max, this.minimaxAB(board, depth + 1, alpha, beta, false));
          board[i] = '';
          alpha = Math.max(alpha, max);
          if (beta <= alpha) break;
        }
      }
      return max;
    } else {
      let min = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = this.human;
          min = Math.min(min, this.minimaxAB(board, depth + 1, alpha, beta, true));
          board[i] = '';
          beta = Math.min(beta, min);
          if (beta <= alpha) break;
        }
      }
      return min;
    }
  }

  /** ================= RESULT ================= */
  checkResult(board: string[]): 'X' | 'O' | 'DRAW' | null {
    const wins = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const line of wins) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        this.winningLine = line;
        return board[a] as 'X' | 'O';
      }
    }
    this.winningLine = null;
    return board.includes('') ? null : 'DRAW';
  }

  checkWin() {
    return this.checkResult(this.board) === this.currentPlayer;
  }

  score(result: 'X' | 'O' | 'DRAW', depth: number) {
    if (result === this.ai) return 10 - depth;
    if (result === this.human) return depth - 10;
    return 0;
  }

  /** ================= XP ================= */
  finishGame(result: 'WIN' | 'DRAW') {
    this.http.post<any>(
      `${environment.apiUrl}/games/tic-tac-toe/result`,
      { result },
      { headers: { Authorization: `Bearer ${this.token}` } }
    ).subscribe(res => {
      if (res?.earnedXp) {
        this.xpEvents.emitXp({
          xp: res.earnedXp,
          reason: 'Won Tic Tac Toe'
        });
      }
    });
  }

  /** ================= UX ================= */
  reset() {
    this.board = Array(9).fill('');
    this.currentPlayer = 'X';
    this.winner = null;
    this.moves = 0;
    this.hintIndex = null;
    this.winningLine = null;
    this.boardLocked = false;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('ttt-sound', this.soundEnabled ? 'on' : 'off');
  }

  playSound(type: 'MOVE' | 'WIN' | 'DRAW') {
    if (!this.soundEnabled) return;
    const s = type === 'MOVE' ? this.moveSound : type === 'WIN' ? this.winSound : this.drawSound;
    s.currentTime = 0;
    s.play();
  }

  applyTheme(theme: string) {
    this.selectedTheme = theme;
    this.panelThemeClass = theme === 'default' ? '' : `theme-${theme}`;
    localStorage.setItem('ttt-theme', theme);
  }

  getUserId(): number {
    const payload = JSON.parse(atob(this.token.split('.')[1]));
    return payload.userId;
  }
}
