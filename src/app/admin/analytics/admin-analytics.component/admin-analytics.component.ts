import {
  Component,
  AfterViewInit,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import Chart from 'chart.js/auto';
import { BugCategoryAnalytics, BugQuestionAccuracy, AnalyticsService } from '../../services/admin-analytics.service';

@Component({
  standalone: true,
  selector: 'app-admin-analytics',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit, AfterViewInit {

  @ViewChild('trendChart') trendChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('successChart') successChart!: ElementRef<HTMLCanvasElement>;

  analytics: BugCategoryAnalytics[] = [];
  heatmap: BugQuestionAccuracy[] = [];

  stats: any;

  private trendChartInstance?: Chart;
  private successChartInstance?: Chart;

  constructor(private service: AnalyticsService) { }

  /* ================= INIT ================= */

  ngOnInit(): void {
    this.loadBugHunterAnalytics();
  }

  ngAfterViewInit(): void {
    this.loadDailyChallengeAnalytics();
  }

  /* ================= BUG HUNTER ================= */

  loadBugHunterAnalytics() {
    this.service.getCategoryAnalytics().subscribe(res => {
      this.analytics = res;
    });

    this.service.getQuestionAccuracy().subscribe(res => {
      this.heatmap = res;
    });
  }

  color(acc: number): string {
    if (acc < 40) return 'heat-red';
    if (acc < 70) return 'heat-orange';
    return 'heat-green';
  }

  /* ================= DAILY CHALLENGE ================= */

  loadDailyChallengeAnalytics() {
    this.service.getTodayAnalytics().subscribe(res => {
      this.stats = res;
      this.renderSuccessChart();
    });

    this.service.getDailyTrend().subscribe(data => {
      this.renderTrendChart(data);
    });
  }

  renderSuccessChart() {
    this.successChartInstance?.destroy();

    this.successChartInstance = new Chart(
      this.successChart.nativeElement,
      {
        type: 'doughnut',
        data: {
          labels: ['Success', 'Failure'],
          datasets: [{
            data: [
              this.stats.successfulSubmissions,
              this.stats.totalSubmissions - this.stats.successfulSubmissions
            ],
            backgroundColor: ['#22c55e', '#ef4444']
          }]
        },
        options: {
          cutout: '70%',
          plugins: { legend: { position: 'bottom' } }
        }
      }
    );
  }

  renderTrendChart(data: any[]) {
    this.trendChartInstance?.destroy();

    this.trendChartInstance = new Chart(
      this.trendChart.nativeElement,
      {
        type: 'line',
        data: {
          labels: data.map(d => d.date),
          datasets: [{
            label: 'Submissions',
            data: data.map(d => d.submissions),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,.15)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      }
    );
  }

  fromDate = '';
  toDate = '';

  applyFilter() {
    this.service.getTodayAnalytics(this.fromDate, this.toDate)
      .subscribe(res => {
        this.stats = res;
        this.renderSuccessChart();
      });
  }

  download(type: 'csv' | 'excel') {
    const req =
      type === 'csv'
        ? this.service.downloadCsv(this.fromDate, this.toDate)
        : this.service.downloadExcel(this.fromDate, this.toDate);

    req.subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'csv'
        ? 'daily-analytics.csv'
        : 'daily-analytics.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

}
