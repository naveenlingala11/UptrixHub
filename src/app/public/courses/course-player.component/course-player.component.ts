import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Prism from 'prismjs';
import { FormsModule } from '@angular/forms';
import { MiniCodeEditorComponent } from '../mini-code-editor.component/mini-code-editor.component';

declare const require: any;
declare const monaco: any;

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule,FormsModule,MiniCodeEditorComponent],
  templateUrl: './course-player.component.html',
  styleUrl: './course-player.component.css'
})
export class CoursePlayerComponent implements OnInit {

  @Input() courseData: any;

  activeTab: 'notes' | 'tasks' | 'quizzes' | 'code' = 'notes';

  chapters: any[] = [];
  expandedChapterId: string | null = null;
  selectedSection: any = null;

  // editor
  showEditor = false;
  editorCode = '';
  editorLanguage = 'java';
  editorInstance: any;

  ngOnInit() {
    this.chapters = this.courseData?.chapters || [];

    if (this.chapters.length) {
      this.expandedChapterId = this.chapters[0].chapterId;
      this.selectedSection = this.chapters[0].sections[0];
    }
  }

  ngAfterViewChecked() {
    Prism.highlightAll();
  }

  toggleChapter(ch: any) {
    this.expandedChapterId =
      this.expandedChapterId === ch.chapterId ? null : ch.chapterId;
  }

  selectSection(_ch: any, sec: any) {
    this.selectedSection = sec;
    this.activeTab = 'notes';
  }

  openEditor(block: any) {
    this.editorCode = block.code.join('\n');
    this.editorLanguage = block.language || 'java';
    this.showEditor = true;

    setTimeout(() => this.initMonaco(), 0);
  }

  initMonaco() {
    if (this.editorInstance) {
      this.editorInstance.dispose();
    }

    require(['vs/editor/editor.main'], () => {
      this.editorInstance = monaco.editor.create(
        document.getElementById('monaco-editor'),
        {
          value: this.editorCode,
          language: this.editorLanguage,
          theme: 'vs-dark',
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: true }
        }
      );
    });
  }

  closeEditor() {
    this.showEditor = false;
    this.editorInstance?.dispose();
  }
}
