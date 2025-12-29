import { Component, OnInit } from '@angular/core';
import { LegalMetaService } from '../services/legal-meta.service';
import { PdfExportService } from '../shared/pdf-export.service';


@Component({
  standalone: true,
  templateUrl: './terms.component.html'
})
export class TermsComponent implements OnInit {

  constructor(private meta: LegalMetaService, private pdf: PdfExportService) {}

  ngOnInit() {
    this.meta.set(
      'Terms & Conditions',
      'Terms and Conditions of Uptrix Hub governed by Indian Contract Act'
    );
  }

  download() {
    this.pdf.export('terms-doc', 'Uptrix-Hub-Terms-Conditions.pdf');
  }
}
