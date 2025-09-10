import { Tag } from "./tag-item.type";

export interface MemeItem {
  id: number;
  imageUrl: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  uploaderUsername: string;
  commentCount: number;
  Tags: Tag[];
  userVote: 1 | -1 | null;
}