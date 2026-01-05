import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface XpEvent {
  xp: number;
  reason: string;
}

export interface AchievementEvent {
  title: string;
  description: string;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class XpEventsService {

  private xpSubject = new Subject<XpEvent>();
  private achievementSubject = new Subject<AchievementEvent>();

  xp$ = this.xpSubject.asObservable();
  achievement$ = this.achievementSubject.asObservable();

  emitXp(event: XpEvent) {
    this.xpSubject.next(event);
  }

  emitAchievement(event: AchievementEvent) {
    this.achievementSubject.next(event);
  }
}
