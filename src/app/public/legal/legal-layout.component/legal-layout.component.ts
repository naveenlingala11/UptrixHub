import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legal-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './legal-layout.component.html',
  styleUrl: './legal-layout.component.css'
})
export class LegalLayoutComponent {
  @Input() title = '';
}
