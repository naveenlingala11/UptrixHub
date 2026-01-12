import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HanoiMultiplayerService } from '../../services/hanoi/hanoi-multiplayer.service';

@Component({
  standalone: true,
  selector: 'app-hanoi-race',
  imports: [CommonModule],
  template: `
    <h3>⚡ Multiplayer Race</h3>
    <button (click)="join()">Join Room</button>
    <p *ngFor="let m of moves">{{m | json}}</p>
  `
})
export class HanoiRaceComponent {

  moves: any[] = [];

  constructor(private mp: HanoiMultiplayerService) {}

  join() {
    this.mp.connect('room-1', data => this.moves.push(data));
  }
}
