import { TagItem } from "./tag.type";
import { CommentItem } from "./comment.type";

export interface MemeItem {
  id: number;
  imgPath: string;
  upvotes: number;
  downvotes: number;
  UserUserName: string;
  Tags: TagItem[];
  Comments: CommentItem[];
  totalComments: number;
  createdAt: Date;
  updatedAt: Date;
  formattedDate?: string;
  userVoteStatus: 0 | 1 | -1;
}
