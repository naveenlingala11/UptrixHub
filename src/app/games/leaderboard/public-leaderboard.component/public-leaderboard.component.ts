import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, PublicLeaderboardRow } from '../../../admin/services/admin-analytics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-public-leaderboard',
  templateUrl: './public-leaderboard.component.html',
  styleUrls: ['./public-leaderboard.component.css']
})
export class PublicLeaderboardComponent implements OnInit {

  rows: PublicLeaderboardRow[] = [];

  constructor(private service: AnalyticsService) {}

  ngOnInit() {
    this.service.getPublicLeaderboard()
      .subscribe(res => this.rows = res);
  }

  medal(i: number): string {
    return i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
  }
}
