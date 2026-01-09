import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Ajv from 'ajv';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { AdminRoadmapService } from '../../services/admin-roadmap.service';
import { ROADMAP_SCHEMA } from '../../../public/roadmap/roadmap.schema';
import { CourseApiService } from '../../../public/services/course-api.service';

interface RoadmapLevel {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface RoadmapPayload {
  roadmapId?: number;
  courseId: string;     // ✅ STRING
  courseTitle: string;
  version?: number;
  published?: boolean;
  levels: RoadmapLevel[];
}

@Component({
  selector: 'app-admin-roadmap',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './admin-roadmap.component.html',
  styleUrl: './admin-roadmap.component.css'
})
export class AdminRoadmapComponent {

  courses: Course[] = [];
  selectedCourseId = '';
  roadmapJson = '';
  roadmap: RoadmapPayload | null = null;

  selectedFile!: File;

  message = '';
  errorDetails = '';

  uploadSuccess = false;
  uploadError = '';

  private ajv = new Ajv({ allErrors: true, strict: false });
  private validate = this.ajv.compile(ROADMAP_SCHEMA);

  constructor(private roadmapService: AdminRoadmapService,
    private courseApi: CourseApiService) { }

  ngOnInit() {
    // 🔥 Load courses for dropdown
    this.courseApi.getAllCourses().subscribe({
      next: c => this.courses = c,
      error: () => this.message = '❌ Failed to load courses'
    });
  }

  /* ================= JSON UPLOAD ================= */

  upload() {
    this.resetMessages();

    this.uploadSuccess = false;
    this.uploadError = '';

    let payload: RoadmapPayload;

    try {
      payload = JSON.parse(this.roadmapJson);
    } catch {
      this.uploadError = '❌ Invalid JSON syntax';
      return;
    }

    if (!this.validate(payload)) {
      this.uploadError = '❌ JSON does not match roadmap schema';
      this.errorDetails =
        this.validate.errors
          ?.map(e => `• ${e.instancePath || 'root'} ${e.message}`)
          .join('\n') || '';
      return;
    }

    this.roadmapService.uploadRoadmap(payload).subscribe({
      next: () => {
        this.uploadSuccess = true;
        this.roadmapJson = '';

        // auto hide after 3 sec
        setTimeout(() => (this.uploadSuccess = false), 3000);
      },
      error: () => {
        this.uploadError = '❌ Upload failed. Please try again.';
      }
    });
  }
  
  private resetMessages() {
    this.message = '';
    this.errorDetails = '';
    this.uploadSuccess = false;
    this.uploadError = '';
  }

  /* ================= EXCEL UPLOAD ================= */

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  uploadExcel() {
    this.resetMessages();

    if (!this.selectedFile) {
      this.message = '❌ Please select an Excel file';
      return;
    }

    this.roadmapService.uploadExcel(this.selectedFile).subscribe({
      next: () => this.message = '✅ Excel roadmap uploaded as DRAFT',
      error: () => this.message = '❌ Excel upload failed'
    });
  }

  /* ================= PREVIEW ================= */

  preview() {
    if (!this.selectedCourseId) {
      this.message = '❌ Please select a course';
      return;
    }

    this.message = '';

    this.roadmapService.preview(this.selectedCourseId).subscribe({
      next: r => this.roadmap = r,
      error: err => {
        this.roadmap = null;
        this.message =
          err.status === 404
            ? '⚠️ No draft roadmap found'
            : '❌ Preview failed';
      }
    });
  }

  /* ================= DRAG & DROP ================= */

  drop(level: RoadmapLevel, event: CdkDragDrop<string[]>) {
    moveItemInArray(level.topics, event.previousIndex, event.currentIndex);
  }

  /* ================= SAVE ORDER ================= */

  saveOrder() {
    if (!this.roadmap?.roadmapId) return;

    const payload = {
      courseId: this.roadmap.courseId,
      courseTitle: this.roadmap.courseTitle,
      levels: this.roadmap.levels
    };

    this.roadmapService
      .saveReorder(this.roadmap.roadmapId, payload)
      .subscribe(() => this.message = '💾 Order saved');
  }

  /* ================= PUBLISH ================= */

  publish() {
    if (!this.roadmap?.roadmapId) return;

    this.roadmapService.publish(this.roadmap.roadmapId).subscribe({
      next: () => this.message = '🚀 Roadmap published successfully',
      error: () => this.message = '❌ Publish failed'
    });
  }

}
