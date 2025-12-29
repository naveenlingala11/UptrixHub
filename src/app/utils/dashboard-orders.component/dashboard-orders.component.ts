import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-orders.component.html',
  styleUrl: './dashboard-orders.component.css'
})
export class DashboardOrdersComponent implements OnInit {

  orders: any[] = [];

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.api.get<any[]>('/orders/my')
      .subscribe(res => this.orders = res);
  }

  viewInvoice(id: number) {
    this.router.navigate(['/invoice', id]);
  }
}
