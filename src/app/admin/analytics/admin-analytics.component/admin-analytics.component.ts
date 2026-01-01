import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { AdminAnalyticsService } from '../../services/admin-analytics.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.css'
})
export class AdminAnalyticsComponent implements AfterViewInit {

  constructor(private analytics: AdminAnalyticsService) {}

  ngAfterViewInit() {
    this.loadSkillChart();
    this.loadSubscriptionChart();
    this.loadDifficultyChart();
  }

  loadSkillChart() {
    this.analytics.skillAnalytics().subscribe(data => {
      new Chart('skillChart', {
        type: 'bar',
        data: {
          labels: data.map(d => d.skill),
          datasets: [{
            label: 'Average Score',
            data: data.map(d => d.averageScore),
          }]
        }
      });
    });
  }

  loadSubscriptionChart() {
    this.analytics.subscriptionAnalytics().subscribe(data => {
      new Chart('subscriptionChart', {
        type: 'doughnut',
        data: {
          labels: data.map(d => d.subscription),
          datasets: [{
            data: data.map(d => d.attempts),
          }]
        }
      });
    });
  }

  loadDifficultyChart() {
    this.analytics.difficultyAnalytics().subscribe(data => {
      new Chart('difficultyChart', {
        type: 'pie',
        data: {
          labels: data.map(d => d.difficulty),
          datasets: [{
            data: data.map(d => d.count),
          }]
        }
      });
    });
  }
}
