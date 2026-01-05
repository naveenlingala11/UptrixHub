import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BugHunterAnswerResponse, BugHunterQuestion, BugHunterService } from '../../services/bug-hunter.service';
import { XpEventsService } from '../../services/xp-events.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AiExplanationService } from '../../../ai/ai-explanation.service';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-bug-hunter',
  templateUrl: './bug-hunter.component.html',
  styleUrls: ['./bug-hunter.component.css']
})
export class BugHunterComponent implements OnInit {

  /* ================= GAME STATE ================= */
  question: BugHunterQuestion | null = null;
  options: string[] = [];
  selected: string | null = null;
  showResult = false;

  totalQuestions = 25;
  currentIndex = 0;
  correctCount = 0;
  checkpointEvery = 5;

  userId!: number;

  /* ================= AI STATE ================= */
  aiLoading = false;
  aiExplanation: string | null = null;
  aiGenerated = false;

  /* ================= UX STATE ================= */
  showHint = false;

  constructor(
    private api: BugHunterService,
    private events: XpEventsService,
    private authState: AuthStateService,
    private ai: AiExplanationService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const user = this.authState.getUser();
    if (!user?.id) return;

    this.userId = user.id;
    this.loadQuestion();
  }

  /* ================= LOAD QUESTION ================= */
  loadQuestion() {
    if (this.currentIndex >= this.totalQuestions) return;

    this.api.getQuestion('JAVA').subscribe({
      next: q => {
        if (!q) return;
        this.question = q;
        this.options = this.buildOptions(q.bugType);
        this.reset();
      }
    });
  }

  private buildOptions(correct: string): string[] {
    const pool = [
      'NullPointerException',
      'Deadlock',
      'Logical Error',
      'Concurrency Bug',
      'Runtime Exception',
      'Performance Bug',
      'Encapsulation Violation',
      'Thread Safety Issue'
    ];

    const wrong = pool.filter(p => p !== correct)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    return [correct, ...wrong].sort(() => 0.5 - Math.random());
  }

  /* ================= FIXED + ENHANCED ================= */

  confetti = false;

  private playConfetti() {
    // reset first
    this.confetti = false;

    // allow DOM repaint
    requestAnimationFrame(() => {
      this.confetti = true;

      // auto-hide
      setTimeout(() => {
        this.confetti = false;
      }, 1800);
    });
  }
  select(option: string) {
    if (this.showResult || !this.question) return;

    this.selected = option;
    this.showResult = true;

    this.api.submitAnswer({
      userId: this.userId,
      questionId: this.question.id,
      selectedAnswer: option
    }).subscribe({
      next: (res: BugHunterAnswerResponse) => {

        const correct = res.correct;

        // 🔢 count attempts ONCE
        this.currentIndex++;

        if (correct) {
          this.correctCount++;

          // ✅ XP
          this.events.emitXp({
            xp: res.earnedXp,
            reason: 'Bug fixed correctly'
          });

          // 🎉 CONFETTI
          this.playConfetti();

          // 🏁 CHECKPOINT
          if (this.correctCount % this.checkpointEvery === 0) {
            this.triggerCheckpoint();
          }

        } else {
          // 🤖 AI explanation
          this.loadAiExplanation();
        }
      },
      error: err => {
        console.error('Answer submit failed', err);
        this.showResult = false;
      }
    });
  }

  /* ================= AI ================= */
  loadAiExplanation() {
    if (!this.question) return;

    this.aiLoading = true;
    this.aiExplanation = null;

    this.ai.explainBug({
      questionId: this.question.id,
      code: this.question.code,
      bugType: this.question.bugType,
      difficulty: this.question.difficulty,
      userWasCorrect: false
    }).subscribe({
      next: res => {
        this.aiExplanation = res.explanation;
        this.aiGenerated = res.aiGenerated;
        this.aiLoading = false;
      },
      error: () => {
        this.aiExplanation = '⚠️ AI explanation unavailable.';
        this.aiGenerated = false;
        this.aiLoading = false;
      }
    });
  }

  /* ================= HELPERS ================= */
  get isCorrect(): boolean {
    return !!this.question && this.selected === this.question.bugType;
  }

  get accuracy(): number {
    return this.currentIndex === 0
      ? 0
      : Math.round((this.correctCount / this.currentIndex) * 100);
  }

  get progressPercent(): number {
    return (this.currentIndex / this.totalQuestions) * 100;
  }

  get wrongExplanation(): string | null {
    if (!this.question || this.isCorrect) return null;
    return `You selected "${this.selected}", but the actual issue is "${this.question.bugType}".`;
  }

  get highlightedCode(): string {
    if (!this.question) return '';
    return this.question.code.split('\n')
      .map(l => l.includes('synchronized') || l.includes('null') ? `👉 ${l}` : l)
      .join('\n');
  }

  get hint(): string | null {
    if (this.showResult) return null;
    switch (this.question?.difficulty) {
      case 'EASY': return '💡 Focus on basic Java rules';
      case 'MEDIUM': return '💡 Think about object behavior';
      case 'HARD': return '💡 Consider concurrency & JVM';
      default: return null;
    }
  }

  revealHint() {
    this.showHint = true;
  }

  triggerCheckpoint() {
    this.events.emitXp({ xp: 50, reason: `Checkpoint ${this.correctCount}` });
    this.events.emitAchievement({
      title: `Bug Slayer ${this.correctCount}`,
      description: `Fixed ${this.correctCount} bugs`
    });
  }

  next() {
    this.currentIndex++;
    this.loadQuestion();
  }

  reset() {
    this.selected = null;
    this.showResult = false;
    this.showHint = false;
    this.aiExplanation = null;
    this.aiGenerated = false;
    this.aiLoading = false;
  }
}
