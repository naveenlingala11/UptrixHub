import { Component, OnInit } from '@angular/core';
import { LegalMetaService } from '../services/legal-meta.service';
import { PdfExportService } from '../shared/pdf-export.service';


@Component({
  standalone: true,
  templateUrl: './cookies.component.html'
})
export class CookiesComponent implements OnInit {

  constructor(
    private meta: LegalMetaService,
    private pdf: PdfExportService
  ) {}

  ngOnInit() {
    this.meta.set(
      'Cookie Policy',
      'Cookie Policy of Uptrix Hub compliant with DPDP Act 2023'
    );
  }

  download() {
    this.pdf.export('cookies-doc', 'Uptrix-Hub-Cookie-Policy.pdf');
  }
}
