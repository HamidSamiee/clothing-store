export interface Review {
  id: string;
  userId: string;
  productId: string; 
  userAvatar?: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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