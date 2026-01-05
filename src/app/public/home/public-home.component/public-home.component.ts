import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HomeDataService } from '../service/home-data.service';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.css'
})
export class PublicHomeComponent implements OnInit {

  heroCodeSnippet!: SafeHtml;

  activeFaq: number | null = 2;

  constructor(
    private sanitizer: DomSanitizer,
    private homeData: HomeDataService
  ) { }

  faqs = [
    { q: 'Do I get future updates?', a: 'Yes. All JavaArray Interview Kits include lifetime updates.' },
    { q: 'How do I access the content?', a: 'After purchase, kits unlock instantly in dashboard.' },
    { q: 'Is this beginner friendly?', a: 'Yes. Start with Core Java then advance gradually.' },
    { q: 'Is Core Java included in Complete Kit?', a: 'Yes. Core Java, Spring Boot, DSA & SD included.' },
    { q: 'How long does it take?', a: '30–45 days with consistent practice.' },
    { q: 'Is content genuine?', a: 'All questions are from real interviews.' }
  ];

  kitsComparison = [
    { feature: 'Core Java', core: '✔', spring: '✔', full: '✔', micro: '✖' },
    { feature: 'Spring Boot', core: '✖', spring: '✔', full: '✔', micro: '✔' },
    { feature: 'DSA', core: '✖', spring: '✖', full: '✔', micro: '✖' },
    { feature: 'Microservices', core: '✖', spring: '✖', full: '✔', micro: '✔' },
    { feature: 'Lifetime Updates', core: '✔', spring: '✔', full: '✔', micro: '✔' }
  ];

  showStickyCTA = true;

  publicStats: any;

  ngOnInit() {
    this.heroCodeSnippet = this.sanitizer.bypassSecurityTrustHtml(`
      <span class="kw">public</span> <span class="kw">class</span> <span class="cls">HelloWorld</span> {
        <span class="kw">public</span> <span class="kw">static</span> <span class="kw">void</span> <span class="fn">main</span>(<span class="cls">String</span>[] args) {
          <span class="cls">System</span>.<span class="fn">out</span>.<span class="fn">println</span>(
            <span class="str">"Hello, JavaArray 🚀"</span>
          );
        }
      }
      `);
      
    this.heroCodeSnippet = this.sanitizer.bypassSecurityTrustHtml(`...`);

    this.homeData.getPublicStats()
      .subscribe(stats => this.publicStats = stats);
  }

  toggleFaq(i: number) {
    this.activeFaq = this.activeFaq === i ? null : i;
  }

  buyNow() {
    alert('Please login to continue 🚀');
  }
}
