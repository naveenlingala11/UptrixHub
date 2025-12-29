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
  content: string[];   // paragraphs (verbatim)
  examples?: {
    title: string;
    code: string[];
  }[];
  tasks?: string[];
  quiz?: {
    question: string;
    options: string[];
    answer: string;
  }[];
}
