import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XpEvent, XpEventsService } from '../services/xp-events.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-xp-toast',
  templateUrl: './xp-toast.component.html',
  styleUrls: ['./xp-toast.component.css']
})
export class XpToastComponent implements OnInit {

  visible = false;
  xp = 0;
  reason = '';

  constructor(private events: XpEventsService) {}

  ngOnInit() {
    this.events.xp$.subscribe((e: XpEvent) => {
      this.xp = e.xp;
      this.reason = e.reason;
      this.visible = true;

      setTimeout(() => this.visible = false, 3000);
    });
  }
}
