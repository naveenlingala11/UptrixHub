import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Game2048AiService } from '../../games/services/game-2048-ai.service';
import { XpEventsService } from '../../services/xp-events.service';
import { Game2048LeaderboardComponent } from '../game-2048-leaderboard.component/game-2048-leaderboard.component';
import { Game2048Engine, Direction } from '../game-2048.engine';


@Component({
  standalone: true,
  selector: 'app-game-2048',
  imports: [CommonModule, Game2048LeaderboardComponent],
  templateUrl: './game-2048.html',
  styleUrls: ['./game-2048.css']
})
export class Game2048Component implements OnInit {

  game!: Game2048Engine;
  submitted = false;
  aiInterval: any;

  dailyMode = false;
  dailyPlayed = false;
  medal?: string;

  constructor(
    private http: HttpClient,
    private xp: XpEventsService,
    private ai: Game2048AiService
  ) { }

  ngOnInit() {
    this.game = new Game2048Engine();
  }

  restart() {
    this.submitted = false;
    clearInterval(this.aiInterval);
    this.game.reset();
  }

  move(dir: Direction) {
    const moved = this.game.move(dir);
    if ((this.game.gameOver || this.game.won) && !this.submitted) {
      this.submitted = true;
      this.submit();
    }
    return moved;
  }

  submit() {
    this.http.post<any>('/api/games/2048/result', {
      score: this.game.score,
      won: this.game.won
    }).subscribe(res => {
      if (res?.earnedXp) {
        this.xp.emitXp({
          xp: res.earnedXp,
          reason: this.game.won ? 'Won 2048' : 'Played 2048'
        });
      }
    });
  }

  startAi() {
    clearInterval(this.aiInterval);
    this.aiInterval = setInterval(() => {
      if (this.game.gameOver) clearInterval(this.aiInterval);
      this.move(this.ai.bestMove(this.game));
    }, 120);
  }

  startDaily() {
    this.dailyMode = true;
    this.dailyPlayed = false;
    this.submitted = false;
    this.game.resetWithSeed(this.todaySeed());
  }

  submitDaily() {
    this.http.post<any>(
      '/api/games/2048/daily/submit',
      {
        score: this.game.score,
        won: this.game.won
      }
    ).subscribe(res => {
      this.medal = res.medal;
      this.dailyPlayed = true;

      this.xp.emitXp({
        xp: res.medal === 'GOLD' ? 100 : 40,
        reason: `Daily Challenge (${res.medal})`
      });
    });
  }

  todaySeed(): number {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent) {
    const map: any = {
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      ArrowUp: 'UP',
      ArrowDown: 'DOWN'
    };
    if (map[e.key]) {
      e.preventDefault();
      this.move(map[e.key]);
    }
  }

  tileClass(v: number) {
    return v ? `tile tile-${v}` : 'tile';
  }
}
