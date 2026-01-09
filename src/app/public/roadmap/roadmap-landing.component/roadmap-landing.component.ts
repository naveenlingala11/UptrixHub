import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Course } from '../../courses/course.model';
import { CourseApiService } from '../../services/course-api.service';

@Component({
  selector: 'app-roadmap-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './roadmap-landing.component.html',
  styleUrls: ['./roadmap-landing.component.css'] // 🔥 REQUIRED
})
export class RoadmapLandingComponent implements OnInit {

  courses: Course[] = [];
  searchText = '';
  loading = true;

  constructor(
    private courseApi: CourseApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.courseApi.getAllCourses().subscribe({
      next: c => { this.courses = c; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get filteredCourses() {
    return this.courses.filter(c =>
      c.title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  open(course: Course) {
    this.router.navigate(['/roadmap', course.id]);
  }
}
