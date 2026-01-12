import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HanoiService } from '../../services/hanoi/hanoi.service';

@Component({
  standalone: true,
  selector: 'app-hanoi-leaderboard',
  imports: [CommonModule],
  templateUrl: './hanoi-leaderboard.component.html',
  styleUrls: ['./hanoi-leaderboard.component.css']
})
export class HanoiLeaderboardComponent implements OnInit {

  @Input() disks = 4;
  scores: any[] = [];

  constructor(private hanoi: HanoiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.hanoi.leaderboard(this.disks).subscribe(res => this.scores = res);
  }
}
