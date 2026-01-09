import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CodeRunService {

  constructor(private http: HttpClient) {}

  /* ================= RUN JAVA ================= */
  runJava(payload: {
    code: string;
    input?: string;
    javaVersion: string;
  }) {
    return this.http.post<any>(
      `${environment.apiUrl}/code/java`,
      payload
    );
  }

  /* ================= DEBUG ================= */
  startDebug(mainClass: string) {
    return this.http.post(
      `${environment.apiUrl}/debug/start`,
      null,
      {
        params: {
          mainClass,
          classPath: '.'
        }
      }
    );
  }

  stepDebug() {
    return this.http.post<any>(
      `${environment.apiUrl}/debug/step`,
      null
    );
  }

  stopDebug() {
    return this.http.post(
      `${environment.apiUrl}/debug/stop`,
      null
    );
  }

  addBreakpoint(className: string, line: number) {
    return this.http.post(
      `${environment.apiUrl}/debug/breakpoint/add`,
      null,
      {
        params: { className, line }
      }
    );
  }

  addConditionalBreakpoint(
    className: string,
    line: number,
    condition: string
  ) {
    return this.http.post(
      `${environment.apiUrl}/debug/breakpoint/conditional`,
      null,
      {
        params: {
          className,
          line,
          condition
        }
      }
    );
  }

  addWatch(expr: string) {
    return this.http.post(
      `${environment.apiUrl}/debug/watch`,
      null,
      { params: { expr } }
    );
  }

  evalExpression(expr: string) {
    return this.http.post(
      `${environment.apiUrl}/debug/eval`,
      null,
      { params: { expr } }
    );
  }
}
