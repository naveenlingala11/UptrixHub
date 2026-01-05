import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-streak-widget',
  imports: [CommonModule],
  templateUrl: './streak-widget.component.html',
  styleUrls: ['./streak-widget.component.css']
})
export class StreakWidgetComponent {

  @Input() streak = 0;

}
