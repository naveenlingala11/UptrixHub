import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoursePlayerComponent } from '../course-player.component/course-player.component';
import { CourseApiService } from '../../services/course-api.service';

@Component({
  selector: 'app-course-player-page',
  standalone: true,
  imports: [CommonModule, CoursePlayerComponent],
  template: `
    <app-course-player
      *ngIf="course"
      [courseData]="course">
    </app-course-player>

    <div *ngIf="error" class="locked-screen">
      🔒 Purchase required to access this course
    </div>
  `
})
export class CoursePlayerPageComponent implements OnInit {

  course: any;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private api: CourseApiService,
    private router: Router
  ) {}

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id')!;

    this.api.getCourseContent(courseId).subscribe({
      next: data => this.course = data,
      error: () => this.error = true
    });
  }
}
