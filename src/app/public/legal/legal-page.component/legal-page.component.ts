import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-legal-page.component',
  imports: [],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.css',
})
export class LegalPageComponent {
  @Input() title = '';

}
