export interface CommentData {
  id: number;
  text: string;
  createdAt?: string | Date;
  author: {
    username: string;
  };
}