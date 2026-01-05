import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-xp-card',
  imports: [CommonModule],
  templateUrl: './xp-card.component.html',
  styleUrls: ['./xp-card.component.css']
})
export class XpCardComponent {

  @Input() totalXp = 0;
  @Input() level = 1;
  @Input() streak = 0;

  get progressPercent() {
    const base = (this.level - 1) * 100;
    return ((this.totalXp - base) / 100) * 100;
  }
}
