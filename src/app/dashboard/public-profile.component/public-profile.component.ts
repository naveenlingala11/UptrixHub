import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { ProfileService } from '../services/profile.service';

@Component({
  standalone: true,
  selector: 'app-public-profile',
  imports: [CommonModule],
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent implements OnInit {

  profile: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private title: Title,
    private meta: Meta
  ) { }

  ngOnInit(): void {
    const raw = Number(this.route.snapshot.paramMap.get('id'));

    if (!raw) {
      this.loading = false;
      return;
    }
    const id = Number(raw);

    if (Number.isNaN(id)) {
      this.loading = false;
      return;
    }

    this.profileService.getPublicProfile(raw).subscribe({
      next: res => {
        this.profile = res;
        this.loading = false;

        /* ===== SEO ===== */
        this.title.setTitle(`${res.name} | JavaArray Developer Profile`);

        this.meta.updateTag({
          name: 'description',
          content: res.bio || `${res.name}'s developer profile on JavaArray`
        });

        this.meta.updateTag({ property: 'og:title', content: res.name });
        this.meta.updateTag({
          property: 'og:description',
          content: res.bio || 'JavaArray public developer profile'
        });

        if (res.avatar) {
          this.meta.updateTag({
            property: 'og:image',
            content: res.avatar
          });
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
