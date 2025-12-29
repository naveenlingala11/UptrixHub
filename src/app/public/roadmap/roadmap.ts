import { Component, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterLink],
  templateUrl: './roadmap.html',
  styleUrl: './roadmap.css',
})
export class Roadmap implements OnInit {

  activeRoadmap: 'java' | 'frontend' | 'devops' = 'java';

  /* 🔐 AUTH STATE (later from AuthService) */
  isLoggedIn = false;          // generic by default
  isProUser = false;

  /* 📊 USER PROGRESS (default = generic) */
  completedSteps: number[] = [];
  currentStep = 1;

  /* ================= JAVA FULL STACK ROADMAP ================= */
  javaRoadmap = [
    /* LEVEL 1 */
    { id: 1, title: 'Programming Basics', desc: 'Variables, loops, conditions', locked: false },
    { id: 2, title: 'Core Java', desc: 'Classes, Objects, Methods', locked: false },
    { id: 3, title: 'OOPS', desc: 'Encapsulation, Inheritance, Polymorphism', locked: false },
    { id: 4, title: 'JVM & Memory', desc: 'Heap, Stack, Garbage Collection', locked: false },
    { id: 5, title: 'Exception Handling', desc: 'Checked, Unchecked, Custom', locked: false },

    /* LEVEL 2 */
    { id: 6, title: 'Collections', desc: 'List, Set, Map, Streams', locked: false },
    { id: 7, title: 'Java 8+', desc: 'Lambdas, Streams, Optional', locked: false },
    { id: 8, title: 'Multithreading', desc: 'Threads, Executors, Concurrency', locked: false },
    { id: 9, title: 'JDBC', desc: 'Database connectivity & CRUD', locked: false },
    { id: 10, title: 'Servlets & JSP', desc: 'Web basics & MVC', locked: false },

    /* LEVEL 3 */
    { id: 11, title: 'Spring Core', desc: 'IOC, DI, Beans', locked: false },
    { id: 12, title: 'Spring MVC', desc: 'Controllers, REST APIs', locked: false },
    { id: 13, title: 'Spring Boot', desc: 'Auto-config, Profiles', locked: true },
    { id: 14, title: 'Spring Data JPA', desc: 'Hibernate, ORM, DB relations', locked: true },
    { id: 15, title: 'Spring Security', desc: 'JWT, OAuth2, Roles', locked: true },

    /* LEVEL 4 */
    { id: 16, title: 'Web Fundamentals', desc: 'HTML, CSS, Browser', locked: false },
    { id: 17, title: 'JavaScript & TS', desc: 'ES6+, Async, Promises', locked: false },
    { id: 18, title: 'Angular', desc: 'Components, RxJS, Routing', locked: true },
    { id: 19, title: 'API Integration', desc: 'Auth, Error handling', locked: true },
    { id: 20, title: 'Full Stack Projects', desc: 'End-to-end apps', locked: true },

    /* LEVEL 5 */
    { id: 21, title: 'Microservices', desc: 'Gateway, Config, Discovery', locked: true },
    { id: 22, title: 'Docker', desc: 'Containers & Images', locked: true },
    { id: 23, title: 'CI/CD', desc: 'GitHub Actions, Jenkins', locked: true },
    { id: 24, title: 'Cloud', desc: 'AWS / Azure basics', locked: true },
    { id: 25, title: 'System Design', desc: 'LLD, HLD, Interviews', locked: true },
  ];

  /* ================= INIT ================= */
  ngOnInit() {
    if (this.isLoggedIn) {
      this.loadUserProgress();
    }
  }

  /* ================= ACTIONS ================= */
  setRoadmap(type: 'java' | 'frontend' | 'devops') {
    this.activeRoadmap = type;
  }

  isCompleted(id: number) {
    return this.completedSteps.includes(id);
  }

  isCurrent(id: number) {
    return this.currentStep === id;
  }

  /* ================= MOCK BACKEND ================= */
  loadUserProgress() {
    // 🔥 Later call backend API
    this.isProUser = true;
    this.completedSteps = [1, 2, 3, 4, 5, 6, 7];
    this.currentStep = 8;
  }
}
