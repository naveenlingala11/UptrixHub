import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type Color = 'WHITE' | 'BLACK';
type PieceType = 'P' | 'R' | 'N' | 'B' | 'Q' | 'K';

interface Piece {
  type: PieceType;
  color: Color;
  moved?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-chess',
  imports: [CommonModule],
  templateUrl: './chess.component.html',
  styleUrls: ['./chess.component.css']
})
export class ChessComponent {

  board: (Piece | null)[][] = [];
  selected: { r: number; c: number } | null = null;
  possibleMoves: { r: number; c: number }[] = [];
  showMoves = false;

  currentTurn: Color = 'WHITE';
  gameOver = false;
  status = '';

  isCheck = false;
  isCheckmate = false;

  enPassant: { r: number; c: number } | null = null;
  promotingPawn: { r: number; c: number; color: Color } | null = null;

  capturedWhite: Piece[] = [];
  capturedBlack: Piece[] = [];

  moveHistory: string[] = [];
  undoStack: any[] = [];
  redoStack: any[] = [];

  winner: Color | null = null;
  loser: Color | null = null;

  showCaptured = true;

  difficulty = 2;

  difficultyLevels = [
    { value: 1, label: 'Beginner ♟' },
    { value: 2, label: 'Easy 🙂' },
    { value: 3, label: 'Advanced 😈' },
    { value: 4, label: 'Master 🔥' }
  ];

  setDifficulty(d: number) {
    this.difficulty = d;
  }
  get difficultyLabel() {
    return this.difficultyLevels.find(d => d.value === this.difficulty)?.label;
  }

  pieceValue(type: PieceType): number {
    return { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 }[type];
  }

  flyingPiece: { icon: string; x: number; y: number } | null = null;

  mode: 'PVP' | 'PVC' = 'PVC';
  aiColor: Color = 'BLACK';
  lastMove: { fr: number; fc: number; tr: number; tc: number } | null = null;

  openingBook: Record<string, string[]> = {
    "": ["e4", "d4"],
    "e4": ["e5", "c5"],
    "d4": ["d5", "Nf6"],
    "e4 e5": ["Nf3"],
    "e4 c5": ["Nf3"],
    "d4 d5": ["c4"]
  };

  aiThinking = false;

  theme = 'classic';

  themes = [
    { key: 'classic', label: 'Classic ♟️' },
    { key: 'darkwood', label: 'Dark Wood 🌰' },
    { key: 'blueice', label: 'Blue Ice ❄️' },
    { key: 'emerald', label: 'Emerald 💚' },
    { key: 'lava', label: 'Lava 🔥' },
    { key: 'royal', label: 'Royal 👑' },
    { key: 'neon', label: 'Neon ⚡' },
    { key: 'sand', label: 'Sand 🏜️' },
    { key: 'midnight', label: 'Midnight 🌌' },
    { key: 'forest', label: 'Forest 🌲' }
  ];

  setTheme(t: string) {
    this.theme = t;
  }

  constructor() {
    this.resetBoard();
  }

  /* ================= INIT ================= */

  resetBoard() {
    this.board = [
      this.backRank('BLACK'),
      this.pawnRank('BLACK'),
      ...Array.from({ length: 4 }, () => Array(8).fill(null)),
      this.pawnRank('WHITE'),
      this.backRank('WHITE')
    ];
    this.currentTurn = 'WHITE';
    this.gameOver = false;
    this.status = '';
    this.enPassant = null;
  }

  pawnRank(color: Color) {
    return Array.from({ length: 8 }, () => ({ type: 'P', color, moved: false }));
  }

  backRank(color: Color) {
    const o: PieceType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    return o.map(t => ({ type: t, color, moved: false }));
  }

  get whiteMaterialLoss() {
    return this.capturedWhite.reduce((s, p) => s + this.pieceValue(p.type), 0);
  }

  get blackMaterialLoss() {
    return this.capturedBlack.reduce((s, p) => s + this.pieceValue(p.type), 0);
  }

  addCapturedPiece(piece: Piece) {
    this.animateCapture(piece);

    if (piece.color === 'WHITE') {
      this.capturedWhite.push(piece);
    } else {
      this.capturedBlack.push(piece);
    }
  }

  /* ================= UI ================= */

