import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MemeApiResponse } from './meme-response.type';
import { MemeItem } from './meme.type';
import { SearchParams } from '../../search/search.service';
import { tap } from 'rxjs/operators';
import { CommentApiResponse } from './comment-response.type';

@Injectable({
  providedIn: 'root'
})
export class MemeRestService {
  url = "http://localhost:3000/memes" 
  constructor(private http: HttpClient) { }

  private postCreatedSource = signal(0);
  postCreated$ = this.postCreatedSource.asReadonly();

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  getMemes(filters: SearchParams) {
    let params = new HttpParams();
    if (filters.size) {
      params = params.append('size', filters.size);
    }
    if (filters.page) {
    params = params.append('page', filters.page);
    }
    if (filters.tags) {
      params = params.append('tags', filters.tags);
    }
    if (filters.selectedDate) {
      params = params.append('fromdate', filters.selectedDate);
    }
    if (filters.sortType) {
      params = params.append('sort', filters.sortType);
    }
    if (filters.sortDirection) {
      params = params.append('direction', filters.sortDirection);
    }

    return this.http.get<MemeApiResponse>(this.url, { params: params, headers: this.httpOptions.headers });
  }

  uploadMeme(tagsValue: string, selectedFile: File) {
    const formData = new FormData();
    formData.append('tags', tagsValue);
    formData.append('memeImage', selectedFile, selectedFile.name);

    return this.http.post<MemeItem>(this.url, formData).pipe(
      tap(() => {
        this.postCreatedSource.update(value => value + 1);
      })
    );;
  }

  toggleUpvote(memeItem: MemeItem) {
    const url = `${this.url}/${memeItem.id}/upvote`; 
    return this.http.put<MemeItem>(url, {}, this.httpOptions);
  }

  toggleDownvote(memeItem: MemeItem) {
    const url = `${this.url}/${memeItem.id}/downvote`; 
    return this.http.put<MemeItem>(url, {}, this.httpOptions);
  }

  getDailyMeme() {
    const url = `${this.url}/daily`; 
    return this.http.get<{meme: MemeItem, bucketType: string}>(url, this.httpOptions);
  }

  fetchMoreComments(memeId: number, page: number) {
    const url = `${this.url}/${memeId}/comments`;
    let params = new HttpParams();
    params = params.append('page', page);
    params = params.append('size', 10);
    return this.http.get<CommentApiResponse>(url, { params: params, headers: this.httpOptions.headers });
  }

  sendComment(memeId: number, text: string) {
    const url = `${this.url}/${memeId}/comments`;
    return this.http.post<MemeItem>(url, {commentText: text}, this.httpOptions);
  }
}
