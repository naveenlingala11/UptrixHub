import { Component, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

declare const monaco: any;

@Component({
  selector: 'app-mini-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mini-code-editor.component.html',
  styleUrls: ['./mini-code-editor.component.css']
})
export class MiniCodeEditorComponent implements AfterViewInit {

  @Input() code = '';
  @Input() language = 'java';

  editor: any;

  /* UI */
  darkMode = true;
  showLogs = false;
  isRunning = false;

  /* Execution */
  logs: string[] = [];
  executionTime = 0;

  ngAfterViewInit() {
    monaco.editor.create(document.getElementById('mini-editor'), {
      value: this.code,
      language: this.language,
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false }
    });

    this.editor = monaco.editor.getModels()[0];
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    monaco.editor.setTheme(this.darkMode ? 'vs-dark' : 'vs');
  }

  run() {
    this.isRunning = true;
    this.logs = ['⏳ Running...'];

    const start = performance.now();

    fetch(`${environment.apiUrl}/code/java`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: this.editor.getValue(),
        javaVersion: '17'
      })
    })
      .then(res => res.json())
      .then(res => {
        this.logs = [];
        if (res.error) {
          this.logs.push('❌ ' + res.error);
        } else {
          this.logs.push('✅ Output:');
          this.logs.push(res.output || '⚠ No output');
        }
        this.executionTime = Math.round(performance.now() - start);
      })
      .finally(() => this.isRunning = false);
  }
}
