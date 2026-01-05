import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BugCategoryAnalytics, BugQuestionAccuracy, BugHunterAnalyticsService } from '../../services/admin-analytics.service';


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-analytics',
  templateUrl: './admin-analytics.component.html'
})
export class AdminAnalyticsComponent implements OnInit {

  analytics: BugCategoryAnalytics[] = [];
  heatmap: BugQuestionAccuracy[] = [];

  constructor(
    private service: BugHunterAnalyticsService
  ) {}

  ngOnInit(): void {

    this.service.getCategoryAnalytics()
      .subscribe((res: BugCategoryAnalytics[]) => {
        this.analytics = res;
      });

    this.service.getQuestionAccuracy()
      .subscribe((res: BugQuestionAccuracy[]) => {
        this.heatmap = res;
      });
  }

  color(acc: number): string {
    if (acc < 40) return 'heat-red';
    if (acc < 70) return 'heat-orange';
    return 'heat-green';
  }
}
