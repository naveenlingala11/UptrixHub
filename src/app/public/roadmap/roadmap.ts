import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CourseApiService } from '../services/course-api.service';
import { environment } from '../../../environments/environment';

type Level = 'Beginner' | 'Intermediate' | 'Advanced' | string;

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap.html',
  styleUrl: './roadmap.css'
})
export class RoadmapComponent implements OnInit {

  roadmap: {
    courseId: string;   // ✅ STRING
    courseTitle: string;
    levels: { level: string; topics: string[] }[];
  } | null = null;

  progress: any[] = [];
  analytics: any;

  openLevel: Level | null = 'Beginner';
  loading = true;

  private api = environment.apiUrl; // 🔥 IMPORTANT

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private courseApi: CourseApiService
  ) { }

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');

    if (!param) {
      this.loading = false;
      return;
    }

    // slug always (core-java)
    this.loadAll(param);
  }

  /* ================= LOAD EVERYTHING ================= */

  private loadAll(courseId: string) {

    // ROADMAP
    this.http.get<any>(`${this.api}/roadmaps/${courseId}`).subscribe({
      next: r => {
        this.roadmap = r;
        this.loading = false;
      },
      error: err => {
        if (err.status === 404) {
          this.loading = false;
          console.warn('Roadmap not published yet');
        } else {
          console.error('Roadmap load failed', err);
          this.loading = false;
        }
      }
    });

    // PROGRESS
    this.http.get<any[]>(`${this.api}/roadmap-progress/${courseId}`)
      .subscribe({
        next: p => this.progress = p,
        error: err => console.error('Progress not loaded', err)
      });

    // ANALYTICS
    this.http.get<any>(`${this.api}/roadmap-analytics/${courseId}`)
      .subscribe({
        next: a => this.analytics = a,
        error: err => console.error('Analytics not loaded', err)
      });
  }

  /* ================= UI ================= */

  toggleAccordion(level: Level) {
    this.openLevel = this.openLevel === level ? null : level;
  }

  isCompleted(level: string, topic: string) {
    return this.progress.some(
      p => p.level === level && p.topic === topic && p.completed
    );
  }

  toggleTopic(level: string, topic: string) {
    if (!this.roadmap) return;

    const payload = {
      courseId: this.roadmap.courseId, // ✅ STRING
      level,
      topic,
      completed: !this.isCompleted(level, topic)
    };

    this.http.post(`${this.api}/roadmap-progress`, payload)
      .subscribe(() => {
        const existing = this.progress.find(
          p => p.level === level && p.topic === topic
        );

        if (existing) {
          existing.completed = payload.completed;
        } else {
          this.progress.push(payload);
        }
      });
  }

}
