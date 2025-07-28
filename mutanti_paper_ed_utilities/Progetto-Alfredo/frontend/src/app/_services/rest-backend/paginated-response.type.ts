import { MemeItem } from './meme-item.type';

export interface PaginatedMemeResponse {
  memes: MemeItem[];
  totalMemes: number;
  totalPages: number;
  currentPage: number;
}