import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BugHunterHistory, BugHunterService } from '../../services/bug-hunter.service';
import { AuthStateService } from '../../../core/services/auth-state.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-bug-hunter-history',
  templateUrl: './bug-hunter-history.component.html',
  styleUrls: ['./bug-hunter-history.component.css']
})
export class BugHunterHistoryComponent implements OnInit {

  history: BugHunterHistory[] = [];
  accuracy = 0;

  constructor(
    private api: BugHunterService,
    private auth: AuthStateService
  ) {}

  ngOnInit() {
    const user = this.auth.getUser();
    if (!user?.id) return;

    this.api.getHistory(user.id).subscribe(res => {
      this.history = res;
      this.calculateAccuracy();
    });
  }

  private calculateAccuracy() {
    if (!this.history.length) return;

    const correct = this.history.filter(h => h.correct).length;
    this.accuracy = Math.round((correct / this.history.length) * 100);
  }
}
