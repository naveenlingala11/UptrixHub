import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  async export(elementId: string, fileName: string) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('PDF Export failed: element not found');
      return;
    }

    // 👇 dynamic import (NO typing issues)
    const html2pdf = (await import('html2pdf.js')).default;

    html2pdf()
      .set({
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(element)
      .save();
  }
}
