import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../core/services/auth-state.service';
import { Observable, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../public/cart/cart.service';

interface CatalogItem {
  label: string;
  subtitle: string;
  preview: string;
  route: string;
  category: string;
  svg: SafeHtml;
}

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FormsModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit, OnDestroy {

  isLoggedIn$: Observable<boolean>;

  /** dropdown state */
  activeDropdown: string | null = null;

  /** mobile menu */
  mobileOpen = false;

  cartCount = 0;
  private cartSub!: Subscription;

  userName = '';
  userAvatar: string | null = null;

  constructor(
    private authState: AuthStateService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cartService: CartService
  ) {
    this.isLoggedIn$ = this.authState.isLoggedIn$;
  }

  /* ========== DROPDOWN ========== */

  openOnHover(name: string) {
    if (!this.activeDropdown) {
      this.activeDropdown = name;
    }
  }

  toggleOnClick(name: string, event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  /* ========== KEYBOARD ========== */

  onKey(event: KeyboardEvent, name: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.activeDropdown = name;
    }
    if (event.key === 'Escape') {
      this.closeDropdown();
    }
  }

  /* ========== MOBILE ========== */

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  /* close on outside click */
  @HostListener('document:click')
  onOutsideClick() {
    this.closeDropdown();
    this.mobileOpen = false;
  }

  logout() {
    this.authState.logout();
    this.router.navigate(['/login']);
  }

  // ===== CATALOG STATE =====
  isCatalogOpen = false;
  activeCategory = 'backend';
  searchText = '';
  focusedIndex = 0;

  // ===== CATEGORIES =====
  categories = [
    { key: 'backend', label: 'Backend' },
    { key: 'frontend', label: 'Frontend' },
    { key: 'devops', label: 'DevOps' },
    { key: 'cloud', label: 'Cloud' }
  ];

  // ===== CATALOG ITEMS =====
  catalogItems = [
    // BACKEND
    {
      label: 'Core Java',
      category: 'backend',
      route: '/courses/core-java',
      icon: 'assets/images/icons/java-4-logo-svgrepo-com.svg',
      preview: 'OOPS, Collections, JVM, Multithreading'
    },
    {
      label: 'Spring Framework',
      category: 'backend',
      route: '/courses/spring',
      icon: 'assets/images/icons/spring-svgrepo-com.svg',
      preview: 'IOC, DI, REST APIs'
    },

    // FRONTEND
    {
      label: 'Angular',
      category: 'frontend',
      route: '/courses/angular',
      icon: 'assets/images/icons/angular-icon-svgrepo-com.svg',
      preview: 'Components, RxJS, Routing'
    },
    {
      label: 'HTML',
      category: 'frontend',
      route: '/courses/html',
      icon: 'assets/images/icons/html-5-svgrepo-com.svg',
      preview: 'Semantic HTML, SEO'
    },
    {
      label: 'CSS',
      category: 'frontend',
      route: '/courses/css',
      icon: 'assets/images/icons/css-svgrepo-com.svg',
      preview: 'Flexbox, Grid, Animations'
    },

    // DEVOPS
    {
      label: 'Git',
      category: 'devops',
      route: '/courses/git',
      icon: 'assets/images/icons/git-svgrepo-com.svg',
      preview: 'Version control & workflows'
    },
    {
      label: 'Jenkins',
      category: 'devops',
      route: '/courses/jenkins',
      icon: 'assets/images/icons/jenkins-svgrepo-com.svg',
      preview: 'CI / CD pipelines'
    },

    // CLOUD
    {
      label: 'AWS',
      category: 'cloud',
      route: '/courses/aws',
      icon: 'assets/images/icons/aws-svgrepo-com.svg',
      preview: 'EC2, S3, IAM'
    },
    {
      label: 'Azure DevOps',
      category: 'cloud',
      route: '/courses/azure-devops',
      icon: 'assets/images/icons/azure-devops-svgrepo-com.svg',
      preview: 'Pipelines & boards'
    }
  ];

  // ===== GET FILTERED ITEMS =====
  get filteredItems() {
    return this.catalogItems
      .filter(i => i.category === this.activeCategory)
      .filter(i =>
        i.label.toLowerCase().includes(this.searchText.toLowerCase())
      );
  }

  // ===== ACTIONS =====
  toggleCatalog(e: Event) {
    e.stopPropagation();
    this.isCatalogOpen = !this.isCatalogOpen;
  }

  selectCategory(key: string) {
    this.activeCategory = key;
    this.focusedIndex = 0;
  }

  handleKeydown(e: KeyboardEvent) {
    if (!this.isCatalogOpen) return;

    if (e.key === 'ArrowDown') {
      this.focusedIndex =
        (this.focusedIndex + 1) % this.filteredItems.length;
    }

    if (e.key === 'ArrowUp') {
      this.focusedIndex =
        (this.focusedIndex - 1 + this.filteredItems.length) %
        this.filteredItems.length;
    }

    if (e.key === 'Enter') {
      const item = this.filteredItems[this.focusedIndex];
      if (item) location.href = item.route;
    }

    if (e.key === 'Escape') {
      this.isCatalogOpen = false;
    }
  }

  @HostListener('document:click')
  closeCatalog() {
    this.isCatalogOpen = false;
  }
  ngOnInit() {
    // EXISTING CODE
    this.cartSub = this.cartService.cartCount$.subscribe(
      count => this.cartCount = count
    );

    // DASHBOARD USER

    this.authState.user$.subscribe(user => {
      if (user) {
        this.userName = user.name ?? '';
        this.userAvatar = user.avatar ?? null;
      }
    });
  }


  get initials(): string {
    return this.userName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
  }
}