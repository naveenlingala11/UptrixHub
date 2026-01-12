import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HanoiService } from '../../services/hanoi/hanoi.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  selector: 'app-hanoi-daily',
  templateUrl: './hanoi-daily.component.html'
})
export class HanoiDailyComponent implements OnInit {

  challenge: any;

  constructor(private hanoi: HanoiService) {}

  ngOnInit() {
    this.hanoi.dailyChallenge().subscribe(c => this.challenge = c);
  }
}
