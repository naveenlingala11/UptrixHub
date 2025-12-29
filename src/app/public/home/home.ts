import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthStateService, AuthUser } from '../../core/services/auth-state.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {

  isLoggedIn = false;
  user: AuthUser | null = null;

  /* ================= HERO CODE (NEW) ================= */
  heroCodeSnippet!: SafeHtml;

  constructor(
    private authState: AuthStateService,
    private title: Title,
    private sanitizer: DomSanitizer,
    private router: Router
  ) { }

  ngOnInit() {
    // Hero code
    this.heroCodeSnippet = this.sanitizer.bypassSecurityTrustHtml(`
<span class="kw">public</span> <span class="kw">class</span> <span class="cls">HelloWorld</span> {
  <span class="kw">public</span> <span class="kw">static</span> <span class="kw">void</span> <span class="fn">main</span>(<span class="cls">String</span>[] args) {
    <span class="cls">System</span>.<span class="fn">out</span>.<span class="fn">println</span>(
      <span class="str">"Hello, JavaArray 🚀"</span>
    );
  }
}
`);

    // 🔐 Auth state
    this.authState.user$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
      this.title.setTitle(user ? `Welcome ${user.name}` : 'JavaArray');
    });
  }

  ngAfterViewInit() { }
  ngOnDestroy() { }

  /* ================= FAQ ================= */
  activeFaq: number | null = 2; // open 3rd by default (like reference)

  faqs = [
    {
      q: 'Do I get future updates?',
      a: 'Yes. All JavaArray Interview Kits include lifetime updates at no extra cost.'
    },
    {
      q: 'How do I access the content?',
      a: 'After purchase, kits are instantly unlocked in your dashboard. Learn anytime, anywhere.'
    },
    {
      q: 'Is this beginner friendly?',
      a: 'Absolutely! Start with Core Java Kit, then move to Spring Boot and Full Stack kits progressively.'
    },
    {
      q: 'Is Core Java Kit included in Complete Java Kit?',
      a: 'Yes. The Complete Java Interview Kit includes Core Java, Spring Boot, DSA, and System Design.'
    },
    {
      q: 'How long does it take to complete?',
      a: 'Most learners complete the kits in 30–45 days with consistent daily practice.'
    },
    {
      q: 'Is the content genuine?',
      a: '100%. All questions are curated from real interviews at product-based companies.'
    }
  ];

  toggleFaq(i: number) {
    this.activeFaq = this.activeFaq === i ? null : i;
  }

  /* ================= COMPARE KITS ================= */
  compareOpen = false;

  kitsComparison = [
    {
      feature: 'Core Java Questions',
      core: '✔',
      spring: '✔',
      full: '✔',
      micro: '✖'
    },
    {
      feature: 'Spring Boot & REST',
      core: '✖',
      spring: '✔',
      full: '✔',
      micro: '✔'
    },
    {
      feature: 'DSA + Machine Coding',
      core: '✖',
      spring: '✖',
      full: '✔',
      micro: '✖'
    },
    {
      feature: 'Microservices',
      core: '✖',
      spring: '✖',
      full: '✔',
      micro: '✔'
    },
    {
      feature: 'Lifetime Updates',
      core: '✔',
      spring: '✔',
      full: '✔',
      micro: '✔'
    }
  ];

  toggleCompare() {
    this.compareOpen = !this.compareOpen;
  }

  showStickyCTA = true;

  buyNow() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      alert('Please login to continue 🚀');
    } else {
      this.router.navigate(['/courses']);
    }
  }

  /* ================= SMART LEARNING PATH ================= */

  learningPath = [
    {
      title: 'Finish Java Collections',
      description: 'Master List, Set, Map & internal working',
      progress: 72,
      action: 'Continue',
      route: '/dashboard/home',
      status: 'in-progress'
    },
    {
      title: 'Start Spring Boot REST APIs',
      description: 'Controllers, RequestMapping, ResponseEntity',
      progress: 0,
      action: 'Start',
      route: '/roadmaps',
      status: 'recommended'
    },
    {
      title: 'Practice DSA (Arrays)',
      description: 'Solve 3 interview-level problems',
      progress: 40,
      action: 'Practice',
      route: '/practice/code',
      status: 'practice'
    }
  ];

  /* ================= INTERVIEW READINESS ================= */

  readinessScore = {
    overall: 72,
    breakdown: [
      { label: 'Core Java', value: 82, color: 'blue' },
      { label: 'Spring Boot', value: 68, color: 'purple' },
      { label: 'DSA', value: 55, color: 'orange' },
      { label: 'System Design', value: 40, color: 'red' }
    ]
  };

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Interview Ready';
    if (score >= 60) return 'Almost Ready';
    return 'Needs Improvement';
  }

  /* ================= ACTIVITY HEATMAP ================= */

  activityDays = [
    { date: '2025-01-01', count: 1 },
    { date: '2025-01-02', count: 3 },
    { date: '2025-01-03', count: 0 },
    { date: '2025-01-04', count: 5 },
    { date: '2025-01-05', count: 2 },
    { date: '2025-01-06', count: 4 },
    { date: '2025-01-07', count: 1 },
    { date: '2025-01-08', count: 0 },
    { date: '2025-01-09', count: 3 },
    { date: '2025-01-10', count: 6 },
  ];

  getHeatClass(count: number): string {
    if (count >= 5) return 'heat-5';
    if (count >= 3) return 'heat-3';
    if (count >= 1) return 'heat-1';
    return 'heat-0';
  }

  /* ================= COMPANY PREP ================= */

  companies = [
    {
      name: 'Amazon',
      tag: 'Product Based',
      questions: 420,
      focus: ['Java', 'DSA', 'LLD', 'Leadership'],
      locked: false
    },
    {
      name: 'Google',
      tag: 'FAANG',
      questions: 380,
      focus: ['DSA', 'System Design', 'Java'],
      locked: true
    },
    {
      name: 'Microsoft',
      tag: 'Product Based',
      questions: 310,
      focus: ['Java', 'OOPs', 'DSA'],
      locked: true
    },
    {
      name: 'Flipkart',
      tag: 'Indian Unicorn',
      questions: 260,
      focus: ['Java', 'Spring Boot', 'REST'],
      locked: false
    },
    {
      name: 'Uber',
      tag: 'Global Product',
      questions: 290,
      focus: ['DSA', 'Microservices'],
      locked: true
    }
  ];

  openCompany(company: any) {
    if (company.locked) {
      alert('🔒 PRO required to unlock this company kit');
      return;
    }
    // Later route: /company/:name
    alert(`Opening ${company.name} Interview Prep 🚀`);
  }

  /* ================= MOCK INTERVIEW ================= */

  mockInterview = {
    attempted: 3,
    total: 10,
    score: 62, // %
    strengths: ['Core Java', 'Collections', 'REST APIs'],
    weaknesses: ['System Design', 'Concurrency'],
    lastAttempt: '2 days ago'
  };

  startMockInterview() {
    if (!this.isLoggedIn) {
      return;
    }
    // future route: /mock-interview
    alert('🎤 Starting Mock Interview...');
  }

  getReadinessLevel(score: number): string {
    if (score >= 80) return 'Interview Ready';
    if (score >= 60) return 'Almost Ready';
    return 'Needs Improvement';
  }

  getReadinessClass(score: number): string {
    if (score >= 80) return 'ready';
    if (score >= 60) return 'mid';
    return 'low';
  }

  /* ================= RESUME ANALYZER ================= */

  resumeAnalysis = {
    uploaded: true,
    score: 68,
    strengths: [
      'Core Java',
      'Spring Boot',
      'REST APIs'
    ],
    missing: [
      'System Design',
      'Microservices',
      'Concurrency'
    ],
    suggestions: [
      'Add system design projects',
      'Mention scalability & performance',
      'Include concurrency examples'
    ]
  };

  getResumeLabel(score: number): string {
    if (score >= 80) return 'Strong Resume';
    if (score >= 60) return 'Average Resume';
    return 'Needs Improvement';
  }

  uploadResume() {
    alert('📄 Resume upload & analysis coming soon');
  }

  improveResume() {
    alert('🚀 Resume improvement roadmap coming soon');
  }

  /* ================= DAILY STUDY PLAN ================= */

  dailyPlan = {
    date: 'Today',
    totalTime: '90 mins',
    tasks: [
      {
        title: 'Core Java – Collections',
        type: 'Reading',
        duration: '25 mins',
        done: true
      },
      {
        title: 'DSA – Arrays Practice',
        type: 'Coding',
        duration: '30 mins',
        done: false
      },
      {
        title: 'Spring Boot – REST APIs',
        type: 'Revision',
        duration: '20 mins',
        done: false
      },
      {
        title: 'Mock Interview Question',
        type: 'Interview',
        duration: '15 mins',
        done: false,
        locked: true
      }
    ]
  };

  toggleTask(task: any) {
    if (task.locked) {
      alert('🔒 PRO required to unlock this task');
      return;
    }
    task.done = !task.done;
  }

  getCompletionPercent(): number {
    const total = this.dailyPlan.tasks.length;
    const done = this.dailyPlan.tasks.filter(t => t.done).length;
    return Math.round((done / total) * 100);
  }

  /* ================= INTERVIEW PLAYBACK ================= */

  interviewPlayback = [
    {
      question: 'Explain HashMap internal working in Java',
      duration: '6:45',
      type: 'audio',
      company: 'Amazon',
      locked: false
    },
    {
      question: 'Design a URL Shortener',
      duration: '12:30',
      type: 'video',
      company: 'Google',
      locked: true
    },
    {
      question: 'Difference between @Component and @Service',
      duration: '4:20',
      type: 'audio',
      company: 'Microsoft',
      locked: false
    },
    {
      question: 'How does Spring Boot auto-configuration work?',
      duration: '7:10',
      type: 'video',
      company: 'Uber',
      locked: true
    }
  ];

  playInterview(item: any) {
    if (item.locked) {
      alert('🔒 PRO required to play this interview answer');
      return;
    }
    alert(`▶ Playing ${item.type.toUpperCase()} answer for:\n${item.question}`);
  }

  /* ================= SALARY PREDICTOR ================= */

  salaryInsight = {
    currentCTC: 6, // LPA
    expectedCTC: 12,
    confidence: 78, // %
    readiness: 'Good',
    roles: [
      { role: 'Java Backend Developer', range: '10 – 14 LPA' },
      { role: 'Spring Boot Engineer', range: '12 – 16 LPA' },
      { role: 'Full Stack Java Dev', range: '14 – 18 LPA' }
    ],
    improvements: [
      'Improve system design answers',
      'Strengthen DSA consistency',
      'Add one scalable backend project'
    ]
  };

  getConfidenceClass(val: number): string {
    if (val >= 80) return 'high';
    if (val >= 60) return 'mid';
    return 'low';
  }

  openSalaryRoadmap() {
    alert('💼 Salary improvement roadmap coming soon');
  }

  /* ================= AI MENTOR ================= */

  mentorOpen = false;

  mentorMessages = [
    {
      from: 'ai',
      text: 'Hi 👋 I’m your AI Mentor. I can help you plan your interview preparation.'
    },
    {
      from: 'ai',
      text: 'Based on your progress, you should focus more on System Design and DSA.'
    }
  ];

  userMessage = '';

  toggleMentor() {
    this.mentorOpen = !this.mentorOpen;
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    // push user message
    this.mentorMessages.push({
      from: 'user',
      text: this.userMessage
    });

    const msg = this.userMessage;
    this.userMessage = '';

    // simulated AI response (replace with GPT later)
    setTimeout(() => {
      this.mentorMessages.push({
        from: 'ai',
        text: this.generateMockReply(msg)
      });
    }, 800);
  }

  generateMockReply(input: string): string {
    if (input.toLowerCase().includes('salary')) {
      return 'To improve salary, focus on system design, backend scalability, and mock interviews.';
    }
    if (input.toLowerCase().includes('roadmap')) {
      return 'I recommend completing Core Java → Spring Boot → DSA in that order.';
    }
    return 'Good question 👍 Keep practicing daily and follow your study plan.';
  }

  /* ================= MOCK INTERVIEW ================= */

  startMock(type: 'JAVA' | 'BACKEND' | 'FULLSTACK') {

    if (type === 'FULLSTACK' && !this.isLoggedIn) {
      alert('🔒 Login required');
      return;
    }

    // PRO check (later)
    if (type === 'FULLSTACK') {
      alert('⭐ PRO Interview — Coming next');
      return;
    }

    // Navigate to mock page (future)
    alert(`🎤 Starting ${type} Mock Interview`);
  }

}
