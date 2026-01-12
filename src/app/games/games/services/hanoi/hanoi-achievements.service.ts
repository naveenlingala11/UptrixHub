import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HanoiAchievementsService {

  getAchievements(moves: number, optimal: number, time: number): string[] {
    const a: string[] = [];

    if (moves === optimal) a.push('Perfect Solver 🏅');
    if (time < 60) a.push('Speed Runner ⚡');
    if (moves < optimal + 5) a.push('Near Optimal 🎯');

    return a;
  }

  calculateXp(moves: number, optimal: number): number {
    return Math.max(10, Math.round((optimal / moves) * 100));
  }
}
