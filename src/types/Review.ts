export interface Review {
  id: string;
  userId: string;
  userAvatar?: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  userId: string;
  userAvatar?: string;
  userName: string;
  comment: string;
  date: string;
  isAdmin: boolean;
}