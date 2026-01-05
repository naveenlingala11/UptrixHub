import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  cards = [
    {
      title: 'Users',
      desc: 'Manage platform users & preview accounts',
      icon: '👥',
      route: '/admin/users'
    },
    {
      title: 'Analytics',
      desc: 'Skills, difficulty & subscription insights',
      icon: '📊',
      route: '/admin/analytics'
    },
    {
      title: 'Achievements',
      desc: 'Configure achievements & rewards',
      icon: '🏆',
      route: '/admin/achievements'
    },
    {
      title: 'XP Rules',
      desc: 'Central XP brain for all games',
      icon: '🧠',
      route: '/admin/xp-rules'
    }
  ];

  ngOnInit() {}
}
