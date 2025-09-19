import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { MemeDelGiornoComponent } from './meme-del-giorno/meme-del-giorno.component';
import { LogoutComponent } from './logout/logout.component';
import { UploadMemeComponent } from './upload-meme/upload-meme.component';
import { authGuard } from './_guards/auth/auth.guard';

export const routes: Routes = [
  {
    path: "",
    component: HomePageComponent,
    title: "Meme Museum"
  }, {
    path: "login",
    component: LoginComponent,
    title: "Login | Meme Museum"
  }, {
    path: "signup",
    component: SignupComponent,
    title: "Sign up | Meme Museum"
  },{
    path: "meme-del-giorno",
    component: MemeDelGiornoComponent,
    title: "Meme del giorno | Meme Museum"
  },{
    path: "logout",
    component: LogoutComponent,
    title: "Log out | Meme Museum"
  },{
    path: "carica-meme",
    component: UploadMemeComponent,
    title: "Carica Meme | Meme Museum",
    canActivate: [authGuard]
  }
];

