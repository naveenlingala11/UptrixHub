import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../cart/cart.service';
import { CourseApiService } from '../../services/course-api.service';

@Component({
  selector: 'app-courses-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './courses-detail.component.html',
  styleUrl: './courses-detail.component.css',
})
export class CoursesDetailComponent implements OnInit {

  course: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private courseApi: CourseApiService,
    private cart: CartService,
    private router: Router
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.courseApi.getCourseDetail(id).subscribe({
      next: res => {
        this.course = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/404']);
      }
    });
  }

  isLocked(lesson: any) {
    return this.course.priceType === 'PRO' && lesson.locked;
  }

  addToCart() {
    this.cart.addItem({
      courseId: this.course.id,
      title: this.course.title,
      price: this.course.price ?? 0,
      priceType: this.course.priceType
    });
  }

  buyNow() {
    this.addToCart();
    this.router.navigate(['/pricing']);
  }
  
}
