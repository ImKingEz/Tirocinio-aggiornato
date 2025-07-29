import { CommentItem } from "./comment.type"

export interface CommentApiResponse {
  totalPages: number;
  count: number;
  rows: CommentItem[];
}