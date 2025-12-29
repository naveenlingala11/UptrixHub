import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [CommonModule],
  standalone: true,
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent implements OnInit {

  invoice: any;

  ngOnInit() {
    const state = history.state;

    this.invoice = {
      name: 'Customer',
      email: '',
      items: state.items || [],
      itemPrice: 199,
      amount: state.amount,
      invoiceId: 'INV-' + Date.now()
    };
  }

  downloadInvoice() {
    const content = `
Invoice ID: ${this.invoice.invoiceId}
Name: ${this.invoice.name}
Email: ${this.invoice.email}
Items: ${this.invoice.items.join(', ')}
Total: ₹${this.invoice.amount}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.invoice.invoiceId}.txt`;
    a.click();
  }
}
