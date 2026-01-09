import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodePracticeComponent } from '../../../code/code-practice.component/code-practice.component';
import { DailyChallenge, DailyChallengeService } from '../services/daily-challenge.service';
import { HttpClient } from '@angular/common/http';

interface DailyChallengeSubmitResponse {
  success: boolean;
  locked: boolean;
  verdict?: string;
  message?: string;
  xpEarned?: number;
}

@Component({
  selector: 'app-daily-challenge',
  standalone: true,
  imports: [CommonModule, CodePracticeComponent],
  templateUrl: './daily-challenge.component.html',
  styleUrl: './daily-challenge.component.css'
})
export class DailyChallengeComponent implements OnInit, AfterViewInit {

  @ViewChild(CodePracticeComponent)
  editor!: CodePracticeComponent;

  challenge!: DailyChallenge;
  challengeFiles: any[] = [];

  solved = false;
  locked = false;          // ✅ ADD
  xp = 0;                  // ✅ ADD
  submitting = false;

  constructor(
    private service: DailyChallengeService,
    private http: HttpClient
  ) { }

  ngAfterViewInit() {
    // editor is now SAFE
  }

  ngOnInit() {
    this.service.loadToday().subscribe({
      next: c => {
        this.challenge = c;
        this.challengeFiles = [{
          name: 'Main.java',
          content: c.starterCode,
          dirty: false
        }];
        this.locked = c.locked;
      },
      error: err => {
        console.error(err);
        alert('❌ No daily challenge published today');
      }
    });
  }

  submit() {
    if (this.locked || this.submitting) return;

    this.submitting = true;

    const code = this.editor.files[0].content;

    this.http.post<DailyChallengeSubmitResponse>(
      '/api/daily-challenge/submit',
      {
        code,
        javaVersion: '17'
      }
    ).subscribe({
      next: res => {
        this.locked = res.locked;

        if (res.success) {
          this.solved = true;
          this.xp = res.xpEarned || 0;
          this.launchConfetti();
        }
      },
      error: () => {
        alert('❌ Submission failed');
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }

  launchConfetti() {
    const confetti = (window as any).confetti;
    if (!confetti) return;

    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.6 }
    });
  }
}
