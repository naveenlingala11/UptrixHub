import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import flatpickr from 'flatpickr';
import { MockInterviewService } from '../../services/mock-interview.service';

@Component({
  selector: 'app-mock-interview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mock-interview.component.html',
  styleUrl: './mock-interview.component.css'
})
export class MockInterviewComponent implements OnInit, AfterViewInit {

  /* ================= ACCESS ================= */
  isPro = true;

  /* ================= FORM ================= */
  role = '';
  platform = 'ZOOM';
  slots: string[] = [];
  submitting = false;

  /* ================= DATA ================= */
  requests: any[] = [];
  sessions: any[] = [];

  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  @ViewChild('calendar')
  calendar!: ElementRef<HTMLInputElement>;

  constructor(private service: MockInterviewService) { }

  ngOnInit() {
    this.load();
  }

  ngAfterViewInit() {
    flatpickr(this.calendar.nativeElement, {
      enableTime: true,
      mode: 'multiple',
      dateFormat: 'Y-m-d H:i',
      minDate: 'today',
      time_24hr: true,
      minuteIncrement: 15,
      disableMobile: true,

      onChange: (dates: Date[]) => {
        if (dates.length > 3) {
          dates.pop(); // hard limit
          alert('You can select max 3 slots');
        }
        this.slots = dates.map(d => d.toISOString());
      }
    });
    this.service.requestMock({
      role: this.role,
      platform: this.platform,
      preferredSlots: this.slots,
      timezone: this.timezone
    });

  }

  load() {
    this.service.myRequests().subscribe(r => this.requests = r);
    this.service.mySessions().subscribe(s => this.sessions = s);
  }

  submitRequest() {
    if (!this.isPro) return;

    if (!this.role || this.slots.length === 0) {
      alert('Please enter role and select time slots');
      return;
    }

    this.submitting = true;

    this.service.requestMock({
      role: this.role,
      platform: this.platform,
      preferredSlots: this.slots
    }).subscribe(() => {
      this.submitting = false;
      this.role = '';
      this.slots = [];
      this.load();
      alert('✅ Mock interview request submitted');
    });
  }

  removeSlot(index: number) {
    this.slots.splice(index, 1);
  }

  getStatusClass(status: string) {
    return status?.toLowerCase();
  }

  getCountdown(date: string) {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return 'Starting now';

    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${hrs}h ${mins}m`;
  }

  addToCalendar(s: any) {
    const start = new Date(s.scheduledAt).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(
      new Date(s.scheduledAt).getTime() + s.duration * 60000
    ).toISOString().replace(/-|:|\.\d+/g, '');

    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE
&text=Mock+Interview+-+${s.role}
&dates=${start}/${end}
&details=Join+Interview:+${s.meetingLink}
&location=${s.meetingLink}`;

    window.open(url, '_blank');
  }
}
