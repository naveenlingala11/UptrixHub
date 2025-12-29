import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ])
  ]
})
export class ProfileComponent implements OnInit {

  /* ===== STATE ===== */
  loading = true;
  saving = false;
  addingSkill = false;
  uploadingAvatar = false;

  success = '';
  error = '';

  profile: any = null;
  completion = 0;

  /* ===== HEATMAP ===== */
  heatmap: Record<string, number> = {};

  /* ===== FORMS ===== */
  profileForm!: FormGroup;
  skillForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {

    /* PROFILE FORM (UNCHANGED) */
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      mobile: ['', Validators.required],
      bio: ['']
    });

    /* SKILL FORM (UNCHANGED) */
    this.skillForm = this.fb.group({
      name: ['', Validators.required],
      proficiency: [50, [Validators.min(1), Validators.max(100)]]
    });

    this.loadProfile();
    this.loadHeatmap();
  }

  /* ===== LOAD PROFILE ===== */
  loadProfile() {
    this.loading = true;

    this.profileService.getProfile().subscribe({
      next: res => {
        this.profile = res;

        this.profileForm.patchValue({
          name: res.name,
          email: res.email,
          mobile: res.mobile,
          bio: res.bio
        });

        this.calculateCompletion();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  /* ===== COMPLETION ===== */
  calculateCompletion() {
    let score = 0;
    if (this.profile?.name) score += 20;
    if (this.profile?.mobile) score += 20;
    if (this.profile?.avatar) score += 20;
    if (this.profile?.bio) score += 20;
    if (this.profile?.skills?.length) score += 20;
    this.completion = score;
  }

  /* ===== UPDATE PROFILE ===== */
  saveProfile() {
    if (this.profileForm.invalid) return;

    this.saving = true;
    this.auth.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.success = 'Profile updated successfully';
        this.saving = false;
        this.loadProfile();
      },
      error: () => {
        this.error = 'Update failed';
        this.saving = false;
      }
    });
  }

  /* ===== ADD SKILL ===== */
  addSkill() {
    if (this.skillForm.invalid) return;

    this.addingSkill = true;
    this.profileService.addSkill(this.skillForm.value).subscribe({
      next: () => {
        this.skillForm.reset({ proficiency: 50 });
        this.addingSkill = false;
        this.loadProfile();
      },
      error: () => {
        this.error = 'Failed to add skill';
        this.addingSkill = false;
      }
    });
  }

  /* ===== ENDORSE ===== */
  endorseSkill(skillId: number) {
    this.profileService.endorseSkill(skillId).subscribe({
      next: () => this.loadProfile(),
      error: () => this.error = 'Already endorsed'
    });
  }

  /* ===== AVATAR UPLOAD ===== */
  onAvatarDrop(event: DragEvent) {
    event.preventDefault();

    const file = event.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    this.uploadingAvatar = true;

    const fd = new FormData();
    fd.append('file', file);

    this.profileService.uploadAvatar(fd).subscribe({
      next: () => {
        this.uploadingAvatar = false;
        this.loadProfile();
      },
      error: () => {
        this.error = 'Avatar upload failed';
        this.uploadingAvatar = false;
      }
    });
  }

  /* ===== HEATMAP ===== */
  loadHeatmap() {
    this.profileService.getHeatmap().subscribe({
      next: res => this.heatmap = res,
      error: () => console.warn('Heatmap unavailable')
    });
  }

  goToPublicProfile() {
    if (this.profile?.id) {
      this.router.navigate(['/u', this.profile.id]);
    }
  }
}
