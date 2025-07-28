import { Injectable, WritableSignal, computed, effect, signal } from '@angular/core';
import { jwtDecode } from "jwt-decode";
import { AuthState } from './auth-state.type';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  authState: WritableSignal<AuthState> = signal<AuthState>(this.getInitialState())

  user = computed(() => this.authState().user);
  token = computed(() => this.authState().token);
  isAuthenticated = computed(() => this.authState().isAuthenticated);

  constructor(){
    effect( () => {
      const token = this.authState().token;
      const user = this.authState().user;
      if(token !== null){
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
      if(user !== null){
        localStorage.setItem("user", user);
      } else {
        localStorage.removeItem("user");
      }
    });
  }

  async updateToken(token: string) {
    const decodedToken: any = jwtDecode(token);
    const user = decodedToken.user;
    this.authState.set({
      user: user,
      token: token,
      isAuthenticated: this.verifyToken(token)
    })
  }

  getInitialState(): AuthState {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const isAuthenticated = this.verifyToken(token);

    if (isAuthenticated) {
      return { user, token, isAuthenticated: true };
    }
    return { user: null, token: null, isAuthenticated: false };
  }


  verifyToken(token: string | null): boolean {
    if(token !== null){
      try{
        const decodedToken = jwtDecode(token);
        const expiration = decodedToken.exp;
        if(expiration === undefined || Date.now() >= expiration * 1000){
          return false;
        } else {
          return true;
        }
      } catch(error) {
        return false;
      }
    }
    return false;
  }

  logout(){
    this.authState.set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  }
}
