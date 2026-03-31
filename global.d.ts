// global.d.ts
export {};

declare global {
  interface ApiResponse<T> {
    data: T;
    error?: string;
  }

  type Media = {
    url: string;
    type: string;
  };

  type Timestamp = {
    updatedAt?: string;
    createdAt?: string;
  };

  interface Handbook extends Timestamp {
    _id: string;
    title: string;
    description: string;
    code: string;
    color: string;
    logo?: Media;
    thumbnail?: Media;
    topics: Topic[];
  }

  interface Topic extends Timestamp {
    _id: string;
    title: string;
    order: number;
    sections: Section[];
    active_quiz?: Quiz;
  }

  interface Section extends Timestamp {
    _id: string;
    title: string;
    order: number;
    content: string;
    medias: Media[];
    summaries?: string[];
  }

  interface QuizQuestion extends Timestamp {
    _id?: string;
    question?: string;
    prompt?: string;
    title?: string;
    media?: Media;
    options?: string[];
    choices?: string[];
    answers?: string[];
    answer?: string | number | boolean;
    correctAnswer?: string | number | boolean;
    correct_answer?: string | number | boolean;
    correctIndex?: number;
    answerIndex?: number;
    type?: string;
    explanation?: string;
  }

  interface Quiz extends Timestamp {
    _id?: string;
    title?: string;
    description?: string;
    questions?: QuizQuestion[];
    items?: QuizQuestion[];
    passingScore?: number;
    pass_score?: number;
  }
}
