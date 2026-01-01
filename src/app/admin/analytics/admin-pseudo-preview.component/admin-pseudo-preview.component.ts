import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PseudoService } from '../../../public/pseudo-code/pseudo.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-admin-pseudo-preview',
  templateUrl: './admin-pseudo-preview.component.html',
  styleUrls: ['./admin-pseudo-preview.component.css']
})
export class AdminPseudoPreviewComponent implements OnInit {

  skill!: string;
  questions: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private pseudo: PseudoService
  ) { }

  ngOnInit() {
    this.skill = this.route.snapshot.paramMap.get('skill')!;
    this.load();
  }

  load() {
    this.pseudo.adminPreview(this.skill)
      .subscribe({
        next: res => {
          this.questions = res;
          this.loading = false;
        },
        error: err => {
          console.error('Admin preview failed', err);
          this.loading = false;   // 🔥 IMPORTANT
        }
      });
  }

}
