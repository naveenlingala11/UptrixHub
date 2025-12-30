export interface CoursePlayerData {
  courseId: string;
  title: string;
  chapters: Chapter[];
}

export interface Chapter {
  chapterId: string;
  title: string;
  sections: Section[];
}

export interface Section {
  sectionId: string;
  heading: string;
  content: ContentBlock[];   // ✅ FIXED
  examples?: ExampleBlock[];
  tasks?: string[];
  quiz?: QuizBlock[];
}

export interface ContentBlock {
  type:
    | 'paragraph'
    | 'highlight'
    | 'note'
    | 'list'
    | 'ordered-list'
    | 'code'
    | 'image';

  text?: string;
  items?: string[];
  title?: string;
  code?: string[];
  language?: string;
  src?: string;
  caption?: string;
}

export interface ExampleBlock {
  title: string;
  code: string[];
  language?: string;
}

export interface QuizBlock {
  question: string;
  options: string[];
  answer: string;
}
