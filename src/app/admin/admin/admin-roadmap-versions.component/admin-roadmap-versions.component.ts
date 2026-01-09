import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoadmapService } from '../../services/admin-roadmap.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-roadmap-versions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roadmap-versions.component.html',
  styleUrl: './admin-roadmap-versions.component.css'
})
export class AdminRoadmapVersionsComponent implements OnInit {

@Input() courseId!: string;   // ✅ STRING

  versions: any[] = [];
  selectedA: any;
  selectedB: any;

  constructor(private service: AdminRoadmapService) { }

  ngOnInit() {
    this.service.versions(this.courseId)
      .subscribe(v => this.versions = v);
  }

  parse(json: string) {
    return JSON.parse(json);
  }

  diffTopics(a: string[], b: string[]) {
    return {
      added: b.filter(x => !a.includes(x)),
      removed: a.filter(x => !b.includes(x))
    };
  }

  getDiff(level: any) {
    if (!this.selectedA || !this.selectedB) return null;

    const a = JSON.parse(this.selectedA.roadmapJson)
      .levels.find((x: any) => x.level === level.level)?.topics || [];

    const b = JSON.parse(this.selectedB.roadmapJson)
      .levels.find((x: any) => x.level === level.level)?.topics || [];

    return {
      added: b.filter((x: string) => !a.includes(x)),
      removed: a.filter((x: string) => !b.includes(x))
    };
  }

}
