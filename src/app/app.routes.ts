import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/* PUBLIC */
import { Home } from './public/home/home';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { VerifyEmail } from './auth/verify-email/verify-email';
import { ResetPassword } from './auth/reset-password/reset-password';
import { OAuthSuccess } from './auth/oauth-success/oauth-success/oauth-success';
import { AllCoursesComponent } from './public/all-courses.component/all-courses.component';
import { CoursesDetailComponent } from './public/courses/courses-detail.component/courses-detail.component';
import { CoursePlayerComponent } from './public/courses/course-player.component/course-player.component';

/* DASHBOARD */
import { DashboardHome } from './dashboard/dashboard-home/dashboard-home';
import { ProfileComponent } from './dashboard/profile/profile';

/* PRACTICE */
import { CodePracticeComponent } from './code/code-practice.component/code-practice.component';
import { Layout } from './dashboard/layout/layout';
import { CoursePlayerPageComponent } from './public/courses/course-player-page.component/course-player-page.component';
import { Roadmap } from './public/roadmap/roadmap';
import { AdminComponent } from './admin/admin.component/admin.component';
import { adminGuard } from './core/guards/admin.guard';
import { PublicProfileComponent } from './dashboard/public-profile.component/public-profile.component';
import { CheckoutComponent } from './public/checkout.component/checkout.component';
import { PricingComponent } from './public/pricing.component/pricing.component';
import { PaymentSuccessComponent } from './public/payment-success.component/payment-success.component';
import { InvoiceComponent } from './utils/invoice.component/invoice.component';
import { DashboardOrdersComponent } from './utils/dashboard-orders.component/dashboard-orders.component';
import { CartComponent } from './public/cart/cart.component/cart.component';
import { SecurityComponent } from './public/legal/security.component/security.component';
import { CookiesComponent } from './public/legal/cookies.component/cookies.component';
import { RefundComponent } from './public/legal/refund.component/refund.component';
import { GdprComponent } from './public/legal/gdpr.component/gdpr.component';
import { PrivacyComponent } from './public/legal/privacy.component/privacy.component';
import { TermsComponent } from './public/legal/terms.component/terms.component';
import { CommunityComponent } from './public/support/community.component/community.component';
import { ContactComponent } from './public/support/contact.component/contact.component';
import { FaqComponent } from './public/support/faq.component/faq.component';
import { FeedbackComponent } from './public/support/feedback.component/feedback.component';
import { HelpComponent } from './public/support/help.component/help.component';

export const routes: Routes = [

  /* 🌍 PUBLIC SITE */
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'verify-email', component: VerifyEmail },
      { path: 'reset-password', component: ResetPassword },
      { path: 'oauth-success', component: OAuthSuccess },
      { path: 'roadmaps', component: Roadmap },

      //profile
      {
        path: 'u/:id',
        component: PublicProfileComponent
      },

      /* 💰 PRICING + CHECKOUT */
      { path: 'pricing', component: PricingComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'payment-success', component: PaymentSuccessComponent },
      { path: 'invoice/:id', component: InvoiceComponent },
      { path: 'orders', component: DashboardOrdersComponent },
      { path: 'cart', component: CartComponent },

      {
        path: 'legal',
        children: [
          { path: 'privacy', component: PrivacyComponent },
          { path: 'terms', component: TermsComponent },
          { path: 'security', component: SecurityComponent },
          { path: 'cookies', component: CookiesComponent },
          { path: 'refund', component: RefundComponent },
          { path: 'gdpr', component: GdprComponent }
        ]
      },
      {
        path: 'support',
        children: [
          { path: 'community', component: CommunityComponent },
          { path: 'help', component: HelpComponent },
          { path: 'faq', component: FaqComponent },
          { path: 'contact', component: ContactComponent },
          { path: 'feedback', component: FeedbackComponent }
        ]
      },

      /* 📚 COURSES */
      { path: 'courses', component: AllCoursesComponent },
      { path: 'courses/:id', component: CoursesDetailComponent },
      { path: 'courses/:id/learn', component: CoursePlayerPageComponent },]
  },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard]
  },

  /* 💻 PRACTICE */
  { path: 'practice/code', component: CodePracticeComponent },

  /* 🔐 DASHBOARD */
  {
    path: 'dashboard',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: DashboardHome },
      { path: 'profile', component: ProfileComponent }
    ]
  },

  /* ❌ FALLBACK */
  { path: '**', redirectTo: '' },

];
