import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BugHunterLeaderboardRow, AnalyticsService } from '../../services/admin-analytics.service';


@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-admin-leaderboard',
  templateUrl: './admin-leaderboard.component.html'
})
export class AdminLeaderboardComponent implements OnInit {

  leaderboard: BugHunterLeaderboardRow[] = [];

  constructor(private service: AnalyticsService) {}

  ngOnInit() {
    this.service.getLeaderboard()
      .subscribe(res => this.leaderboard = res);
  }

  medal(i: number): string {
    return i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
  }
}
