import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppStateService {

  private timerSub?: Subscription;
  private timeSubject = new BehaviorSubject<number>(0);

  time$ = this.timeSubject.asObservable();

  startTimer(startFrom = 0) {
    this.stopTimer();
    this.timeSubject.next(startFrom);

    this.timerSub = interval(1000).subscribe(() => {
      this.timeSubject.next(this.timeSubject.value + 1);
    });
  }

  stopTimer() {
    this.timerSub?.unsubscribe();
  }

  resetTimer() {
    this.stopTimer();
    this.timeSubject.next(0);
  }
}
