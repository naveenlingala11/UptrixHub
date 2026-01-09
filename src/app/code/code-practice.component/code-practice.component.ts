import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { CodeRunService } from '../code-run.service';

declare const monaco: any;

/* ================= DEBUG STATE ================= */
interface DebugState {
  line: number;
  source: string;
  locals: Record<string, string>;
  stack: string[];
  watches: Record<string, string>;
  finished: boolean;
}

/* ================= FILE MODEL ================= */
interface EditorFile {
  name: string;
  content: string;
  dirty: boolean;
}

@Component({
  selector: 'app-code-practice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-practice.component.html',
  styleUrl: './code-practice.component.css',
})
export class CodePracticeComponent implements AfterViewInit {

  /* ================= EDITOR ================= */
  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;
  @ViewChild('resizer') resizerRef!: ElementRef<HTMLDivElement>;
  @Input() initialFiles: EditorFile[] | null = null;
  @Input() readonlyMode = false;

  editor: any;

  /* ================= UI STATE ================= */
  darkMode = true;
  isRunning = false;
  debugSession = false;
  debugStarted = false;

  /* ================= EXECUTION ================= */
  compileSuccess: boolean | null = null;
  executeSuccess: boolean | null = null;
  executionTime = 0;
  logs: string[] = [];

  stdin = '';
  stdinSent = false;
  evalResult: string | null = null;
  watchDisabled = false;

  /* ================= DEBUG ================= */
  debugState?: DebugState;
  executionDecoration: string[] = [];

  /* ================= LANGUAGE ================= */
  language = 'java';
  javaVersion = '17';
  javaVersions = ['8', '11', '17', '21'];

  /* ================= FILES ================= */
  files: EditorFile[] = [
    {
      name: 'Main.java',
      content: `class Main {
  public static void main(String[] args) {
    System.out.println("Hello JavaArray 🚀");
  }
}`,
      dirty: false
    }
  ];

  activeFileIndex = 0;
  currentClass = 'Main';

  /* ================= BREAKPOINTS ================= */
  breakpoints = new Map<string, Set<number>>();
  breakpointDecorations: string[] = [];
  breakpointConditions = new Map<number, string>();

  constructor(private codeRun: CodeRunService) { }

  /* ================= INIT ================= */
  ngAfterViewInit() {
    this.loadMonaco().then(() => {

      // 🔥 If code comes from course player
      if (this.initialFiles && this.initialFiles.length) {
        this.files = JSON.parse(JSON.stringify(this.initialFiles));
      }

      this.createEditor();
      this.initResize();
      this.restoreFromLocal();

      if (this.readonlyMode) {
        this.editor.updateOptions({ readOnly: false }); // keep editable
      }

      document.body.classList.add('dark-theme');

      // 🔥 Track editor changes
      this.editor.onDidChangeModelContent(() => {
        const file = this.files[this.activeFileIndex];
        file.content = this.editor.getValue();
        file.dirty = true;
        this.updateClassName();
        this.saveToLocal();
      });

      // 🔴 Breakpoints
      this.editor.onMouseDown((e: any) => {
        if (!e.target || !e.target.position) return;

        const line = e.target.position.lineNumber;

        const isBreakpointClick =
          e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
          e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS;

        if (!isBreakpointClick) return;

        // Right click → conditional breakpoint
        if (e.event.rightButton) {
          const cond = prompt('Enter breakpoint condition (e.g. i > 5)');
          if (cond) this.addConditionalBreakpoint(line, cond);
        } else {
          this.toggleBreakpoint(line);
        }
      });

    });

  }

  /* ================= MONACO ================= */
  loadMonaco(): Promise<void> {
    return new Promise(resolve => {
      if ((window as any).monaco) return resolve();
      (window as any).require.config({ paths: { vs: '/assets/monaco/vs' } });
      (window as any).require(['vs/editor/editor.main'], () => resolve());
    });
  }

  createEditor() {
    this.editor = monaco.editor.create(this.editorRef.nativeElement, {
      value: this.files[0].content,
      language: 'java',
      theme: this.darkMode ? 'vs-dark' : 'vs',

      fontSize: 15,
      glyphMargin: true,          // REQUIRED
      lineNumbers: 'on',
      lineNumbersMinChars: 4,

      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true
    });

    // 🔥 FORCE layout refresh (critical)
    setTimeout(() => {
      this.editor.layout();
    }, 0);
  }

  /* ================= THEME ================= */
  toggleTheme() {
    this.darkMode = !this.darkMode;

    document.body.classList.toggle('dark-theme', this.darkMode);
    document.body.classList.toggle('light-theme', !this.darkMode);

    monaco.editor.setTheme(this.darkMode ? 'vs-dark' : 'vs');
  }

