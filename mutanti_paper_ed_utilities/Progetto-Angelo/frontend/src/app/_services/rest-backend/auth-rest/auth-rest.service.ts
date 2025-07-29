import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthRequest } from './auth-request.type';

@Injectable({
  providedIn: 'root'
})
export class AuthRestService {
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
    return this.http.post(url, signupRequest, this.httpOptions);
  }
}
