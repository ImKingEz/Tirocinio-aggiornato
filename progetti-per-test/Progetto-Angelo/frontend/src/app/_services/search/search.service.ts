import { Injectable, signal } from '@angular/core';

export interface SearchParams {
  tags?: string;
  selectedDate?: string;
  sortType: "createdAt" | "upvotes" | "downvotes";
  sortDirection: "ASC" | "DESC";
  page: number;
  size?: number;
}

const initialSearchParams: SearchParams = {
  tags: '',
  selectedDate: '',
  sortType: 'createdAt',
  sortDirection: 'DESC',
  page: 1,
  size: 10,
};

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchParams = signal<SearchParams>(initialSearchParams);

  updateSearchParams(params: Partial<SearchParams>): void {
    this.searchParams.update(current => ({ ...current, ...params }));
  }

  resetSearchParams(): void {
    this.searchParams.set(initialSearchParams);
  }
}