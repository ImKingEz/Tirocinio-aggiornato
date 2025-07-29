import { MemeItem } from "./meme.type";

export interface MemeApiResponse {
  totalPages: number;
  count: number;
  rows: MemeItem[];
}