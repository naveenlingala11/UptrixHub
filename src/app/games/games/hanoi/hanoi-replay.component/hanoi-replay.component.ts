import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Move {
  from: number;
  to: number;
  disk: number;
}

@Component({
  standalone: true,
  selector: 'app-hanoi-replay',
  imports: [CommonModule],
  templateUrl: './hanoi-replay.component.html',
  styleUrls: ['./hanoi-replay.component.css']
})
export class HanoiReplayComponent implements OnChanges {

  @Input() movesJson = '';
  moves: Move[] = [];
  rods: number[][] = [[], [], []];

  ngOnChanges() {
    if (!this.movesJson) return;

    this.moves = JSON.parse(this.movesJson);
    this.reset();
    this.play();
  }

  reset() {
    const maxDisk = Math.max(...this.moves.map(m => m.disk));
    this.rods = [
      Array.from({ length: maxDisk }, (_, i) => maxDisk - i),
      [],
      []
    ];
  }

  async play() {
    for (const m of this.moves) {
      await new Promise(r => setTimeout(r, 400));
      this.rods[m.from].pop();
      this.rods[m.to].push(m.disk);
    }
  }
}
