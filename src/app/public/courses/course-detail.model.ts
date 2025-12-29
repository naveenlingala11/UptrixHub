export interface Lesson {
  id: string;
  title: string;
  content: string;
  locked?: boolean;
}

export interface Section {
  title: string;
  lessons: Lesson[];
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  priceType: 'FREE' | 'PRO';
  syllabus: Section[];
  price?: number;   // ✅ optional
}

