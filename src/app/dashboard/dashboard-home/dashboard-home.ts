import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHome {

  stats = [
    { label: 'Courses Started', value: 5, icon: 'fa-book' },
    { label: 'Completed Topics', value: 42, icon: 'fa-check-circle' },
    { label: 'Practice Problems', value: 120, icon: 'fa-code' },
    { label: 'Current Streak', value: '7 Days', icon: 'fa-fire' }
  ];

  learningProgress = [
    { topic: 'Core Java', progress: 80 },
    { topic: 'Advanced Java', progress: 45 },
    { topic: 'Spring Boot', progress: 30 },
    { topic: 'Microservices', progress: 10 }
  ];

  favoriteTopics = [
    'Streams API',
    'Spring Security',
    'JPA & Hibernate',
    'REST APIs'
  ];

  timeline = [
    { time: 'Today', text: 'Completed Java Streams Practice' },
    { time: 'Yesterday', text: 'Started Spring Boot Roadmap' },
    { time: '2 days ago', text: 'Added JPA topic to favorites' }
  ];
}
