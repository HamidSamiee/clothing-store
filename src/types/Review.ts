export interface Question {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  question: string;
  answers: Answer[];
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  answer: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}