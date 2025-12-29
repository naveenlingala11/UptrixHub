import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Course } from '../courses/course.model';
import { CourseApiService } from '../services/course-api.service';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-all-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RouterLink],
  templateUrl: './all-courses.component.html',
  styleUrl: './all-courses.component.css'
})
export class AllCoursesComponent implements OnInit {

  loading = true;

  searchText = '';
  selectedCategory = 'All';

  priceFilter: 'ALL' | 'FREE' | 'PRO' = 'ALL';
  showPriceFilter = false;
  errorMessage = '';

  categories = ['All', 'Java', 'Backend', 'Frontend', 'APIs', 'Database', 'DevOps', 'Interview'];

  courses: Course[] = [];

  constructor(private courseApi: CourseApiService,
    private router: Router,
    private cart: CartService
  ) { }

  ngOnInit() {
    this.courseApi.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data.map(c => ({
          ...c,
          locked: c.priceType === 'PRO' && !c.unlocked,
          category: this.inferCategory(c.title),
          level: this.inferLevel(c.title)
        }));
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load courses';
        this.loading = false;
      }
    });
  }

  /* ================= UI HELPERS ================= */

  inferCategory(title: string): string {
    if (title.toLowerCase().includes('java')) return 'Java';
    if (title.toLowerCase().includes('spring')) return 'Backend';
    if (title.toLowerCase().includes('angular') || title.toLowerCase().includes('react')) return 'Frontend';
    if (title.toLowerCase().includes('docker') || title.toLowerCase().includes('kubernetes')) return 'DevOps';
    if (title.toLowerCase().includes('sql') || title.toLowerCase().includes('hibernate')) return 'Database';
    return 'Backend';
  }

  inferLevel(title: string): 'Beginner' | 'Intermediate' | 'Advanced' {
    if (title.toLowerCase().includes('advanced')) return 'Advanced';
    if (title.toLowerCase().includes('core') || title.toLowerCase().includes('basics')) return 'Beginner';
    return 'Intermediate';
  }

  getLevelColor(level?: 'Beginner' | 'Intermediate' | 'Advanced') {
    if (!level) return '';

    return {
      Beginner: 'level-beginner',
      Intermediate: 'level-intermediate',
      Advanced: 'level-advanced'
    }[level] || '';
  }

  get filteredCourses(): Course[] {
    return this.courses.filter(c =>
      (this.selectedCategory === 'All' || c.category === this.selectedCategory) &&
      c.title.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.priceFilter === 'ALL' || c.priceType === this.priceFilter)
    );
  }

  buyCourse(course: Course) {
    this.cart.addItem({
      courseId: course.id,
      title: course.title,
      price: course.price,
      priceType: course.priceType
    });

    this.router.navigate(['/cart']);
  }

}
