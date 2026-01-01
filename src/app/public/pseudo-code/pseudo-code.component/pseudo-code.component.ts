import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PseudoService } from '../pseudo.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-pseudo-code',
  templateUrl: './pseudo-code.component.html',
  styleUrls: ['./pseudo-code.component.css']
})

export class PseudoCodeComponent {

  skills: any[] = [];

  constructor(
    private pseudo: PseudoService,
    private router: Router
  ) { }

  ngOnInit() {
    this.pseudo.getSkills().subscribe(res => this.skills = res);
  }

  start(skill: string) {
    this.router.navigate(['/pseudo-code', skill, 'test']);
  }
}