  selectCell(r: number, c: number) {

    // ❌ BLOCK USER DURING AI TURN
    if (this.mode === 'PVC' && this.currentTurn === this.aiColor) {
      return;
    }

    if (this.gameOver || this.promotingPawn) return;

    if (this.selected) {
      if (this.isPossibleMove(r, c)) {
        this.makeMove(this.selected.r, this.selected.c, r, c);
      }
      this.clearSelection();
      return;
    }

    const piece = this.board[r][c];
    if (!piece || piece.color !== this.currentTurn) return;

    this.selected = { r, c };
    this.possibleMoves = this.getLegalMoves(r, c);
  }

  clearSelection() {
    this.selected = null;
    this.possibleMoves = [];
  }

  isPossibleMove(r: number, c: number) {
    return this.possibleMoves.some(m => m.r === r && m.c === c);
  }

  /* ================= MOVE ================= */

  makeMove(fr: number, fc: number, tr: number, tc: number) {
    const piece = this.board[fr][fc]!;
    this.enPassant = null;

    /* ================= CAPTURE (NORMAL) ================= */
    const target = this.board[tr][tc];
    if (target && target.color !== piece.color) {
      this.addCapturedPiece(target);
    }

    /* ================= EN PASSANT ================= */
    if (piece.type === 'P' && tc !== fc && !this.board[tr][tc]) {
      const killed = this.board[fr][tc];
      if (killed) {
        this.addCapturedPiece(killed);
      }
      this.board[fr][tc] = null;
    }

    /* ================= DOUBLE PAWN ================= */
    if (piece.type === 'P' && Math.abs(tr - fr) === 2) {
      this.enPassant = { r: (fr + tr) / 2, c: fc };
    }

    /* ================= MOVE PIECE ================= */
    this.board[tr][tc] = piece;
    this.board[fr][fc] = null;
    piece.moved = true;

    /* ================= CASTLING ================= */
    if (piece.type === 'K' && Math.abs(tc - fc) === 2) {
      if (tc === 6) this.moveRook(fr, 7, fr, 5);
      if (tc === 2) this.moveRook(fr, 0, fr, 3);
    }

    /* ================= PROMOTION ================= */
    if (piece.type === 'P' && (tr === 0 || tr === 7)) {
      this.promotingPawn = { r: tr, c: tc, color: piece.color };
      return;
    }

    /* ================= UNDO STACK ================= */
    const snapshot = {
      board: this.board.map(r => r.map(c => c ? { ...c } : null)),
      turn: this.currentTurn,
      enPassant: this.enPassant,
      capturedWhite: [...this.capturedWhite],
      capturedBlack: [...this.capturedBlack]
    };
    this.undoStack.push(snapshot);
    this.redoStack = [];

    this.recordMove(piece, fr, fc, tr, tc, !!target);
    this.lastMove = { fr, fc, tr, tc };

    this.endTurn();
  }

  moveRook(fr: number, fc: number, tr: number, tc: number) {
    this.board[tr][tc] = this.board[fr][fc];
    this.board[fr][fc] = null;
    this.board[tr][tc]!.moved = true;
  }

  promote(type: PieceType) {
    const p = this.promotingPawn!;
    this.board[p.r][p.c] = { type, color: p.color, moved: true };
    this.promotingPawn = null;
    this.endTurn();
  }

  endTurn() {
    this.currentTurn = this.opponent(this.currentTurn);
    this.checkGameState();
    this.startClock();

    if (
      !this.gameOver &&
      this.mode === 'PVC' &&
      this.currentTurn === this.aiColor
    ) {
      setTimeout(() => this.aiMove(), 0);
    }

  }

  animateCapture(p: Piece) {
    this.flyingPiece = {
      icon: this.pieceIcon(p),
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };

    setTimeout(() => {
      this.flyingPiece = null;
    }, 600);
  }

  /* ================= GAME STATE ================= */

  checkGameState() {
    const inCheck = this.isKingInCheck(this.currentTurn);
    const hasMoves = this.hasAnyLegalMove(this.currentTurn);

    this.isCheck = inCheck && hasMoves;
    this.isCheckmate = inCheck && !hasMoves;

    if (!hasMoves) {
      this.gameOver = true;

      if (inCheck) {
        this.status = 'CHECKMATE';
        this.loser = this.currentTurn;
        this.winner = this.opponent(this.currentTurn);
      } else {
        this.status = 'STALEMATE';
        this.winner = null;
        this.loser = null;
      }
    }
  }

