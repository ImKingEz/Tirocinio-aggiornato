export interface CommentItem {
  id?: number; 
  text: string;
  User: {
    userName: string;
  };
  createdAt: Date; 
  updatedAt?: Date;
}