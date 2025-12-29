import { Component, OnInit } from '@angular/core';
import { LegalMetaService } from '../services/legal-meta.service';
import { PdfExportService } from '../shared/pdf-export.service';


@Component({
  standalone: true,
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent implements OnInit {

  constructor(private meta: LegalMetaService, private pdf: PdfExportService) {}

  ngOnInit() {
    this.meta.set(
      'Privacy Policy',
      'Privacy Policy of Uptrix Hub compliant with DPDP Act 2023 and Indian IT laws'
    );
  }

  download() {
    this.pdf.export('privacy-doc', 'Uptrix-Hub-Privacy-Policy.pdf');
  }
}
