import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { AuthStateService } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.css'
})
export class PublicHomeComponent implements OnInit {

  heroCodeSnippet!: SafeHtml;

  isLoggedIn$!: Observable<boolean>;
  userName: string | null = null;

  counters = {
    learners: 0,
    questions: 0,
    success: 0
  };

  // ================= DAILY PRACTICE STATE =================
  streakDays = 7;
  streakGoal = 30;

  // weekly progress (0–100)
  weeklyProgress = [40, 55, 70, 85, 95];

  // ROUTE FOR TODAY'S CHALLENGE
  todayChallengeRoute = '/challenges/today';

  testimonials = [
    {
      name: 'Rohit Kumar',
      role: 'Java Developer',
      text:
        'JavaArray helped me move from random preparation to a structured interview mindset. I cracked multiple service-based company interviews within 45 days.'
    },
    {
      name: 'Anusha Reddy',
      role: 'Spring Boot Engineer',
      text:
        'Unlike YouTube tutorials, JavaArray focuses only on what actually matters in interviews. The explanations are clear and practical.'
    },
    {
      name: 'Vikas Sharma',
      role: 'Backend Engineer',
      text:
        'This platform changed how I think during interviews. I finally understood why answers work instead of memorizing them.'
    }
  ];

  activeTestimonial = 0;

  billing: 'monthly' | 'lifetime' = 'lifetime';

  constructor(
    private sanitizer: DomSanitizer,
    private authState: AuthStateService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn$ = this.authState.isLoggedIn$;
    this.animateHeroCode();
    this.animateCounters();
    this.rotateTestimonials();

    const user = this.authState.getUser();
    this.userName = user?.name || null;
  }

  animateHeroCode(): void {
    const code = `
public class JavaArray {
  public static void main(String[] args) {
    System.out.println("Crack Interviews 🚀");
  }
}`;
    let i = 0;

    const timer = setInterval(() => {
      this.heroCodeSnippet = this.sanitizer.bypassSecurityTrustHtml(
        `<span>${code.slice(0, i++)}</span>`
      );
      if (i > code.length) clearInterval(timer);
    }, 35);
  }

  animateCounters(): void {
    const target = { learners: 15000, questions: 1200, success: 92 };

    const tick = () => {
      if (this.counters.learners < target.learners) this.counters.learners += 300;
      if (this.counters.questions < target.questions) this.counters.questions += 25;
      if (this.counters.success < target.success) this.counters.success += 1;
      requestAnimationFrame(tick);
    };
    tick();
  }

  rotateTestimonials(): void {
    setInterval(() => {
      this.activeTestimonial =
        (this.activeTestimonial + 1) % this.testimonials.length;
    }, 4500);
  }

  toggleBilling(type: 'monthly' | 'lifetime'): void {
    this.billing = type;
  }

  /* ===== RING CALCULATION ===== */
  get streakOffset(): number {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const progress = this.streakDays / this.streakGoal;
    return circumference - progress * circumference;
  }

  dailyFeatures = [
    { icon: '🧩', title: 'Daily Code Challenges', desc: 'Solve one real interview-style problem every day.' },
    { icon: '🧠', title: 'Code Puzzles', desc: 'Sharpen logic with tricky Java & backend puzzles.' },
    { icon: '🔥', title: 'Streak System', desc: 'Maintain streaks and stay consistent.' },
    { icon: '🏆', title: 'Leaderboards', desc: 'Compete and get ranked daily.' },
    { icon: '🎉', title: 'Winners & Applause', desc: 'Top learners get featured.' },
    { icon: '🎁', title: 'Rewards', desc: 'Unlock achievements & rewards.' }
  ];

}
