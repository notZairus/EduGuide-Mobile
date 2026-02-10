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
    content: unknown;
    medias: Media[];
  }
}
