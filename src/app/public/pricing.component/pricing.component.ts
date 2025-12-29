import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStateService } from '../../core/services/auth-state.service';
import { PricingService } from '../services/pricing.service';
import { CartItem, CartService } from '../cart/cart.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent implements OnInit {

  courses: any[] = [];
  bundles: any[] = [];

  selectedCourseIds: string[] = [];
  cartItems: CartItem[] = [];

  constructor(
    private pricingApi: PricingService,
    private auth: AuthStateService,
    private router: Router,
    private cart: CartService
  ) {}

  ngOnInit() {

    /* Load cart items AFTER constructor */
    this.cartItems = this.cart.getItems();

    this.pricingApi.getCourses().subscribe(res => {
      this.courses = res;

      /* Auto-select courses from cart */
      if (this.cartItems.length) {
        this.courses.forEach(course => {
          const exists = this.cartItems.some(
            (ci: CartItem) => ci.courseId === course.courseId
          );

          if (exists) {
            course.selected = true;
            this.selectedCourseIds.push(course.courseId);
          }
        });
      }
    });

    this.pricingApi.getBundles().subscribe(res => {
      this.bundles = res;
    });
  }

  toggleCourse(course: any) {
    const id = course.courseId;

    if (this.selectedCourseIds.includes(id)) {
      this.selectedCourseIds =
        this.selectedCourseIds.filter(c => c !== id);
    } else {
      this.selectedCourseIds.push(id);
    }
  }

  proceedCustom() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(
        ['/login'],
        { queryParams: { redirect: '/pricing' } }
      );
      return;
    }

    this.router.navigate(['/checkout'], {
      state: { courseIds: this.selectedCourseIds }
    });
  }

  proceedBundle(bundle: any) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(
        ['/login'],
        { queryParams: { redirect: '/pricing' } }
      );
      return;
    }

    this.router.navigate(['/checkout'], {
      state: { bundleId: bundle.id }
    });
  }
}
