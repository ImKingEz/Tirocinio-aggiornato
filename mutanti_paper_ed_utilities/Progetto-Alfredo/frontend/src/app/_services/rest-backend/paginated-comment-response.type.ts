import { CommentData } from "./comment-item.type";

export interface PaginatedCommentResponse {
  comments: CommentData[];
  totalComments: number;
  totalPages: number;
  currentPage: number;
}