  hasAnyLegalMove(color: Color) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (this.board[r][c]?.color === color)
          if (this.getLegalMoves(r, c).length) return true;
    return false;
  }

  /* ================= LEGAL MOVES ================= */

  getLegalMoves(r: number, c: number) {
    const p = this.board[r][c];
    if (!p) return [];

    let moves: any[] = [];
    switch (p.type) {
      case 'P': moves = this.pawnMoves(r, c, p); break;
      case 'R': moves = this.slide(r, c, p, [[1, 0], [-1, 0], [0, 1], [0, -1]]); break;
      case 'B': moves = this.slide(r, c, p, [[1, 1], [1, -1], [-1, 1], [-1, -1]]); break;
      case 'Q': moves = this.slide(r, c, p, [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]); break;
      case 'N': moves = this.knight(r, c, p); break;
      case 'K': moves = this.kingMoves(r, c, p); break;
    }
    return moves.filter(m => !this.moveCausesCheck(r, c, m.r, m.c));
  }

  pawnMoves(r: number, c: number, p: Piece) {
    const dir = p.color === 'WHITE' ? -1 : 1;
    const moves: any[] = [];
    if (this.inBounds(r + dir, c) && !this.board[r + dir][c]) moves.push({ r: r + dir, c });
    if (!p.moved && !this.board[r + dir][c] && !this.board[r + 2 * dir][c])
      moves.push({ r: r + 2 * dir, c });
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc;
      if (this.board[nr]?.[nc]?.color === this.opponent(p.color)) moves.push({ r: nr, c: nc });
      if (this.enPassant && this.enPassant.r === nr && this.enPassant.c === nc)
        moves.push({ r: nr, c: nc });
    }
    return moves.filter(m => this.inBounds(m.r, m.c));
  }

  kingMoves(r: number, c: number, p: Piece) {
    const moves: any[] = [];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        if (dr || dc)
          if (this.inBounds(r + dr, c + dc) && this.board[r + dr][c + dc]?.color !== p.color)
            moves.push({ r: r + dr, c: c + dc });

    if (!p.moved && !this.isKingInCheck(p.color)) {
      if (this.canCastle(r, 7)) moves.push({ r, c: 6 });
      if (this.canCastle(r, 0)) moves.push({ r, c: 2 });
    }
    return moves;
  }

  canCastle(r: number, rookCol: number) {
    const rook = this.board[r][rookCol];
    if (!rook || rook.moved) return false;
    const dir = rookCol === 7 ? 1 : -1;
    for (let c = 4 + dir; c !== rookCol; c += dir)
      if (this.board[r][c] || this.squareAttacked(r, c, this.opponent(this.currentTurn))) return false;
    return true;
  }

  slide(r: number, c: number, p: Piece, dirs: number[][]) {
    const moves: any[] = [];
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (this.inBounds(nr, nc)) {
        if (!this.board[nr][nc]) moves.push({ r: nr, c: nc });
        else {
          if (this.board[nr][nc]!.color !== p.color) moves.push({ r: nr, c: nc });
          break;
        }
        nr += dr; nc += dc;
      }
    }
    return moves;
  }

  knight(r: number, c: number, p: Piece) {
    const j = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
    return j.map(([dr, dc]) => ({ r: r + dr, c: c + dc }))
      .filter(m => this.inBounds(m.r, m.c) && this.board[m.r][m.c]?.color !== p.color);
  }

  /* ================= CHECK ================= */

  moveCausesCheck(fr: number, fc: number, tr: number, tc: number) {
    const snap = this.board.map(r => r.map(c => c ? { ...c } : null));
    this.board[tr][tc] = this.board[fr][fc];
    this.board[fr][fc] = null;
    const bad = this.isKingInCheck(this.currentTurn);
    this.board = snap;
    return bad;
  }

  isKingInCheck(color: Color) {
    let kr = 0, kc = 0;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (this.board[r][c]?.type === 'K' && this.board[r][c]?.color === color) { kr = r; kc = c; }
    return this.squareAttacked(kr, kc, this.opponent(color));
  }

  squareAttacked(r: number, c: number, by: Color) {
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 8; j++)
        if (this.board[i][j]?.color === by)
          if (this.getPseudoMoves(i, j).some(m => m.r === r && m.c === c))
            return true;
    return false;
  }

  getPseudoMoves(r: number, c: number) {
    const p = this.board[r][c];
    if (!p) return [];
    switch (p.type) {
      case 'P': return this.pawnMoves(r, c, p);
      case 'R': return this.slide(r, c, p, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
      case 'B': return this.slide(r, c, p, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
      case 'Q': return this.slide(r, c, p, [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
      case 'N': return this.knight(r, c, p);
      case 'K': return [];
    }
    return [];
  }

  opponent(c: Color) { return c === 'WHITE' ? 'BLACK' : 'WHITE'; }
  inBounds(r: number, c: number) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

  pieceIcon(p: Piece) {
    const m: any = {
      WHITE: { P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔' },
      BLACK: { P: '♟', R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚' }
    };
    return m[p.color][p.type];
  }

  toAlgebra(r: number, c: number) {
    return String.fromCharCode(97 + c) + (8 - r);
  }

  recordMove(piece: Piece, fr: number, fc: number, tr: number, tc: number, capture: boolean) {
    let move = '';

    if (piece.type !== 'P') move += piece.type;
    if (capture) move += 'x';
    move += this.toAlgebra(tr, tc);

    this.moveHistory.push(move);
  }

  undo() {
    if (!this.undoStack.length) return;

    const current = {
      board: this.board.map(r => r.map(c => c ? { ...c } : null)),
      turn: this.currentTurn,
      enPassant: this.enPassant,
      capturedWhite: [...this.capturedWhite],
      capturedBlack: [...this.capturedBlack]
    };
    this.redoStack.push(current);

    const prev = this.undoStack.pop()!;
    this.board = prev.board;
    this.currentTurn = prev.turn;
    this.enPassant = prev.enPassant;
    this.capturedWhite = prev.capturedWhite;
    this.capturedBlack = prev.capturedBlack;
  }

  redo() {
    if (!this.redoStack.length) return;

    const current = {
      board: this.board.map(r => r.map(c => c ? { ...c } : null)),
      turn: this.currentTurn,
      enPassant: this.enPassant,
      capturedWhite: [...this.capturedWhite],
      capturedBlack: [...this.capturedBlack]
    };
    this.undoStack.push(current);

    const next = this.redoStack.pop()!;
    this.board = next.board;
    this.currentTurn = next.turn;
    this.enPassant = next.enPassant;
    this.capturedWhite = next.capturedWhite;
    this.capturedBlack = next.capturedBlack;
  }

  resetGame() {
    // reset board & pieces
    this.resetBoard();

    // game state
    this.gameOver = false;
    this.status = '';
    this.isCheck = false;
    this.isCheckmate = false;

    this.winner = null;
    this.loser = null;
    this.lastMove = null;

    // history
    this.moveHistory = [];
    this.undoStack = [];
    this.redoStack = [];

    // captures
    this.capturedWhite = [];
    this.capturedBlack = [];
    this.showCaptured = true;

    // UI states
    this.promotingPawn = null;
    this.selected = null;
    this.possibleMoves = [];
    this.showMoves = false;
    this.showHelp = false;

    // AI
    this.aiThinking = false;

    // clocks (important)
    clearInterval(this.timer);
    this.whiteTime = 5 * 60;
    this.blackTime = 5 * 60;
  }

  whiteTime = 5 * 60; // 5 minutes
  blackTime = 5 * 60;
  timer: any;

  startClock() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.currentTurn === 'WHITE') this.whiteTime--;
      else this.blackTime--;

      if (this.whiteTime <= 0 || this.blackTime <= 0) {
        this.gameOver = true;
        this.status = 'TIME OUT';
        clearInterval(this.timer);
      }
    }, 1000);
  }

  applyAIMove(fr: number, fc: number, tr: number, tc: number) {
    const piece = this.board[fr][fc]!;
    const target = this.board[tr][tc];

    // ✅ HANDLE AI CAPTURE
    if (target && target.color !== piece.color) {
      this.addCapturedPiece(target);
    }

    this.board[tr][tc] = piece;
    this.board[fr][fc] = null;
    piece.moved = true;

    this.recordMove(piece, fr, fc, tr, tc, !!target);

    this.currentTurn = this.opponent(this.currentTurn);
    this.checkGameState();
    this.lastMove = { fr, fc, tr, tc };
  }

  aiMove() {
    if (this.gameOver || this.currentTurn !== this.aiColor) return;

    // OPENING BOOK
    if (this.moveHistory.length < 6) {
      const opening = this.getOpeningMove();
      if (opening) {
        for (let r = 0; r < 8; r++)
          for (let c = 0; c < 8; c++)
            if (this.board[r][c]?.color === this.aiColor)
              for (const m of this.getLegalMoves(r, c))
                if (this.toAlgebra(m.r, m.c) === opening) {
                  this.makeMove(r, c, m.r, m.c);
                  return;
                }
      }
    }

    this.aiThinking = true;   // 👈 START THINKING

    setTimeout(() => {
      let bestScore = -Infinity;
      let bestMove: any = null;

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (this.board[r][c]?.color === this.aiColor) {
            for (const m of this.getLegalMoves(r, c)) {
              const snap = this.cloneBoard();
              this.makeTempMove(r, c, m.r, m.c);

              const score = this.minimax(
                this.difficulty - 1,
                false,
                -Infinity,
                Infinity
              );

              this.board = snap;

              if (score > bestScore) {
                bestScore = score;
                bestMove = { fr: r, fc: c, tr: m.r, tc: m.c };
              }
            }
          }
        }
      }

      if (bestMove) {
        this.applyAIMove(
          bestMove.fr,
          bestMove.fc,
          bestMove.tr,
          bestMove.tc
        );
      }

      this.aiThinking = false; // 👈 STOP THINKING
    }, 400); // small delay for UX
  }

  cloneBoard() {
    return this.board.map(r => r.map(c => c ? { ...c } : null));
  }

  makeTempMove(fr: number, fc: number, tr: number, tc: number) {
    this.board[tr][tc] = this.board[fr][fc];
    this.board[fr][fc] = null;
  }

  minimax(depth: number, maximizing: boolean, alpha: number, beta: number): number {
    if (depth === 0) return this.evaluateBoard();

    if (maximizing) {
      let maxEval = -Infinity;
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          if (this.board[r][c]?.color === this.aiColor)
            for (const m of this.getLegalMoves(r, c)) {
              const snap = this.cloneBoard();
              this.makeTempMove(r, c, m.r, m.c);
              const evalScore = this.minimax(depth - 1, false, alpha, beta);
              this.board = snap;
              maxEval = Math.max(maxEval, evalScore);
              alpha = Math.max(alpha, evalScore);
              if (beta <= alpha) break;
            }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          if (this.board[r][c]?.color !== this.aiColor)
            for (const m of this.getLegalMoves(r, c)) {
              const snap = this.cloneBoard();
              this.makeTempMove(r, c, m.r, m.c);
              const evalScore = this.minimax(depth - 1, true, alpha, beta);
              this.board = snap;
              minEval = Math.min(minEval, evalScore);
              beta = Math.min(beta, evalScore);
              if (beta <= alpha) break;
            }
      return minEval;
    }
  }

  evaluateBoard() {
    const val: any = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };
    let score = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p) continue;

        let pieceScore = val[p.type];

        // center control bonus
        if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
          pieceScore += 10;
        }

        // pawn advancement
        if (p.type === 'P') {
          pieceScore += p.color === 'WHITE' ? (6 - r) * 5 : (r - 1) * 5;
        }

        // mobility bonus
        pieceScore += this.getLegalMoves(r, c).length * 2;

        score += p.color === this.aiColor ? pieceScore : -pieceScore;
      }
    }
    return score;
  }

  exportFEN() {
    return this.board.map(row =>
      row.reduce((a, c) => {
        if (!c) return a + 1;
        return a + (c.color === 'WHITE' ? c.type : c.type.toLowerCase());
      }, '')
    ).join('/');
  }

  exportPGN() {
    return this.moveHistory
      .map((m, i) => i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ${m}` : m)
      .join(' ');
  }

  showHelp = false;
  hintMove: { fr: number; fc: number; tr: number; tc: number } | null = null;

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  /* ================= HINT ================= */
  showHint() {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c]?.color === this.currentTurn) {
          const moves = this.getLegalMoves(r, c);
          if (moves.length) {
            this.selected = { r, c };
            this.possibleMoves = [moves[0]]; // simple hint
            return;
          }
        }
      }
    }
  }

  algebraToMove(move: string) {
    const file = move[0].charCodeAt(0) - 97;
    const rank = 8 - parseInt(move[1]);
    return { r: rank, c: file };
  }

  getOpeningMove() {
    const key = this.moveHistory.join(' ');
    const options = this.openingBook[key];
    if (!options) return null;

    const choice = options[Math.floor(Math.random() * options.length)];
    return choice;
  }

}
