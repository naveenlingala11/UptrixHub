import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PseudoService } from '../pseudo.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pseudo-result',
  imports: [CommonModule],
  templateUrl: './pseudo-result.component.html',
  styleUrls: ['./pseudo-result.component.css']
})
export class PseudoResultComponent {

  summary: any;
  questions: any[] = [];
  answers: any = {};
  explanations: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pseudo: PseudoService
  ) {
    // data passed via navigation state
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as any;

    this.summary = state?.summary;
    this.questions = state?.questions || [];
    this.answers = state?.answers || {};

    this.loadExplanations();
  }

  loadExplanations() {
    this.questions.forEach(q => {
      this.pseudo.submitAnswer(q.id, this.answers[q.id])
        .subscribe(res => {
          this.explanations[q.id] = res;
        });
    });
  }

  accuracy(): number {
    return Math.round(
      (this.summary.correct / this.summary.totalQuestions) * 100
    );
  }

  backToHome() {
    this.router.navigate(['/pseudo-code']);
  }
}
