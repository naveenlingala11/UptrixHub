import { Component, OnInit } from '@angular/core';
import { LegalMetaService } from '../services/legal-meta.service';
import { PdfExportService } from '../shared/pdf-export.service';

@Component({
  standalone: true,
  templateUrl: './refund.component.html'
})
export class RefundComponent implements OnInit {

  constructor(
    private meta: LegalMetaService,
    private pdf: PdfExportService
  ) {}

  ngOnInit() {
    this.meta.set(
      'Refund Policy',
      'Refund Policy of Uptrix Hub under Consumer Protection Act, India'
    );
  }

  download() {
    this.pdf.export('refund-doc', 'Uptrix-Hub-Refund-Policy.pdf');
  }
}
