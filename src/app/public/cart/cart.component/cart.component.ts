import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartItem, CartService } from '../cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  items: CartItem[] = [];

  constructor(
    private cart: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.items = this.cart.getItems();
  }

  remove(courseId: string) {
    this.cart.removeItem(courseId);
    this.items = this.cart.getItems();
  }

  get subtotal() {
    return this.items.reduce((sum, i) => sum + i.price, 0);
  }

  get gst() {
    return Math.round(this.subtotal * 0.18);
  }

  get total() {
    return this.subtotal + this.gst;
  }

  checkout() {
    this.router.navigate(['/checkout'], {
      state: {
        courseIds: this.items.map(i => i.courseId)
      }
    });
  }
}
