import { Component, OnInit } from '@angular/core';
import { LegalMetaService } from '../services/legal-meta.service';
import { PdfExportService } from '../shared/pdf-export.service';

@Component({
  standalone: true,
  templateUrl: './security.component.html'
})
export class SecurityComponent implements OnInit {

  constructor(private meta: LegalMetaService, private pdf: PdfExportService) {}

  ngOnInit() {
    this.meta.set(
      'Security Policy',
      'Security practices of Uptrix Hub for protecting user data'
    );
  }

  download() {
    this.pdf.export('security-doc', 'Uptrix-Hub-Security-Policy.pdf');
  }
}