  /* ================= FILE TABS ================= */
  switchFile(i: number) {
    // save current file
    this.files[this.activeFileIndex].content = this.editor.getValue();

    // clear editor decorations before switch
    this.breakpointDecorations = this.editor.deltaDecorations(
      this.breakpointDecorations,
      []
    );
    this.executionDecoration = this.editor.deltaDecorations(
      this.executionDecoration,
      []
    );

    // switch file
    this.activeFileIndex = i;
    this.editor.setValue(this.files[i].content);

    // update class name
    this.updateClassName();

    // 🔥 RE-APPLY breakpoints for this file
    this.renderBreakpoints();
  }

  addFile() {
    const name = prompt('Enter file name', 'NewClass.java');
    if (!name) return;

    this.files.push({
      name,
      content: `public class ${name.replace('.java', '')} {\n}`,
      dirty: false
    });

    this.switchFile(this.files.length - 1);
  }

  closeTab(index: number, event: MouseEvent) {
    event.stopPropagation();

    const file = this.files[index];
    if (file.dirty) {
      const ok = confirm(`"${file.name}" has unsaved changes. Close anyway?`);
      if (!ok) return;
    }

    if (this.files.length === 1) return;

    this.files.splice(index, 1);

    if (this.activeFileIndex >= this.files.length) {
      this.activeFileIndex = this.files.length - 1;
    }

    this.switchFile(this.activeFileIndex);
  }

  updateClassName() {
    const match = this.editor.getValue().match(/class\s+(\w+)/);
    if (match) this.currentClass = match[1];
  }

  /* ================= BREAKPOINTS ================= */
  toggleBreakpoint(line: number) {

    if (!this.debugStarted) {
      this.startDebugSession();
    }

    this.codeRun.addBreakpoint(this.currentClass, line)
      .subscribe({
        next: () => {
          const file = this.files[this.activeFileIndex].name;

          if (!this.breakpoints.has(file)) {
            this.breakpoints.set(file, new Set<number>());
          }

          this.breakpoints.get(file)!.add(line);
          this.renderBreakpoints();

          console.log(`🔴 Breakpoint added at ${this.currentClass}:${line}`);
        },
        error: () => {
          console.error('❌ Breakpoint add failed');
        }
      });

    // 🔴 UPDATE LOCAL STATE
    const file = this.files[this.activeFileIndex].name;

    if (!this.breakpoints.has(file)) {
      this.breakpoints.set(file, new Set<number>());
    }

    this.breakpoints.get(file)!.add(line);

    // 🔥 FORCE MONACO TO DRAW RED DOT
    this.renderBreakpoints();

    console.log(`🔴 Breakpoint added at ${this.currentClass}:${line}`);
  }

  addConditionalBreakpoint(line: number, condition: string) {

    if (!this.debugStarted) {
      this.startDebugSession();
    }

    this.codeRun
      .addConditionalBreakpoint(this.currentClass, line, condition)
      .subscribe({
        next: () => {
          const file = this.files[this.activeFileIndex].name;

          if (!this.breakpoints.has(file)) {
            this.breakpoints.set(file, new Set<number>());
          }

          this.breakpoints.get(file)!.add(line);
          this.breakpointConditions.set(line, condition);
          this.renderBreakpoints();

          console.log(`🟡 Conditional breakpoint added at ${line}`);
        },
        error: () => {
          console.error('❌ Conditional breakpoint failed');
        }
      });
    // 🔴 UPDATE LOCAL STATE

    const file = this.files[this.activeFileIndex].name;

    if (!this.breakpoints.has(file)) {
      this.breakpoints.set(file, new Set());
    }

    this.breakpoints.get(file)!.add(line);
    this.breakpointConditions.set(line, condition);

    this.renderBreakpoints();

    console.log(`🟡 Conditional breakpoint added at ${line}`);
  }

