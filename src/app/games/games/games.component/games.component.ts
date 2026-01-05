import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BugHunterService, BugHunterQuestion } from '../../services/bug-hunter.service';
import { Achievement } from '../../services/achievements.service';
import { StreakWidgetComponent } from '../../streak-widget.component/streak-widget.component';
import { XpCardComponent } from '../../xp-card.component/xp-card.component';

@Component({
  standalone: true,
  selector: 'app-games',
  imports: [
    CommonModule,
    XpCardComponent,
    StreakWidgetComponent
  ],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {

  constructor(
    private router: Router,
    private api: BugHunterService   // ✅ ADD THIS
  ) {}

  /** ================= XP ================= */
  userXp = {
    totalXp: 340,
    level: 4,
    currentStreak: 6
  };

  /** ================= ACHIEVEMENTS ================= */
  achievements: Achievement[] = [
    {
      code: 'BUG_HUNTER_5',
      title: 'Bug Slayer',
      icon: 'assets/badges/bug-hunter.png',
      unlocked: true
    }
  ];

  /** ================= GAME ================= */
  questions: BugHunterQuestion[] = [];
  question!: BugHunterQuestion;

  currentIndex = 0;
  correctCount = 0;

  ngOnInit() {
    this.loadSession();
  }

  loadSession() {
    this.api.getSession('JAVA')
      .subscribe((res: BugHunterQuestion[]) => {
        this.questions = res;
        this.currentIndex = 0;
        this.correctCount = 0;
        this.question = res[0];
      });
  }

  next() {
    this.currentIndex++;

    if (this.currentIndex < this.questions.length) {
      this.question = this.questions[this.currentIndex];
      this.reset();
    }
  }

  /** ✅ ADD RESET METHOD */
  reset() {
    // placeholder – extend later (clear selections, timers etc)
  }

  startBugHunter() {
    this.router.navigate(['/games/bug-hunter']);
  }
}
