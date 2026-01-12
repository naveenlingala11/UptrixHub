import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

/* ===== LAYOUTS ===== */
import { Layout } from './dashboard/layout/layout';

/* ===== PUBLIC ===== */
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { VerifyEmail } from './auth/verify-email/verify-email';
import { ResetPassword } from './auth/reset-password/reset-password';
import { OAuthSuccess } from './auth/oauth-success/oauth-success/oauth-success';
import { RoadmapComponent } from './public/roadmap/roadmap';

/* ===== COURSES ===== */
import { AllCoursesComponent } from './public/all-courses.component/all-courses.component';
import { CoursesDetailComponent } from './public/courses/courses-detail.component/courses-detail.component';
import { CoursePlayerPageComponent } from './public/courses/course-player-page.component/course-player-page.component';

/* ===== DASHBOARD ===== */
import { DashboardHome } from './dashboard/dashboard-home/dashboard-home';
import { ProfileComponent } from './dashboard/profile/profile';
import { PublicProfileComponent } from './dashboard/public-profile.component/public-profile.component';

/* ===== PRACTICE ===== */
import { CodePracticeComponent } from './code/code-practice.component/code-practice.component';

/* ===== PSEUDO ===== */
import { PseudoCodeComponent } from './public/pseudo-code/pseudo-code.component/pseudo-code.component';
import { PseudoQuestionsComponent } from './public/pseudo-code/pseudo-questions.component/pseudo-questions.component';
import { PseudoTestComponent } from './public/pseudo-code/pseudo-test.component/pseudo-test.component';
import { AdminPseudoPreviewComponent } from './admin/analytics/admin-pseudo-preview.component/admin-pseudo-preview.component';

/* ===== GAMES ===== */
import { GamesComponent } from './games/games/games.component/games.component';
import { BugHunterComponent } from './games/games/bug-hunter.component/bug-hunter.component';

/* ===== ADMIN ===== */
import { AdminDashboardComponent } from './admin/dashboard/admin-dashboard.component/admin-dashboard.component';
import { AdminUsersComponent } from './admin/users/admin-users.component/admin-users.component';
import { AdminAnalyticsComponent } from './admin/analytics/admin-analytics.component/admin-analytics.component';
import { AdminXpRulesComponent } from './games/admin/admin-xp-rules.component/admin-xp-rules.component';
import { AdminBugHunterComponent } from './games/admin/admin-bug-hunter.component/admin-bug-hunter.component';
import { AdminBugHunterBulkComponent } from './admin/admin/bulk/admin-bug-hunter-bulk.component/admin-bug-hunter-bulk.component';
import { AchievementsComponent } from './games/achievements/achievements.component/achievements.component';

/* ===== COMMERCE ===== */
import { PricingComponent } from './public/pricing.component/pricing.component';
import { CheckoutComponent } from './public/checkout.component/checkout.component';
import { PaymentSuccessComponent } from './public/payment-success.component/payment-success.component';
import { InvoiceComponent } from './utils/invoice.component/invoice.component';
import { DashboardOrdersComponent } from './utils/dashboard-orders.component/dashboard-orders.component';
import { CartComponent } from './public/cart/cart.component/cart.component';

