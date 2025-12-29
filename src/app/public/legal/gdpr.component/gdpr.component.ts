import { Component, OnInit } from '@angular/core';
import { LegalMetaService } from '../services/legal-meta.service';
import { PdfExportService } from '../shared/pdf-export.service';

@Component({
  standalone: true,
  templateUrl: './gdpr.component.html'
})
export class GdprComponent implements OnInit {

  constructor(
    private meta: LegalMetaService,
    private pdf: PdfExportService
  ) {}

  ngOnInit() {
    this.meta.set(
      'GDPR & Data Protection',
      'GDPR and DPDP Act compliance policy of Uptrix Hub'
    );
  }

  download() {
    this.pdf.export('gdpr-doc', 'Uptrix-Hub-Data-Protection.pdf');
  }
}
