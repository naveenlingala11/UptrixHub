export interface Course {
  id: string; // ✅ REQUIRED
  title: string;
  description: string;
  priceType: 'FREE' | 'PRO';
  price: number;
  unlocked: boolean;

  // UI-only
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  progress?: number;
  locked?: boolean;
}
