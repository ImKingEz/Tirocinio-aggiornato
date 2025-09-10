import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MemeItem } from './meme-item.type';
import { AuthRequest } from './auth-request.type';
import { PaginatedMemeResponse } from './paginated-response.type';
import { PaginatedCommentResponse } from './paginated-comment-response.type';

@Injectable({
  providedIn: 'root'
})
export class RestBackendService {

  url = "http://localhost:3000" 
  constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  login(loginRequest: AuthRequest){
    const url = `${this.url}/auth`; 
    return this.http.post<string>(url, loginRequest, this.httpOptions);
  }

  signup(signupRequest: AuthRequest){
    const url = `${this.url}/signup`; 
    console.log(signupRequest);
    return this.http.post(url, signupRequest, this.httpOptions);
  }

  getMemeOfTheDay() {
    const url = `${this.url}/memes/meme-of-the-day`;
    return this.http.get<MemeItem>(url, this.httpOptions);
  }

  searchMemes(filters: any) {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.append(key, value.toString());
      }
    });
    const url = `${this.url}/memes/search`;
    return this.http.get<PaginatedMemeResponse>(url, { params });
  }
  
  upvoteMeme(memeId: number) {
    const url = `${this.url}/memes/${memeId}/upvote`;
    return this.http.put<MemeItem>(url, this.httpOptions);
  }

  downvoteMeme(memeId: number) {
    const url = `${this.url}/memes/${memeId}/downvote`;
    return this.http.put<MemeItem>(url, this.httpOptions);
  }

  getComments(memeId: number, page: number) {
    const url = `${this.url}/memes/${memeId}/comments`;
    let params = new HttpParams().set('page', page.toString());
    
    return this.http.get<PaginatedCommentResponse>(url, { params });
  }

  postComment(memeId: number, text: string) {
    const url = `${this.url}/memes/${memeId}/comment`;
    return this.http.post<MemeItem>(url, { text });
  }

  uploadMeme(formData: FormData) {
    const url = `${this.url}/memes`;
    return this.http.post<MemeItem>(url, formData);
  }
}
