import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { ApiService } from '../../core/services/api.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

type BillingTab = 'recent' | 'previous' | 'pending';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent implements OnInit {

  private readonly baseUrl = environment.apiUrl;

  invoice: any;
  invoiceUrl = '';
  previewUrl: any;

  bills: any[] = [];          // PAID invoices
  pendingBills: any[] = [];   // PENDING orders
  filteredBills: any[] = [];

  searchText = '';
  activeTab: BillingTab = 'recent';

  tabs: { key: BillingTab; label: string }[] = [
    { key: 'recent', label: 'Recent' },
    { key: 'previous', label: 'Previous' },
    { key: 'pending', label: 'Pending' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthStateService,
    private sanitizer: DomSanitizer,

  ) { }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.router.navigate(['/dashboard/home']);
      return;
    }

    /* ================= CURRENT INVOICE ================= */
    this.api.get<any>(`/invoices/order/${orderId}`).subscribe({
      next: res => {
        this.invoice = res;
        this.invoiceUrl = `${window.location.origin}/invoice/${orderId}`;
      },
      error: () => {
        this.router.navigate(['/dashboard/home']);
      }
    });

    /* ================= PAID INVOICES ================= */
    this.api.get<any[]>('/invoices/my').subscribe({
      next: res => {
        this.bills = res ?? [];
        this.applyFilter();
      },
      error: () => {
        this.bills = [];
      }
    });

    /* ================= PENDING ORDERS ================= */
    this.api.get<any[]>('/orders/pending').subscribe({
      next: res => {
        this.pendingBills = res ?? [];
      },
      error: () => {
        this.pendingBills = [];
      }
    });
  }

  /* ================= TAB CHANGE ================= */
  changeTab(tab: BillingTab) {
    this.activeTab = tab;
    this.applyFilter();
  }

  /* ================= FILTER LOGIC ================= */
  applyFilter() {
    let data =
      this.activeTab === 'pending'
        ? [...this.pendingBills]
        : [...this.bills];

    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      data = data.filter(b =>
        b.id?.toString().includes(q) ||
        b.total?.toString().includes(q)
      );
    }

    data.sort(
      (a, b) =>
        +new Date(b.generatedAt || b.createdAt) -
        +new Date(a.generatedAt || a.createdAt)
    );

    if (this.activeTab === 'recent') {
      this.filteredBills = data.slice(0, 5);
    } else if (this.activeTab === 'previous') {
      this.filteredBills = data.slice(5);
    } else {
      this.filteredBills = data;
    }
  }

  /* ================= NAVIGATION ================= */
  openInvoice(orderId: number) {
    this.router.navigate(['/invoice', orderId]);
  }

  /* ================= DOWNLOAD PDF ================= */
  downloadPdf() {
    if (!this.invoice) return;

    this.api.getBlob(`/invoices/pdf/${this.invoice.orderId}`)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.invoice.invoiceNumber}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          alert('Failed to download invoice');
        }
      });
  }

  previewPdf() {
    if (!this.invoice?.orderId) return;

    this.api.getBlob(`/invoices/pdf/${this.invoice.orderId}`)
      .subscribe({
        next: blob => {
          if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl as string);
          }

          const url = URL.createObjectURL(blob);
          this.previewUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(url);
        },
        error: () => alert('Preview failed')
      });
  }

  closePreview() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl as string);
    }
    this.previewUrl = null;
  }

  /* ================= RESEND INVOICE EMAIL ================= */
  resendInvoice() {
    if (!this.invoice?.id) {
      alert('Invoice not loaded');
      return;
    }

    this.api.post(`/invoices/email/${this.invoice.id}`, {})
      .subscribe({
        next: () => {
          alert('Invoice email sent successfully');
        },
        error: () => {
          alert('Failed to resend invoice email');
        }
      });
  }

  /* ================= DOWNLOAD ALL INVOICES ================= */
  downloadAll() {
    this.api.getBlob('/invoices/pdf/all')
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'invoices.zip';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          alert('Failed to download invoices');
        }
      });
  }

  goDashboard() {
    this.router.navigate(['/dashboard/home']);
  }
}
