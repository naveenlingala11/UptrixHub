import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BugHunterAdminQuestion,
  BugHunterAdminService
} from '../../services/bug-hunter-admin.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bug-hunter.component.html',
  styleUrls: ['./admin-bug-hunter.component.css']
})
export class AdminBugHunterComponent implements OnInit {

  /** ================= DATA ================= */
  questions: BugHunterAdminQuestion[] = [];
  editing: BugHunterAdminQuestion | null = null;

  /** ================= FILTERS (UI ONLY) ================= */
  filterDifficulty: '' | 'EASY' | 'MEDIUM' | 'HARD' = '';
  filterLanguage: '' | 'JAVA' | 'SPRING' = '';
  filterActive: '' | 'true' | 'false' = '';

  constructor(private api: BugHunterAdminService) { }

  ngOnInit() {
    this.load();
  }

  /** ================= LOAD ================= */
  load() {
    this.api.getAll().subscribe(res => {
      this.questions = res;
    });
  }

  /** ================= EDIT ================= */
  edit(q: BugHunterAdminQuestion) {
    // clone to avoid table mutation
    this.editing = { ...q };
  }

  /** ================= SAVE ================= */
  save() {
    if (!this.editing) return;

    if (this.editing.id) {
      this.api
        .update(this.editing.id, this.editing)
        .subscribe(() => this.load());
    } else {
      this.api
        .save(this.editing)
        .subscribe(() => this.load());
    }

    this.editing = null;
  }

  /** ================= TOGGLE ACTIVE ================= */
  toggle(q: BugHunterAdminQuestion) {
    if (!q.id) return;

    this.api.toggle(q.id)
      .subscribe(() => this.load());
  }

  /** ================= FILTERED VIEW ================= */
  get filteredQuestions(): BugHunterAdminQuestion[] {
    return this.questions.filter(q => {

      if (this.filterDifficulty && q.difficulty !== this.filterDifficulty) {
        return false;
      }

      if (this.filterLanguage && q.language !== this.filterLanguage) {
        return false;
      }

      if (this.filterActive) {
        const active = this.filterActive === 'true';
        if (q.active !== active) return false;
      }

      return true;
    });
  }

  publish(q: BugHunterAdminQuestion) {
    if (!q.id) return;
    this.api.publish(q.id).subscribe(() => this.load());
  }

}
