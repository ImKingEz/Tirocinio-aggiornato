import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DailypageComponent } from './components/dailypage/dailypage.component';

export const routes: Routes = [
  {
    path: "home",
    component: HomeComponent,
    title: "MemeMuseum | Homepage"
  }, {
    path: "daily",
    component: DailypageComponent,
    title: "MemeMuseum | Daily Meme"
  }, {
    path: "",
    redirectTo: "/home",
    pathMatch: 'full'
  }, {
    path: "**",
    redirectTo: "/home"
  }
];