/* ===== LEGAL & SUPPORT ===== */
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
import { AdminLayoutComponent } from './admin/layout/admin-layout.component/admin-layout.component';
import { PublicLeaderboardComponent } from './games/leaderboard/public-leaderboard.component/public-leaderboard.component';
import { PublicHomeComponent } from './public/home/public-home.component/public-home.component';
import { UserHomeComponent } from './public/home/user-home.component/user-home.component';
import { HomeShellComponent } from './public/home/home-shell.component/home-shell.component';
import { MockInterviewComponent } from './public/features/mock/mock-interview.component/mock-interview.component';
import { ResumeCheckerComponent } from './public/features/resume/resume-checker.component/resume-checker.component';
import { DailyChallengeComponent } from './public/features/daily-challenge.component/daily-challenge.component';
import { AdminDailyChallengeComponent } from './public/features/admin/admin-daily-challenge.component/admin-daily-challenge.component';
import { RoadmapLandingComponent } from './public/roadmap/roadmap-landing.component/roadmap-landing.component';
import { AdminRoadmapComponent } from './admin/admin/admin-roadmap.component/admin-roadmap.component';
import { TicTacToeComponent } from './games/games/tic-tac-toe.component/tic-tac-toe.component';
import { SudokuComponent } from './games/games/sudoku.component/sudoku.component';
import { Game2048Component } from './games/2048/game-2048/game-2048';
import { TowerOfHanoiComponent } from './games/games/hanoi/tower-of-hanoi.component/tower-of-hanoi.component';
import { UnblockMeComponent } from './games/games/unblock-me/unblock-me.component/unblock-me.component';
import { ChessComponent } from './games/games/chess/chess.component/chess.component';
export const routes: Routes = [

  /* ================= PUBLIC SITE ================= */
  {
    path: '',
    component: Layout,
    children: [

      { path: '', component: HomeShellComponent },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'verify-email', component: VerifyEmail },
      { path: 'reset-password', component: ResetPassword },
      { path: 'oauth-success', component: OAuthSuccess },
      { path: 'roadmap', component: RoadmapLandingComponent },
      { path: 'roadmap/:id', component: RoadmapComponent },

      /* 🧠 PSEUDO CODE */
      {
        path: 'pseudo-code',
        children: [
          { path: '', component: PseudoCodeComponent },
          { path: ':skill', component: PseudoQuestionsComponent },
          {
            path: ':skill/test',
            component: PseudoTestComponent,
            canActivate: [authGuard]
          }
        ]
      },

      /* 🔍 ADMIN PREVIEW (still public layout – correct) */
      {
        path: 'admin/pseudo/preview/:skill',
        component: AdminPseudoPreviewComponent,
        canActivate: [authGuard, adminGuard]
      },

      /* 👤 PUBLIC PROFILE */
      { path: 'u/:id', component: PublicProfileComponent },

      /* 🎮 GAMES */
      { path: 'games', component: GamesComponent },
      { path: 'games/bug-hunter', component: BugHunterComponent },
      { path: 'games/tic-tac-toe', component: TicTacToeComponent },
      { path: 'games/sudoku', component: SudokuComponent },
      { path: 'games/2048', component: Game2048Component },
      { path: 'games/hanoi', component: TowerOfHanoiComponent },
      { path: 'games/unblock-me', component: UnblockMeComponent },
      { path: 'games/chess', component: ChessComponent },

      /* ================= PUBLIC LEADERBOARD ================= */
      {
        path: 'leaderboard', component: PublicLeaderboardComponent
      },

      /* 💰 COMMERCE */
      { path: 'pricing', component: PricingComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'payment-success', component: PaymentSuccessComponent },
      { path: 'invoice/:id', component: InvoiceComponent },
      { path: 'orders', component: DashboardOrdersComponent },
      { path: 'cart', component: CartComponent },

      /* 📚 COURSES */
      { path: 'courses', component: AllCoursesComponent },
      { path: 'courses/:id', component: CoursesDetailComponent },
      { path: 'courses/:id/learn', component: CoursePlayerPageComponent },

      /* ⚖ LEGAL */
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

      /* 🧩 SUPPORT */
      {
        path: 'support',
        children: [
          { path: 'community', component: CommunityComponent },
          { path: 'help', component: HelpComponent },
          { path: 'faq', component: FaqComponent },
          { path: 'contact', component: ContactComponent },
          { path: 'feedback', component: FeedbackComponent }
        ]
      }
    ]
  },

  /* ================= PRACTICE ================= */
  { path: 'practice/code', component: CodePracticeComponent },

  /* ================= DASHBOARD ================= */
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

  {
    path: 'public-home',
    component: PublicHomeComponent
  },

  {
    path: 'user-home',
    component: UserHomeComponent
  },
  /* ================= ADMIN (🔥 FIXED) ================= */
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
      { path: 'achievements', component: AchievementsComponent },
      { path: 'xp-rules', component: AdminXpRulesComponent },
      { path: 'games/bug-hunter', component: AdminBugHunterComponent },
      { path: 'games/bug-hunter/bulk', component: AdminBugHunterBulkComponent },
      { path: 'daily-challenge', component: AdminDailyChallengeComponent },
      { path: 'roadmaps', component: AdminRoadmapComponent },
    ]
  },

  // FEATURES MOCK INTERVIEW
  { path: 'mock-interview', component: MockInterviewComponent },
  { path: 'resume-checker', component: ResumeCheckerComponent },
  { path: 'daily-challenge', component: DailyChallengeComponent },

  /* ================= FALLBACK ================= */
  { path: '**', redirectTo: '' }
];
