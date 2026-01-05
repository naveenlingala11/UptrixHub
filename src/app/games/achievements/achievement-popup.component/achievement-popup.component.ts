import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  XpEventsService,
  AchievementEvent
} from '../../services/xp-events.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-achievement-popup',
  templateUrl: './achievement-popup.component.html',
  styleUrls: ['./achievement-popup.component.css']
})
export class AchievementPopupComponent implements OnInit {

  visible = false;
  title = '';
  description = '';
  icon = '🏆';

  constructor(private events: XpEventsService) {}

  ngOnInit() {
    this.events.achievement$.subscribe((a: AchievementEvent) => {
      this.title = a.title;
      this.description = a.description;
      this.icon = a.icon || '🏆';
      this.visible = true;

      setTimeout(() => this.visible = false, 4000);
    });
    
  }
}