  renderBreakpoints() {
    const file = this.files[this.activeFileIndex].name;
    const set = this.breakpoints.get(file) || new Set<number>();

    this.breakpointDecorations = this.editor.deltaDecorations(
      this.breakpointDecorations,
      Array.from(set).map(line => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          glyphMarginClassName: 'breakpoint-glyph'
        }
      }))
    );
  }

  /* ================= EXECUTION LINE ================= */
  highlightExecutionLine(line: number) {
    this.executionDecoration = this.editor.deltaDecorations(
      this.executionDecoration,
      [{
        range: new monaco.Range(line, 1, line, 1),
        options: { isWholeLine: true, className: 'exec-line' }
      }]
    );
  }

  /* ================= RUN ================= */
  run(debug: boolean) {
    this.isRunning = true;
    this.logs = [];
    this.compileSuccess = null;
    this.executeSuccess = null;

    const start = performance.now();
    this.logs.push('⏳ Compiling...');
    this.logs.push(debug ? '🐞 Debug mode enabled' : '▶ Running program');

    this.codeRun.runJava({
      code: this.files.map(f => f.content).join('\n\n'),
      input: this.stdin,
      javaVersion: this.javaVersion
    }).subscribe({
      next: res => {
        if (res.error) {
          this.compileSuccess = false;
          this.executeSuccess = false;
          this.logs.push('❌ ' + res.error);
        } else {
          this.compileSuccess = true;
          this.executeSuccess = true;
          this.logs.push('✅ Output:');
          this.logs.push(res.output || '⚠ No output');
        }
        this.executionTime = Math.round(performance.now() - start);
      },
      error: () => {
        this.logs.push('❌ Server error');
      },
      complete: () => {
        this.isRunning = false;
      }
    });

    this.files.forEach(f => f.dirty = false);
  }

  /* ================= DEBUG ================= */
  async startDebugSession() {
    this.codeRun.startDebug(this.currentClass).subscribe({
      next: () => {
        this.debugStarted = true;
        this.debugSession = true;
        console.log('✅ Debug session started');
      },
      error: err => {
        console.error('❌ Debug start failed', err);
      }
    });
  }

  step() {
    this.codeRun.stepDebug().subscribe(state => {
      if (!state) return;

      this.debugTimeline.push(state);
      this.timelineIndex = this.debugTimeline.length - 1;

      this.debugState = state;
      this.highlightExecutionLine(state.line);
    });
  }

  stop() {
    this.codeRun.stopDebug().subscribe();

    this.debugStarted = false;
    this.debugSession = false;
    this.debugState = undefined;

    this.executionDecoration = this.editor.deltaDecorations(
      this.executionDecoration,
      []
    );

    console.log('⛔ Debug session stopped');
  }

  /* ================= DEBUG TIMELINE ================= */
  debugTimeline: DebugState[] = [];
  timelineIndex = -1;

  /* ================= WATCH / EVAL ================= */
  addWatch(value: string) {
    if (!value.trim()) return;
    fetch(`${environment.apiUrl}/debug/watch?expr=${value}`, { method: 'POST' });
  }

  evaluateExpression(expr: string) {
    fetch(`${environment.apiUrl}/debug/eval?expr=${encodeURIComponent(expr)}`, { method: 'POST' })
      .then(res => res.text())
      .then(res => this.evalResult = res)
      .catch(() => this.evalResult = '❌ Debugger not active');
  }

  /* ================= STORAGE ================= */
  saveToLocal() {
    localStorage.setItem('javaarray-files', JSON.stringify(this.files));
  }

  restoreFromLocal() {
    const data = localStorage.getItem('javaarray-files');
    if (data) {
      this.files = JSON.parse(data);
      this.switchFile(0);
    }
  }

  shareCode() {
    const encoded = btoa(this.editor.getValue());
    navigator.clipboard.writeText(`${location.origin}/share?code=${encoded}`);
    alert('🔗 Share link copied');
  }

  /* ================= RESIZER ================= */
  initResize() {
    const resizer = this.resizerRef.nativeElement;
    let startX = 0;
    let startWidth = 0;

    resizer.onmousedown = (e: MouseEvent) => {
      startX = e.clientX;
      startWidth = resizer.previousElementSibling!.clientWidth;

      document.onmousemove = ev => {
        const dx = ev.clientX - startX;
        (resizer.previousElementSibling as HTMLElement).style.width =
          `${startWidth + dx}px`;
      };

      document.onmouseup = () => {
        document.onmousemove = null;
      };
    };
  }

  /* ================= SHORTCUTS ================= */
  @HostListener('window:keydown', ['$event'])
  handleKeys(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'Enter') this.run(false);
    if (e.ctrlKey && e.shiftKey && e.key === 'Enter') this.run(true);
    if (e.ctrlKey && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      this.closeTab(this.activeFileIndex, e as any);
    }
  }

  /* ================= PROGRAM INPUT ================= */
  submitInput() {
    if (!this.stdin.trim()) return;
    this.stdinSent = true;
  }

  /* ================= TAB DRAG & DROP ================= */
  dragIndex: number | null = null;

  onDragStart(index: number) {
    this.dragIndex = index;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // 🔥 required to allow drop
  }

  onDrop(targetIndex: number) {
    if (this.dragIndex === null || this.dragIndex === targetIndex) return;

    const dragged = this.files[this.dragIndex];
    this.files.splice(this.dragIndex, 1);
    this.files.splice(targetIndex, 0, dragged);

    this.activeFileIndex = targetIndex;
    this.dragIndex = null;
  }

  /* ================= TAB PREVIEW ================= */
  previewFile: EditorFile | null = null;
  previewContent = '';
  previewX = 0;
  previewY = 0;

  showPreview(index: number, e: MouseEvent) {
    const file = this.files[index];
    this.previewFile = file;
    this.previewContent = file.content
      .split('\n')
      .slice(0, 10)
      .join('\n');

    this.previewX = e.clientX + 12;
    this.previewY = e.clientY + 12;
  }

  hidePreview() {
    this.previewFile = null;
  }

  /* ================= PROJECT TREE ================= */
  projectTreeOpen = true;

  toggleProjectTree() {
    this.projectTreeOpen = !this.projectTreeOpen;
  }

  goHome() {
    window.location.href = '/';
  }

}
