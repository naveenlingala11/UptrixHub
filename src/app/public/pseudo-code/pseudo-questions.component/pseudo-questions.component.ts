import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PseudoService } from '../pseudo.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-pseudo-questions',
  templateUrl: './pseudo-questions.component.html',
  styleUrls: ['./pseudo-questions.component.css']
})
export class PseudoQuestionsComponent implements OnInit {

  skill!: string;
  questionsCount = 0;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pseudo: PseudoService
  ) {}

  ngOnInit() {
    this.skill = this.route.snapshot.paramMap.get('skill')!;
    this.loadPreview();
  }

  loadPreview() {
    // just fetch 1 page to get total count
    this.pseudo.getQuestions(this.skill)
      .subscribe(res => {
        this.questionsCount = res.totalElements;
        this.loading = false;
      });
  }

  startTest() {
    this.router.navigate(['/pseudo-code', this.skill, 'test']);
  }
}
