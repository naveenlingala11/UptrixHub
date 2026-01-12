import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-2048-leaderboard',
  imports: [CommonModule],
  templateUrl: './game-2048-leaderboard.component.html',
  styleUrls: ['./game-2048-leaderboard.component.css']
})
export class Game2048LeaderboardComponent implements OnInit {

  leaders: any[] = [];
  myRank?: number;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLeaderboard();
    this.loadRank();
  }

  loadLeaderboard() {
    this.http.get<any[]>(
      '/api/games/2048/leaderboard'
    ).subscribe(res => this.leaders = res);
  }

  loadRank() {
    this.http.get<number>(
      '/api/games/2048/leaderboard/rank'
    ).subscribe(rank => this.myRank = rank);
  }
}
