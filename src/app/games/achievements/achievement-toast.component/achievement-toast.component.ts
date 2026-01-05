import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-achievement-toast',
  imports: [CommonModule],
  templateUrl: './achievement-toast.component.html',
  styleUrls: ['./achievement-toast.component.css']
})
export class AchievementToastComponent {

  @Input() title = '';
  @Input() icon = '';
}
