import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  courseId: string;
  title: string;
  price: number;
  priceType: 'FREE' | 'PRO';
}

@Injectable({ providedIn: 'root' })
export class CartService {

  private CART_KEY = 'ja_cart';

  /* 🔥 Cart count observable */
  private cartCountSubject = new BehaviorSubject<number>(this.getItems().length);
  cartCount$ = this.cartCountSubject.asObservable();

  /* ================= GET ITEMS ================= */
  getItems(): CartItem[] {
    return JSON.parse(localStorage.getItem(this.CART_KEY) || '[]');
  }

  /* ================= ADD ITEM ================= */
  addItem(item: CartItem) {
    const items = this.getItems();

    if (!items.find(i => i.courseId === item.courseId)) {
      items.push(item);
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));

      // 🔔 notify subscribers
      this.cartCountSubject.next(items.length);
    }
  }

  /* ================= REMOVE ITEM ================= */
  removeItem(courseId: string) {
    const items = this.getItems().filter(i => i.courseId !== courseId);
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));

    // 🔔 notify subscribers
    this.cartCountSubject.next(items.length);
  }

  /* ================= CLEAR CART ================= */
  clear() {
    localStorage.removeItem(this.CART_KEY);

    // 🔔 notify subscribers
    this.cartCountSubject.next(0);
  }

  /* ================= BACKEND SYNC (OPTIONAL) ================= */
  setCartFromBackend(items: CartItem[]) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    this.cartCountSubject.next(items.length);
  }
}
