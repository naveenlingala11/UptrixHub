import {
  Component,
  OnDestroy,
  OnInit,
  HostListener
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PseudoService } from '../pseudo.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pseudo-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pseudo-test.component.html',
  styleUrl: './pseudo-test.component.css',
})
export class PseudoTestComponent implements OnInit, OnDestroy {

  skill!: string;
  attemptId!: number;

  questions: any[] = [];
  answers: Record<number, string> = {};

  currentIndex = 0;

  // ⏱ TIMER
  expiresAt!: Date;
  remainingSeconds = 0;
  timerInterval: any;

  // 🌙 Theme
  darkMode = false;

  // ✅ PRACTICE MODE
  showResult = false;
  resultMap: Record<number, boolean> = {};

  constructor(
    private route: ActivatedRoute,
    private pseudo: PseudoService,
    private router: Router
  ) { }

  /* =============================
     INIT
  ============================== */

  ngOnInit() {
    this.skill = this.route.snapshot.paramMap.get('skill')!;
    this.loadTheme();
    this.tryResume();
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  /* =============================
     RESUME OR START
  ============================== */

  tryResume() {
    this.pseudo.resumeTest(this.skill).subscribe({
      next: res => {
        this.attemptId = res.attemptId;
        this.expiresAt = new Date(res.expiresAt);
        this.answers = res.answers || {};
        this.loadQuestions();
      },
      error: () => this.startTest()
    });
  }

  startTest() {
    this.pseudo.startTest(this.skill).subscribe(res => {
      this.attemptId = res.attemptId;
      this.expiresAt = new Date(res.expiresAt);
      this.loadQuestions();
    });
  }

  loadQuestions() {
    this.pseudo.getQuestions(this.skill).subscribe(res => {
      this.questions = res.content;
    });
  }

  /* =============================
     ANSWER SELECTION
  ============================== */

  select(option: string) {
    const q = this.questions[this.currentIndex];
    const qId = q.id;

    if (this.showResult) return;

    this.answers[qId] = option;
    this.resultMap[qId] = option === q.correctOption;
    this.showResult = true;
  }

  /* =============================
     NAVIGATION
  ============================== */

  goTo(index: number) {
    this.currentIndex = index;
    this.resetState();
  }

  next() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.resetState();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetState();
    }
  }

  resetState() {
    this.showResult = false;
  }

  /* =============================
     SUBMIT
  ============================== */

  submit() {
    this.pseudo.submitTest(this.attemptId, this.answers).subscribe();
  }

  /* =============================
     TIMER
  ============================== */

  updateRemaining() {
    const now = Date.now();
    const end = this.expiresAt.getTime();
    this.remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
  }

  get minutes() {
    return String(Math.floor(this.remainingSeconds / 60)).padStart(2, '0');
  }

  get seconds() {
    return String(this.remainingSeconds % 60).padStart(2, '0');
  }

  /* =============================
     KEYBOARD SHORTCUTS
  ============================== */

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {

    if (event.key === 'Escape' || event.key === 'F11') {
      event.preventDefault();
      return;
    }

    if (!this.questions.length) return;

    switch (event.key.toLowerCase()) {
      case 'a': this.select('A'); break;
      case 'b': this.select('B'); break;
      case 'c': this.select('C'); break;
      case 'd': this.select('D'); break;
      case 'arrowright': this.next(); break;
      case 'arrowleft': this.prev(); break;
    }
  }

  /* =============================
     DARK MODE
  ============================== */

  loadTheme() {
    this.darkMode = localStorage.getItem('pseudo-dark') === 'true';
    this.applyTheme();
  }

  toggleDark() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('pseudo-dark', String(this.darkMode));
    this.applyTheme();
  }

  applyTheme() {
    document.body.classList.toggle('pseudo-dark', this.darkMode);
  }

}
